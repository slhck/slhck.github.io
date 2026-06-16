---
layout: post
title: "Making terminalcp Synchronous — Improving LLM CLI Calls"
date: 2026-06-15
categories: software
---

I often let Claude Code drive interactive terminal sessions on my remote servers — SSH shells, Rails consoles, `psql`, the occasional debugger. I do this via [terminalcp](https://github.com/badlogic/terminalcp), but there is an annoyance: to read the output of a command, the agent needs to send the command, then `sleep` for some arbitrary number of seconds, and *then* grab whatever appeared on screen.

Over a high-latency SSH connection, or with unknown workloads, that guess is either too short (you read half an answer and retry) or too long (you burn seconds doing nothing). Either way it's slow, and the model has no real idea how long a command will take. It also takes multiple expensive tool calls to achieve one thing.

So I had Claude add a synchronous `run` action to my fork of terminalcp. This post is about why the old pattern is slow, what I changed, and the performance gains — which are mostly about *not waiting for nothing*.

Big shoutout to Mario for building terminalcp in the first place! He wrote up the design thinking in [MCP vs CLI](https://mariozechner.at/posts/2025-08-15-mcp-vs-cli/), and it's worth your time. He benchmarked terminalcp against `tmux` and `screen` and found that for anything beyond trivial interactions, the cleaner output paid for itself in fewer tokens and fewer failures.

**TL;DR:** terminalcp polls for output; it has no "block until the command is done" call, so agents fake it with a guessed `sleep`. I added a `run` action that sends input and returns the instant the command actually finishes, with the shell exit code attached. A 3-second command now takes ~3 seconds instead of "`sleep 8` to be safe", and instant commands come back in well under a second.

## Why the sleep-and-poll thing is slow

terminalcp, just like `tmux`, is fundamentally poll-based when used with LLMs. You send input, and then separately you ask for output. So an agent ends up doing this, across three separate tool calls:

```bash
terminalcp stdin myhost "systemctl status nginx" ::Enter
sleep 4    # ...how long, though? who knows
terminalcp stdout myhost
```

The model is essentially betting on the round-trip latency plus the command's runtime. `tmux` would not help here, by the way. It has the exact same poll architecture, and it's actually *worse* for this use case because it has no built-in incremental read.

## The fix: a `run` action that actually waits

What I wanted was simple to state: send the input, block on the server side until the command is done, then return only that command's new output. However, detecting when a command is done inside a "dumb" terminal is hard. There's no `$?` magically available to get the output status, and there is no event that fires. Therefore, `run` has not one but three different modes for detecting completion:

### 1. Shell commands: inject an exit-code marker

For a plain shell append a stop token, as the LLM folks call it (Claude likes the word "sentinel"), that prints when the command finishes, then watch for it. terminalcp does this for you when you pass `--marker`:

```bash
terminalcp run myhost "systemctl is-active nginx" --marker
# active
# [exit: 0]
```

Under the hood it sends your command followed by `; printf '\nTCPDONE<nonce> %d\n' "$?"`, waits until that line shows up, strips it back out, and appends the exit code.

### 2. REPLs: print your own sentinel

The marker trick assumes a shell where you can append `; printf ... $?`. A Rails console or `psql` has no such syntax.

Modern line-editing REPLs redraw the prompt on every single keystroke. So for REPLs, `run` matches a regex against the rendered screen and only scans the *new* lines. And the robust pattern is the REPL analog of the shell marker: end your command with something that prints a unique token, and match it anchored.

```bash
# Rails console: get just the result, reliably
terminalcp run rails "User.count; puts 'TCPDONE'" ::Enter --until "^TCPDONE"

# psql
terminalcp run db "SELECT count(*) FROM users; \echo TCPDONE" ::Enter --until "^TCPDONE"
```

Because `^TCPDONE` only matches when your `puts`/`\echo` actually runs and prints at column 0, this stays correct even when the command is silent for two seconds first. The echoed input line contains `TCPDONE` too, but in the middle of the line, inside quotes, so the anchor helps us ignore it.

### 3. Fallback: wait for the screen to go quiet

When you can't print a stop token, `run` can fall back to idle detection: return once the rendered screen stops changing for `--idle` milliseconds. This is useful for entering a sub-shell or an SSH connection:

```bash
terminalcp run jump "ssh target-host" --idle 1000
```

Everything is limited by `--timeout` (default 30s). On a timeout it returns whatever it has, and leaves the command running. You can read the rest later with `stdout`/`stream`.

## The performance gains

Well duh, commands now take as long as they take. I just made some tests against a real server of mine:

- An instant command (`hostname`, `whoami`, a `systemctl` check) comes back in roughly **0.5–0.8 seconds**, end to end — basically the SSH round-trip. Previously the floor was however many seconds the model decided to `sleep`, which in practice was 3–5 to be "safe".
- A `sleep 3 && echo done` returns in **~3.1 seconds**, expected, huh?
- A `time.sleep(2)` inside a Python REPL — now returns at **~2.7 seconds**.

Now, in general, this is largely also a token win, because it's one tool call instead of three (`stdin`, `sleep`, `stdout`), and `run` returns only the command's output — the echoed input line and the sentinel are stripped — instead of the agent re-fetching the entire scrollback on every poll.

## Limitations

- `--marker` is shell-only, and you cannot use it for a command that ends the shell — `exit`, `logout`, or anything that replaces the process.
- This lives in [my fork](https://github.com/slhck/terminalcp) for now and isn't upstreamed. I don't think we'll see upstream changes merged, as Mario has probably moved on to other things.

## Conclusion

This is a small change, but I hope it speeds up my workflow quite a bit. I guess the optimal solution would be to have a persistent remote session that I can drive locally, via a socket, like SSH itself, but with some agent protocol on top. Let's see if I find some time to investigate that.
