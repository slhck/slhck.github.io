---
layout: post
title: Agent Handoffs and the Human Bottleneck
date: 2026-07-10
categories: software
tags: ai
---

Agent-based coding tools have reached the point where I can hand them a substantial piece of work and expect useful results. Claude Code and Codex, paired with the newest models, can investigate a codebase, implement a feature, run tests, and keep going for far longer than I would have expected even a year ago.

That does not mean I can throw an entire project at one agent session and come back later. The limiting factor is still context, both for the model and for me.

## Keep the context small

Models now have context windows measured in hundreds of thousands of tokens, sometimes more. But in practice, a large window is not always useful.

This is, of course, not something I have discovered initially — [it is called context rot](https://www.trychroma.com/research/context-rot): a model's ability to use information can get worse well before its nominal context window is full, especially when the relevant detail is buried among many other tokens that distract the model's attention. The exact cutoff point varies by model and task. This is also related to the ["lost in the middle" problem](https://arxiv.org/abs/2307.03172): even long-context models can struggle when the information they need sits in the middle of a long prompt. (This is why it is better to first dump large context and _then_ ask your actual question in the prompt.)

In my own work, context rot would show up once a session had accumulated a lot of tool output, logs, failed attempts, and half-relevant discoveries. At some point Opus even hallucinated my username in a path!

The obvious answer is to avoid putting useless material into the context in the first place. An agent should not have to read the whole repository to find the right module. It should not waste 20k tokens parsing a test log that only contains one meaningful error line.

Repository structure matters here, just as it always has for humans. Clear module boundaries, sensible names, and small files with dedicated responsibilities make it easier to find the right place to work. Repository-level instructions help too. A README, `CLAUDE.md`, or `AGENTS.md` can tell an agent where things live, how the project is tested, and which workflows are worth following when it needs to diagnose a problem.

Newer models have become smarter at this, of course, and they will `grep` for what they need, if given information about log structure.

I have found repeatable troubleshooting instructions especially valuable. Instead of letting an agent discover its own inefficient way to run the same diagnostic workflow each time, I document the commands, the relevant outputs, and where it should look next. Recent versions of Claude Code also try to keep large command output out of the main conversation and query it later from scratch files. That is a sensible default. Logs are often useful, but they should not fill up the context window when they contain no useful information.

## Handoffs are better than invisible compaction

Eventually, a long-running task still needs a new context. There are two common ways to get one.

1. **Built-in compaction**. The `/compact` tool summarizes the conversation and continues in a smaller context. This is convenient, and there are cases where it works well. You can also hint at what the summary should preserve. I used compaction a lot at first, but I found it too opaque. When I came back to a session, I could not easily see what had made it into the compacted state, what had been discarded, or which assumptions had survived the process. Claude would at least tell you which files it re-read, but that's it. For a long task, those are exactly the things I want to inspect!

2. **Explicit handoff**. The other approach is an explicit document or prompt that you pass on to a new agent instance. This has become my preferred way to continue work. It gives me a natural breakpoint in my work — a forced [Human in the Loop](https://en.wikipedia.org/wiki/Human-in-the-loop): I can look at the result, question an assumption, change direction, and then let the next session start with a clean context.

The handoff can be manual, but I prefer making it a repeatable workflow. I use a handoff [skill](https://agentskills.io/home) based on [one Matt Pocock shared](https://github.com/mattpocock/skills/blob/main/skills/in-progress/claude-handoff/SKILL.md). It asks the agent to restate the original goal, summarize the work already done, point to the important files, and describe the current state and next steps. In addition to Matt's version, I let the agent add a list of "undocumented gotchas".

That last part is, at least to me, the most important. During its initial investigation, an agent often finds constraints, dead ends, or questionable assumptions that never become part of the repository. Or it learns something new about the process. Without a handoff, that information disappears with the session.

## Make state visible beyond one session

I store the handoffs in a `docs` folder inside the repository, and commit them. They get updated as agents work on them. Handoffs inside a repository are enough when I am the only person working on it. With a team, or simply with enough context switching, I want the state to be visible outside the agent conversation as well.

For me, that is often Trello. I keep a high-level summary of what I am working on, where it stands, and what should happen next. The summaries can be generated by an agent and link back to the more detailed handoff document in the repository. I've written [`trelloctl`](https://github.com/slhck/trelloctl), a Trello CLI, for exactly this purpose.

This helps me reattach my own brain to the work. I may return to something after two or three days and not remember every branch I considered, every half-finished implementation, or why I chose one direction over another. A short task summary and a detailed handoff help me pick it up again.

## Picking the right models for workflows and subagents

I used to rely mostly on a single long Claude Opus session. These days I have been testing Codex with the newer GPT models more, and I have also used Claude for longer implementation runs. The useful pattern seems to be a strong model directing smaller, more focused agents.

My current model choices are based on things intelligence and taste. By taste, I mean UI/UX judgment, code quality, API design, and copy.

- Use GPT-5.6 for mechanical work with a clear specification: migrations, data analysis, and straightforward implementation. It is cheap enough that cost is rarely the reason not to use it.
- Use a Claude model (mostly: Opus) for anything user-facing: UI, copy, and API design.
- Use Claude and Codex for reviewing the respective other provider's plans and implementations. I generally plan with Claude Code and ask GPT-5.6 Sol for another review.

In a subagent-based workflow, the lead agent needs enough ability to understand the architecture, split the work, and write instructions include all important decisions (like a handoff document). The subagents do not necessarily need to be the very best model if their scope is clear and their output can be checked. In Claude, this means explicitly asking for an "agent team" and describing how the agents should be set up for the task. For instance, you can ask it to spawn one agent for each module to be implemented based on a critical path, and tell it to use Codex for the agents.

There is some practical friction in mixing the tools. GPT-5.6 is available through the Codex CLI, while Claude's agent and workflow model parameter only natively accepts Claude models. But when you want to spawn Codex for a review after a long implementation run in Claude, the [Codex CLI review command](https://learn.chatgpt.com/docs/code-review?surface=cli) is a useful functionality. I also discovered the [Codex plugin for Claude Code](https://github.com/openai/codex-plugin-cc) which makes spawning Codex sessions easier — it includes `/codex:adversarial-review`, a steerable review that questions the implementation and design rather than only looking for mistakes.

Often, independent reviews find small things. Sometimes they catch an issue that would have caused unwanted behavior or a security problem. That is enough to make the extra review worth it.

[Theo's example `CLAUDE.md` instruction](https://x.com/theo/status/2072482460122964067) tells Claude when to call out to Codex, particularly for computer use, UI/UX verification, and well-specified execution work. Apparently he has settled for this workflow; it's part of his `CLAUDE.md` file now. I do not care much about copying anybody's exact rankings, so I prompt the agents based on whatever I work on, in a similar fashion.

## The bottleneck is still us

The more work these agents can do, the more work I can queue up, and the harder it becomes to review it all. [Armin Ronacher calls this the final bottleneck](https://lucumr.pocoo.org/2026/2/13/the-final-bottleneck/): humans still have to decide what to do, assess the result, and take responsibility for it.

Pairing agents and asking for reviews catches many problems that a manual pass would also catch. But agents have no taste for the thing I am trying to build. They do not have the business context, product judgment, or accumulated history that exists only in my head. They have no vision. They can make a locally reasonable change that is wrong for the product.

So I do not think the goal is to remove myself from the loop. I want to choose the points where I need to step in: after discovery, before a major architectural decision, at a handoff, and before releases. The rest can increasingly be delegated. (And that's a good thing, in my opinion.)

I am still getting used to this. I used to know nearly everything I was working on and could return to a familiar codebase without much work. This is no longer the case. It's sad, but it is just becoming less realistic when several agents can move several tasks forward at once. Almost like you're working with a team of developers. What works? Good documentation, explicit handoffs, and a visible task state — this has worked historically for software shops, and it will continue working for agent-based development.
