---
layout: post
title: "Creating Word Documents with Track Changes from Markdown Diffs Using pandiff"
date: 2026-01-14
categories: software
---

I'm managing a lot of legal documents, contracts, and technical specs. I prefer doing it in Markdown because it allows me to easily track the differences via `git` (also, it's easier to edit with LLMs). But sometimes you need a "redlined" version, that is, a `git diff` for humans, to send to someone for review. But how do you create a Word document with track changes from Markdown files?

I thought I could let Claude Code generate the right XML structure, but I couldn't quite get it right. You could probably first convert two versions to `.docx`, then [use Word's built-in compare feature](https://support.microsoft.com/en-au/office/compare-and-merge-two-versions-of-a-document-f5059749-a797-4db7-a8fb-b3b27eb8b87e). But that's tedious, and if you're version-controlling your documents in Git, you might as well use something that works from the command line.

So I used [pandiff](https://github.com/davidar/pandiff): a tool that combines Pandoc's document conversion with diff capabilities to produce Word documents with actual track changes.

## Basic Usage

pandiff is a Node package and available via `npm` – you can use `npx` to run it without installing globally.

```bash
npx pandiff old.md new.md -o diff.docx
```

You get a `.docx` file where deletions and additions are marked, just like Word's track changes.
If you have a Word template (a `.docx` file with your preferred styles), you can apply it:

```bash
npx pandiff old.md new.md --reference-doc=template.docx -o diff.docx
```

This works just like in Pandoc, letting you maintain consistent styling across documents. (For me, it's particularly useful for legal or corporate documents where you need consistent header styles or branding.)

pandiff passes options through to Pandoc. If you're using GitHub-flavored Markdown with fenced divs (useful for custom styling), specify the format:

```bash
npx pandiff old.md new.md -f gfm+fenced_divs-fancy_lists --reference-doc=template.docx -o diff.docx
```

**Important:** Options must come *after* the input files, otherwise pandiff will complain.

## The Heading Level Problem

I (sometimes) like to use top-level headings (`# Heading 1`) for document titles in Markdown. I'm really not consistent here though. When converting to Word, Pandoc treats the first top-level heading as the document title, which can mess up the heading levels in the output.

I tried using Pandoc's `--shift-heading-level-by=-1` option to demote the title heading, but pandiff doesn't support this flag. The workaround is to pre-process your Markdown files by just shifting all `##` headings to `#`, and demoting the title heading to `##`. You can do this with `sed`:

```bash
# Shift ## to # and demote the title
sed 's/^## /# /g; s/^# My Title/## My Title/' old.md > /tmp/old_shifted.md
sed 's/^## /# /g; s/^# My Title/## My Title/' new.md > /tmp/new_shifted.md

npx pandiff /tmp/old_shifted.md /tmp/new_shifted.md --reference-doc=template.docx -o diff.docx
```

Adjust the sed patterns to match your document's title.

## Conclusion

`pandiff` is a nice tool to send document changes to people who expect classic Word track changes, while keeping my source documents in Markdown under version control.
