---
layout: post
title: Typical Arguments and Rhetorical Tactics Used in Standardization
date: 2026-06-23
categories: miscellaneous
---

Standardization is the art of getting a room full of people (with competing interests) to agree. Everyone has different viewpoints, of course. Some people also have different motivations. Perhaps they are just hungry and wnat to get home; others have primarily commercial interests.

I think that in an ideal world, most of the discussion should be honest and technical. But after having spent more than ten years in such meetings now, I realize there are many strategic and tactical ways in which people try to steer the conversation in their favor.

To fight an enemy, you need to recognize it first. So here's a kind of "mental catalogue" of the tactics that come up again and again.

### Bikeshedding

This is an unreasonable attention to a trivial details, while ignoring the hard and important questions (because there is a lack of time). The name is from the idea ([Law of Triviality](https://en.wikipedia.org/wiki/Law_of_triviality)) that everyone has an opinion on what color to paint the bike shed, what wood to use, etc., inverting the typical assumptions of complexity. *Everyone* can discuss a bike shed, while few can discuss a nuclear reactor.

In standards, it could be the exact phrasing of one sentence, or the numeric value of some parameter, wasting an hour while the actual mechanism gets five minutes only.

**How to address it:**

- List the open issues by impact/effort and deal with the high-impact/low-effort ones first.
- Give time limits to trivial discussions, so they don't fill the entire slot.

### Scope inflation

Here, you start with a simple problem and then it continues growing. For example, "specify a metric for this one codec under this condition" becomes "specify a metric for all codecs, all resolutions, and also live streaming, and also mobile."

It's usually based on good intents but it makes it harder to complete anything in a reasonable amount of time.

**How to address it:**

- Confirm the scope that was agreed at the start
- If needed, extend the scope but readjust expectations on time of completion

### Requirement laundering

This is when someone presents a preference as if it were a hard requirement that everyone agrees on. In a well-meaning way it could be a personal preference or pet peeve. Often it's a commercial interest that is not directly visible at first. In the worst case, it could be a trojan horse to scope down a standard to fit what you have in your back pocket already. (Or it might be the requirement that doesn't rule out your solution.)

**How to address it:**

- Ask where the requirement comes from, and ask for resources
- If you can't, probably better to treat it as one input among many rather than a veto

Note that the power of a veto is determined by how consensus works. I like [IETF's rough consensus](https://datatracker.ietf.org/doc/html/rfc7282) approach! This leads us to…

### Consensus pressure

"Everyone already agrees on this." Or: "we discussed this last time and settled it." The implication is that re-opening the question makes you the difficult person in the room. In consensus-based bodies this is especially powerful, because nobody enjoys being the only one who objects.

Note that this depends on formal procedures. Of course, objecting at a stage where you've had ample time to review is not nice. It's also not forbidden. Standards processes have different levels of reviews for a good reason. I've been running into this far too often, because the "everyone agrees" part was only happening in a small group only.

**How to address it:**

- Ask for the technical justification, regardless of how many heads are nodding
- A popular choice can still be wrong if you're the expert in the room who can show otherwise

It's perfectly fine to also at least question basic decisions if you don't have the context that led to their existence.

### Appeal to authority

Ah, traditions. "Professor X says so," or "this is how company Y does it, and they're the biggest." When you conflate who says something with what the content is.

**How to address it:**

- Ask for the technical merits, the data, or the normative reference behind any claim.
- Experts are often right, but not all people with power got into their current position due to their expertise

### Straw man

This is my… uh, favorite. (I mean that in the opposite way, of course.)

You make a proposal that then provokes a response to something you never said. It could be a more extreme position, or it could be something entirely different. Then your conversation can be easily shut down. Or, what's worse, you need to defend a position you never brought up in the first place.

**How to address it:**

- Call out that someone argues against a straw man
- Restate your actual position, precisely, quote your own words
- Ask that objections address what you said

### Goalpost shifting

It's easy to accomplish something if you can always change how you interpret it. Far too often, the criteria for success change after the work is done. Someone created something that is not good enough by usual standards? Then they can come up with a use case that justifies that the thing you produced is still valid.

There's another variant of this, where _your_ work gets now evaluated by different standards than what was initially agreed, and that's also hard to fight against.

**How to address it:**

- Have clear, measurable, objective goals that are frozen, to which everyone agrees
- When the goalposts move, point back to what was agreed and ask explicitly whether the criteria are changing and why

### FUD (fear, uncertainty, doubt)

When in doubt, lash out. Invoke fear. Vague risks often get raised without any evidence: "this might break implementations," "we're not sure it scales." The doubt by itself is often enough halt a decision process, even when there's nothing concrete behind it.

There are of course always good reasons to think about future implications, and to be honest, I often lean towards being extra-cautious and raising concerns early on. But if you do, then at least back them up.

**How to address it:**

- Ask people to quantify how likely that risk is
- Try to talk about mitigations — a concern voiced without any proposal to address it is not constructive

### Ad hominem

When you can't attack the technical proposal, switch to the person who voiced it. Blame random things that they've said in the past that are unrelated to the subject matter at hand, question their credibility because of some procedural mistake they made.

Someone once said my statements could not be taken seriously because I was sending them from my company's email address, and I clearly had commercial interests, when in fact I'd been contributing to an effort for free, in my completely own time. The person who made that statement never apologized, and the chairman never addressed it formally during the meeting or afterwards.

**How to address it:**

- Call out the ad-hominem attack
- Try to focus the discussion on the technical matters
- Understand that some people are just resorting to those methods for lack of anything better to say. That's ultimately their problem, not mine.

## Final Note

I've been in this business long enough to have examples for each of these, but there's no point calling out standards bodies or specific work items. I might extend this whenever I come across the next good example, so I can give you a quote.

There are some aspects to consider when applying these concepts in practice. First, [Hanlon's razor](https://en.wikipedia.org/wiki/Hanlon%27s_razor):

> Never attribute to malice that which is adequately explained by stupidity.

Not every use of such tactics means the person is acting in bad faith or doing it on purpose. Most of these are just how people think they can succeed, and perhaps they don't know any better.

Accusing someone of manipulating the room is also not the best way to resolve such issues.
It's also helpful to consider that you might have used these tactics as well. Try not to.

Standards are supposed to be a durable, interoperable agreement that outlive the meeting they were written in. Try to capture as much technical context and reasoning as possible, so that future readers (or the future you) still knows why a decision was made, years later. The above tactics work because they keep the reasoning off the record. So the response comes down to the same move: ask the question that puts the reasoning back on the table.

<small>Note: While I knew _most_ of these by name, I had to look some of them up or ask Claude to point me to the right concept.</small>
