---
layout: post
title: "Using git-cliff for changelogs and migrating away from gitchangelog"
date: 2025-10-13
categories: software
---

I maintain various pieces of software, and keeping a changelog is an essential part of ensuring that users can understand what changed over time, which features a new release offers, and what bugs have been fixed.

In the beginning, I used to manually write changelogs, and I ended up with various different styles of commit messages. This has changed over time, and I've tried different tools – depending on the source code language – to generate the changelogs automatically. Why? Having the changelogs be produced by a machine saves a lot of headache, and, let's face it, nobody wants to add even more workload to maintaining software. The git log itself is already a good source of truth, so let's re-use that.

**TL;DR:** Use [`git-cliff`](https://git-cliff.org/) with [conventional commit](https://conventionalcommits.org) messages to speed up your changelog generation!

## The Old Way: `gitchangelog`

Since most of my projects used Python, I found [`gitchangelog`](https://pypi.org/project/gitchangelog/) to be simple to use. It does require setting up a config file so it knows what types of changes you are doing, and the default format was not to my liking. So you put a `.gitchangelog.rc` file in your folder:

```toml
output_engine = mustache("markdown")
tag_filter_regexp = r'^v[0-9]+\.[0-9]+(\.[0-9]+)?$'

section_regexps = [
    ('Fix', [
        r'^fix(\([^\)]+\))?\s*:\s*([^\n]*)$',  # Matches "fix:" and "fix(scope):"
    ]),
    ('Feature', [
        r'^feat(\([^\)]+\))?\s*:\s*([^\n]*)$',  # Matches "feat:" and "feat(scope):"
    ])
    # ... and so on!
]
```

Then, you can run it with `uvx --with pystache gitchangelog`. This ensures that the `pystache` dependency gets loaded with it, which, in turn, allows you to write a Markdown-formatted changelog with a custom template. I also had to tell it how a version tag looks like (i.e., starting with `v`).

## The Problems?

After a few years of using it, I ran into issues with `gitchangelog`. First of all, it's **terribly slow**! For one of my production projects with around 10,000 commits, generating a changelog takes a whopping 30 seconds on an M1 MacBook Pro. That's so long that, in fact, I frequently asked myself whether my release pipeline/script was hanging when it tried creating the changelog.

The commit messages were still an issue. To properly separate features from bugfixes, the changelog generator needs to know how these are signaled. Over time, I've threfore also converged on using the [conventional commit framework](https://conventionalcommits.org) to create commit messages. If you don't know that, it's a standard that enforces commits to have prefixes designating their type, e.g. `feat` for features, `fix` for bugfixes, etc. Each commit can also tag its area, e.g. `feat(server): add foo frobnicator` may refer to a server-specific feature.

## `git-cliff` to the Rescue!

The solution to my issues came with [`git-cliff`](https://git-cliff.org/). It's an extremely fast and simple-to-use changelog generator written in Rust. It natively supports conventional commits, has excellent performance, and offers extensive customization through a simple configuration file.

On my example project, changelog generation times were cut down to 120 milliseconds!

Getting started with `git-cliff` is straightforward. You can install it using various methods:

```bash
# Using Homebrew (macOS/Linux)
brew install git-cliff

# Using cargo (if you have Rust installed)
cargo install git-cliff

# Or download pre-built binaries from GitHub releases
```

The simplest way to use `git-cliff` is to run it without any arguments in your git repository:

```bash
git-cliff > CHANGELOG.md
```

This will generate a changelog based on all commits in your repository. You can also specify a range – a feature I now use in my release script:

```bash
# Generate changelog for unreleased changes
git-cliff --unreleased

# Generate changelog between two tags
git-cliff v1.0.0..v2.0.0
```

The real power of `git-cliff` comes from its [configuration options](https://git-cliff.org/docs/configuration/). You can create a `cliff.toml` file in your repository root, or [add its settings to `pyproject.toml`](https://git-cliff.org/docs/integration/python/).

## Conclusion

Switching from `gitchangelog` to `git-cliff` was one of those changes that immediately pays off. The combination of performance, native conventional commit support, and flexible configuration makes it the ideal tool for changelog generation for me.

**Key takeaways:**

- `git-cliff` is 100x faster than `gitchangelog` (0.3s vs 30s on large repos)
- Native support for conventional commits means less configuration
- Highly customizable through simple TOML configuration
- Great CI/CD integration with GitHub Actions and Docker images
- Active development and excellent documentation
