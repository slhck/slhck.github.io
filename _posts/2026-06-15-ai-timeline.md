---
date: 2026-06-15
layout: post
categories: miscellaneous
title: A Timeline of AI and Me
---

I have worked both as a software developer and video engineer for a long time. But I've always had an obsession with AI, and in particular, what I would call "AI weirdness". Over the last five years, AI went from something I would sometimes read about to something that I use every single day. I wanted to write down the moments that changed how I think about and work with AI, and add a few personal notes. This is primarily for myself to remember, because what happened just a few years ago feels like it's been ages!

I think my trip down the rabbit hole started when I visited the [Uncanny Values exhibit](https://www.mak.at/programm/ausstellungen/uncanny_values) in Vienna. Also, the local unemployment agency was testing [AI-based algorithms to classify unemployed people](https://ooe.arbeiterkammer.at/service/presse/WSG_2020_Soziotechnische_Analyse_des_AMS-Algorithmus.pdf), and at the time that felt like a really bad choice in terms of dehumanizing the whole system and making everything more efficient at the cost of actual living people.
Speech was one of the first frontiers where AI did some interesting work. I learned about [Google Tacotron](https://arxiv.org/abs/1703.10135). [BachBot](https://github.com/feynmanliang/bachbot) was a thing. Kind of stupid and really not that useful, but promising. Then in February 2019, [OpenAI released GPT-2](https://openai.com/index/better-language-models/).
I kept reading up on the topic but never really did any hands-on work. This would change in the coming year.

Here are some memorable releases and events that changed how I work with AI, in chronological order. I might update this post later with more developments.

## GPT-3, June 2020

This was the first time I saw a machine write whole paragraphs, and even bits of code, that somehow made sense. [OpenAI had just opened up API access](https://openai.com/index/openai-api/), and I did not change anything about my work because of it, but I started paying more attention.
I began reading [Gwern Branwen's articles](https://gwern.net/), such as on [GPT-3 poems and fiction](https://gwern.net/gpt-3).

Quite early on (ca. end of 2022-ish) I used GPT-3 to shorten text or do hard reformatting work such as converting between marked-up versions of a document and raw text, or converting tables between different formats. In fact, I even had GPT-3 convert a Python code base to TypeScript, which was quite flaky at the time, and it involved a lot of copy-pasting back and forth between the OpenAI Playground and my editor, but I made it work.

It's funny how GPT-3 invented syntax elements that are of course very Python-esque and don't exist in TypeScript, but it happily hallucinated new syntax that was quite plausible. This was the first moment where I could actually achieve something that I thought was previously impossible and especially in the work context, do something that I put off doing because it just wouldn't be worth the time. But now it was possible with just a few dollars of token-spend. And a good test suite, of course.

## GitHub Copilot, preview 2021, general release 2022

This was the first one where I actually used AI. For work, for actual purposes. [GitHub Copilot launched as a technical preview](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/) in 2021 and became [generally available](https://github.blog/news-insights/product-news/github-copilot-is-generally-available-to-all-developers/) in 2022. I think I onboarded it almost immediately when it was available, via the student plan offered by GitHub.

I remember that it felt really weird to have somebody complete code for me. It was slow as hell. And it certainly changed the way that I wrote code. For example, I would add much more inline commenting to provide guidance for the next words or lines to appear correctly, because at the time the model just wasn't that good and couldn't really capture intent all that well. Like it wouldn't even read more than a couple of lines prior to what you wrote, so it couldn't capture context and it couldn't read forward as well, let alone look into other files. But it was tremendously helpful for writing code like shell scripts where I can never remember the exact syntax, such as CLI options in Bash. Which is just tedious!

I have used Copilot inline auto-completions less and less, obviously, ever since adopting [Cursor](https://www.cursor.com/) with the Tab completion model, and these days I write almost no code manually anymore, except on rare occasions, thanks to Codex and Claude Code. But I still have my Copilot tab completion turned on. These days it feels like it's getting in my way, so I often snooze it when I work on actual text that I need to write myself, or academic reviews and other material where it just would say things too soon and interrupt my actual thinking.

## ChatGPT, November 2022

This is the one everyone remembers. When [ChatGPT was released](https://openai.com/index/chatgpt/), all of a sudden you could ask a question in plain words and get a real answer back. Of course I had been using GPT-3 through the API well before that, so I knew the strengths and weaknesses, but I had not really used a chat-trained model before. Remember that GPT-3 is an instruct model, so it only completes after the last word that you gave it. And if you wanted to use it for chatting, you would have to fake the whole chat conversation context! I think that is the interesting part about how these models work under the hood. Never forget that the actual chat is just a training on the specific syntax that simulates a conversation between two or three parties. That is the human, the assistant, and the system itself.

I remember reading this one essay, [_Implications of Simulators_](https://www.lesswrong.com/posts/fyW9EP5NdZrC3k3jz/implications-of-simulators), which is a rather philosophical post published on LessWrong by the pseudonymous author Janus. It explores the metaphysical and ethical consequences of living in "simulated realities", developing a framework for understanding agency, consciousness, and prediction within the "simulator" paradigm. There must have been an earlier post that I cannot find anymore, which talked specifically about faking the conversation to evoke a chatbot-style context.

## GPT-4, March 2023

With GPT-4, the [jump in quality](https://openai.com/index/gpt-4-research/) was really obvious. I think this is when it went from being a toy to something really useful.

Of course I used ChatGPT a lot during that time and explored different prompting strategies. I think I created my set of prompts that I could reuse for different purposes and primarily used it for generating initial code drafts.

In November 2023, Nick Dobos [launched Grimoire](https://www.linkedin.com/posts/nicholas-dobos_introducing-grimoire-a-gpt-coding-wizard-ugcPost-7128956622411890688-XnIm/). This was a custom prompt framework to specifically create multiple files that work together to create a bigger application. And while it suffered from a lot of hallucinations and not everything worked properly, I think it was the first foray into coding agents that thought beyond just single files.

## Claude 3.5 Sonnet, June 2024

For me, [Claude 3.5 Sonnet](https://www.anthropic.com/news/claude-3-5-sonnet) was the first model that felt good enough for real, almost unattended, work. Before it, AI coding was fun but unreliable and you had to constantly test the output. You'd have to think about the software architecture at a very low level, define interfaces and calling signatures carefully. After Claude Sonnet 3.5, I could hand over a real task and mostly trust what came back. This is where my habits actually changed for good.

Around this time I stopped copying and pasting between a chat window and my editor. Instead I used Cursor, which could edit files for me. This is also around the time I started "vibe-coding" (that was not a term yet!) apps like the [Praxisplan Wien](https://slhck.info/praxisplan-wien/), and spending more time reading code than writing it. I basically made the switch from Visual Studio Code to Cursor and really enjoyed working with their super fast tab completion model and the different choice of upstream model providers that they offered. Because prior to that I had only been using OpenAI models, but this made me switch to Anthropic for some time.

## Devin, the "AI software engineer," March 2024

This one made me stop and think, more as a founder than as a coder. Cognition [introduced Devin](https://www.cognition.ai/blog/introducing-devin) as "the first AI software engineer" and sold the idea of an AI that does the whole job, start to finish.
I never used it in practice, but it was interesting to follow on Hacker News and other forums.
Later, [Manus](https://manus.im/) emerged, with a similar purpose.

And of course, all the prompt-to-code tools like [Replit](https://replit.com/), [Bolt](https://bolt.new/), or [Lovable](https://lovable.dev/) launched. Never used any of them either.

## MCP, November 2024

Anthropic somewhat quietly released the [Model Context Protocol](https://www.anthropic.com/news/model-context-protocol) as a shared standard for plugging tools and data into a model via a common API. That meant you could imagine connecting someone else's systems without writing a custom integration for every single tool. This was much more interesting to me than another chat UI, but the excitement faded pretty quickly when I discovered that setting up MCP servers was a mess, and the tool definitions required a lot of tokens on a very scarce context. This was particularly pronounced for the cloud models I was using at the time, which had a smaller context window than OpenAI models. And they were also more expensive to use.

These days I do not use any MCP servers at all, with the exception of Playwright. I drive them through [mcporter](https://mcporter.sh/), which makes the servers much easier to manage and call, with lower token spend. From the authors: "skip the giant tool-schema prompt, generate a small typed surface, and let the agent or the human call MCP servers like normal functions".

Also worth reading is [Mario Zechner's post from "that period"](https://mariozechner.at/posts/2025-08-15-mcp-vs-cli/). I say "that period" and it's just 10 months ago! I similarly came to the conclusion that good, well-defined CLIs are all that's needed. I'd later build, with Claude, [CLIs for Trello](https://github.com/slhck/trelloctl) and [Hubspot](https://github.com/slhck/hubspotctl), with a much smaller footprint but all the capabilities of an MCP server. I would go as far as saying that if you have CLI tools that all behave the same way, then you don't even need to give the model specific instructions on how to use them.

## DeepSeek R1, January 2025

As someone who runs a bootstrapped company, I looked at this less from a "here's a fancy new model" angle but more as a "what, there are other vendors?" story. [DeepSeek R1](https://github.com/deepseek-ai/DeepSeek-R1) was released as a strong open model, with a permissive license and prices that were competitive. I toyed around with it for a while, but I did not find it compelling enough to switch from the models I was already using. Plus, the hosting in China was a bit suspicious for me (not that it's any better having the other models hosted in the US, though!).

## "Vibe coding" gets a name, February 2025

Andrej Karpathy [gave a name](https://x.com/karpathy/status/1886192184808149383) to something I had already been doing on quiet evenings, for all the projects I'd never have time for. Describe what you want and let the model build it. In my case, using Cursor agents. I was already doing this for little web apps and experiments, like an [Image-to-ICS converter](https://slhck.info/image-to-ics/) or a [timestamp conversion tool](https://slhck.info/timestamper/).

I also vividly remember [Pieter Level's Flight Simulator](https://fly.pieter.com/) which he completely vibe-coded.

## Claude Code, preview February 2025, general release May 2025

This my daily work more than anything since Copilot. Anthropic introduced [Claude Code as a limited research preview](https://www.anthropic.com/news/claude-3-7-sonnet) in February, and then made it [generally available with Claude 4](https://www.anthropic.com/news/claude-4) in May. I began toying around with it, and I started a Claude subscription. It's also when I cancelled Cursor.

First I had to fight the frustration of having to use a terminal UI. To this day I still don't like these UIs. I just want to copy and paste things from clearly defined windows. I want to use my traditional macOS text editing shortcuts. Interactive context. Links, etc. Perhaps Claude Code for Desktop and OpenAI's new Codex app would solve these problems; as of June 2026 I have yet to try them.

But the leap from Cursor agents was apparent. You could now hand a task to an agent in the terminal and let it read files, run commands, and come back with a result, with a much stronger grip on my intents, less dumbness (Cursor does something with your code before handing it off to the models; this impacts quality), and faster execution.

## Skills, October 2025

With [Agent Skills](https://www.anthropic.com/news/skills), you could pack my own knowledge and (repetitive) steps into a folder that the model would pick up when it was needed. I had been writing little cheat sheets and notes for years, such as prompt template libraries that I'd paste into Claude Code when needed.

I think Skills made MCP mostly obsolete, except maybe for the use case where a non-technical user needs to plug in something into their UI-only chat box. Apart from that, I very much prefer having APIs available that are debuggable.

## OpenClaw and the always-on agent, January 2026

Ah, [OpenClaw](https://github.com/openclaw/openclaw). I never used it, didn't have time to fight the configuration. I tried setting it up twice and got stalled at the part where you need a dedicated phone number. Since it runs on your own machine and answers you through the chat apps you already use, it seems very useful but I never managed to find a compelling use case. Right now I'd rather stay in the loop with my daily tasks, and outsource only what can be completely automated in a somewhat deterministic way.

## What is still worrying, 2025 and beyond

Somewhere this year I became more suspicious of my own habits. Karpathy told people to ["keep AI on the leash"](https://www.businessinsider.com/openai-cofounder-andrej-karpathy-keep-ai-on-the-leash-2025-6), and said of his own work: "I'm still the bottleneck."

I noticed the same thing in my own work. If I let the machine do too much, I have to context-switch more. You end up building more stuff but you are "always on". While in the early days you'd hesitate switching off the computer because there was this one thing you needed to fix, now it's that one prompt you're going to send to the agent.

Studies also started to point in the same direction: [more code, but sometimes less validation](https://arxiv.org/abs/2512.19644); [more speed, but also more supervisory work](https://arxiv.org/abs/2605.23135).

Luckily, I'd gathered a lot of experience in the 15 years prior, but I am still unsure how this is going to play out if I stop writing code myself. (At least I wrote this post, huh.)

Yann LeCun, one of the people who is also somehow present in this modern AI space, kept pushing back on the hype. He has been arguing for [world models](https://openreview.net/forum?id=BZ5a1r-kVsf) for years, and he'd be pointing out that language models are still mostly trained on text. But I don't know if I agree with the pessimism.

In general, many AI skeptics seemed to be very vocal in 2025, but not anymore in 2026. Claude Code has arrived in many large organizations, and people use it as their daily driver for almost everything. People brag about their token spend, and I do wonder how much ROI they have actually achieved?

It has even reached the absurd point where you participate in Slack discussions between folks who just paste their Claude analysis into the chat window. I see vibe-coded designs everywhere, sure. I get it, outsourcing some of the thinking *feels* productive. I am guilty of this as well for some low-stakes projects or throwaway analyses. But when people start using agents to do the thinking for them, it gets frustrating because human conversations end up becoming imbalanced. "Yeah, I don't know exactly, let me ask Claude how it did that."

Oh, and all the people using AI to write LinkedIn engagement bait? I am thinking about blocking them.
The worst part is: once you've seen [Claudish speak](https://www.linkedin.com/posts/emollick_one-thing-i-mentioned-in-passing-in-my-fable-activity-7470309205283991552-TEyq?utm_source=share&utm_medium=member_desktop&rcm=ACoAABlp6YMBC8dQlzonxCPSPoLm5YAe9Ew1560), you can't unsee it. I am developing a frustration reading my own agent's outputs. Perhaps some more prompting will fix it…?
