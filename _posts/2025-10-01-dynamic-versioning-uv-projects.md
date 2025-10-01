---
layout: post
title: "Dynamic Versioning and Automated Releases in uv Projects"
date: 2025-10-01
categories: software
---

If you've been working with Python packaging, you've probably noticed [`uv`](https://docs.astral.sh/uv/) has become the tool of choice for modern Python projects. It's fast, reliable, and handles everything from dependency management to building and publishing packages. But one area that often causes confusion is version management: how do you keep your version number in sync across your codebase, ensure it's always up to date, and automate the release process?

I have previously struggled with this a lot, writing the version manually to an `__init__.py` file, then forgetting to update it in `pyproject.toml`, or vice versa. My release scripts were often brittle and error-prone because they would have to parse and manipulate multiple files. Recently, `uv` has gained the ability to bump versions automatically, which simplifies this process significantly! And Python's dynamic versioning via `importlib.metadata` makes it easy to read the version directly from the installed package.

Here's how you can set up dynamic versioning and automated releases in your uv-managed Python projects.

## The Problem with Manual Versioning

Traditionally, Python projects could store their version in multiple places: `pyproject.toml`, `__init__.py`, maybe even a `VERSION` file. I think the default used to be to just put the version as a hardcoded string somewhere in your module's `__init__.py`. Keeping these in sync is tedious and error-prone. And while I like the fact that the version is explicitly part of your code, it's also very rarely the case that the code lives somewhere in a standalone fashion. Often, it's part of a package you installed, and your package metadata can contain that version, too. Then, your code can dynamically figure out what the version is.

## Single Source of Truth

The solution is to use `pyproject.toml` as the single source of truth for your version number, and dynamically read it everywhere else. Here's how to set it up.

### Step 1: Define Version in pyproject.toml

Your `pyproject.toml` should have a simple version field:

```toml
[project]
name = "my-app"
version = "1.0.0"
description = "A sample application"
requires-python = ">=3.11"
dependencies = [
    # whatever you need
]
```

This is the only place where you'll manually edit the version number (or rather, let `uv` do it for you, as we'll see).

### Step 2: Dynamic Version Loading

In your package's `__init__.py`, use Python's `importlib.metadata` to read the version dynamically:

```python
from importlib.metadata import version

__version__ = version("my-app")
```

The `my-app` string is the name of your module as specified in `pyproject.toml`.
That's it! Now anywhere in your code, you can import and use the version:

```python
from my_app import __version__

print(f"Running my-app version {__version__}")
```

This approach ensures that the version is always consistent with what's in `pyproject.toml`, which is what users see when they install your package.

## Automated Release Script

Now comes the fun part: automating the entire release process. uv has a built-in `uv version` command ([docs](https://docs.astral.sh/uv/reference/cli/#uv-version)) that can bump version numbers following semantic versioning. Combined with a simple bash script, you can automate version bumping, changelog generation, git tagging, and pushing to remote—all in one command.

Here's a complete release script (`release.sh`):

```bash
#!/usr/bin/env bash
#
# Release the project and bump version number in the process.

set -e

cd "$(dirname "$0")"

FORCE=false

usage() {
    echo "Usage: $0 [options] VERSION"
    echo
    echo "VERSION:"
    echo "  major: bump major version number"
    echo "  minor: bump minor version number"
    echo "  patch: bump patch version number"
    echo
    echo "Options:"
    echo "  -f, --force:  force release"
    echo "  -h, --help:   show this help message"
    exit 1
}

# parse args
while [ "$#" -gt 0 ]; do
    case "$1" in
    -f | --force)
        FORCE=true
        shift
        ;;
    -h | --help)
        usage
        ;;
    *)
        break
        ;;
    esac
done

# check if version is specified
if [ "$#" -ne 1 ]; then
    usage
fi

if [ "$1" != "major" ] && [ "$1" != "minor" ] && [ "$1" != "patch" ]; then
    usage
fi

# check if git is clean and force is not enabled
if ! git diff-index --quiet HEAD -- && [ "$FORCE" = false ]; then
    echo "Error: git is not clean. Please commit all changes first."
    exit 1
fi

if ! command -v uv &> /dev/null; then
    echo "Error: uv is not installed. Please install uv from https://docs.astral.sh/uv/"
    exit 1
fi

echo "Would bump version:"
uv version --bump "$1" --dry-run

# prompt for confirmation
if [ "$FORCE" = false ]; then
    read -p "Do you want to release? [yY] " -n 1 -r
    echo
else
    REPLY="y"
fi
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # replace version number
    uv version --bump "$1"

    new_version=$(uv version --short)

    # commit changes
    git add pyproject.toml uv.lock
    git commit -m "bump version to $new_version"
    git tag -a "v$new_version" -m "v$new_version"

    # push changes
    git push origin main
    git push origin "v$new_version"
else
    echo "Aborted."
    exit 1
fi
```

Make it executable:

```bash
chmod +x release.sh
```

## How It Works

The script does several things:

1. **Validates input**: Ensures you specify `major`, `minor`, or `patch` as the version bump type
2. **Checks git status**: Makes sure your working directory is clean (unless you use `--force`)
3. **Shows preview**: Uses `uv version --bump <type> --dry-run` to show what the new version would be
4. **Confirms with user**: Asks for confirmation before proceeding
5. **Bumps version**: Uses `uv version --bump` to update both `pyproject.toml` and `uv.lock`
6. **Creates git commit and tag**: Commits the version bump with a clear message
7. **Generates changelog**: Optionally uses [`gitchangelog`](https://github.com/sarnold/gitchangelog) to generate a changelog
8. **Pushes to remote**: Pushes both the commit and the tag to your remote repository

## Usage

Releasing a new version is now as simple as:

```bash
# Patch release (1.0.0 → 1.0.1)
./release.sh patch

# Minor release (1.0.1 → 1.1.0)
./release.sh minor

# Major release (1.1.0 → 2.0.0)
./release.sh major
```

The script will show you what it's about to do and ask for confirmation. If everything looks good, just hit `y` and it'll handle the rest.

## Why This Approach Works

This setup has several advantages:

- **Single source of truth**: Version lives in `pyproject.toml` only
- **No manual edits**: Let uv handle version bumping to avoid typos
- **Consistent tagging**: Every release gets a proper git tag automatically
- **Changelog generation**: Automatically document changes with each release
- **Safety checks**: Won't let you release with uncommitted changes
- **Works with CI/CD**: Easy to integrate into automated pipelines
