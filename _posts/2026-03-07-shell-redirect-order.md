---
layout: post
title: "The Order of Redirections in Bash Matters"
date: 2026-03-07
categories: software
---

Today I learned — after using bash and zsh for more than a decade — that the order of redirections matters. The typical use case for redirections is to pipe output of a command to `/dev/null`, essentially to make it quiet.

Because bash processes the redirections in their order of appearance, it's important that you write:

```bash
command >/dev/null 2>&1
```

This means the stdout will be redirected to `/dev/null`, and then stderr will be redirected to the same place as stdout (which is now `/dev/null`).

If instead you write:

```bash
# DO NOT DO THIS!
command 2>&1 >/dev/null
```

You are first redirecting stderr to the current stdout (which is still the terminal), and then redirecting stdout to `/dev/null`. As a result, stderr will still go to the terminal, and only stdout will be silenced.

So, don't be fooled by the order of redirections. Always remember to redirect stdout first, and then stderr to the same place.

Note that there's a shorthand for this in bash:

```bash
command &>/dev/null
```

This will redirect both stdout and stderr to `/dev/null` in one go, and is equivalent to the first example.
