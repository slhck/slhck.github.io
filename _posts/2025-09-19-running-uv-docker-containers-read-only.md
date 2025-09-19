---
layout: post
title: "Running uv-Based Docker Containers in Read-Only Mode"
date: 2025-09-19
categories: software
---

I recently spent way too much time trying to get a Python application (with FastAPI and [`uv`](https://docs.astral.sh/uv/)) running in a read-only Docker container. What should have been a simple security hardening exercise turned into a frustrating debugging session where the container kept crashing with cryptic errors about missing modules that were clearly installed during the build.

If you've ever tried to enable `read_only: true` in your Docker Compose file only to watch your app explode with errors, you'll know the pain.

## Python Bytecode Files and `uv` Caches

The core problem is that Python really, really wants to write to the filesystem. Every time you import a module, Python tries to create bytecode cache files in `__pycache__` directories. When you're using [`uv`](https://docs.astral.sh/uv/) (the new package manager everyone's raving about, rightfully so!), it also wants to write cache metadata to `~/.cache/uv/`.

I initially thought I could just mount a bunch of tmpfs volumes over these directories and call it a day. This is how you would usually enable read-only mode for a typical Python app, by specifying something like this in your `docker-compose.yml`:

```yaml
read_only: true
tmpfs:
  - /home/appuser/.cache:uid=1001,gid=1001 # -> these are paths your app needs to write to
```

Note: 1001 is the UID of my non-root user. You should always add a non-root user to execute your actual application code in Docker!

But there was another problem: I had a dependency that used SSH to clone a repository during `uv` package installation, and, despite installing the packages already in the Dockerfile, `uv` still tried to install the packages _again_ at runtime when I called my entrypoint script with `uv run ...`. This is because `uv` defaults to checking for updates and re-installing packages unless you tell it not to.

## Solution

The trick is understanding that you:

1. don't actually need Python to write bytecode files at runtime if you're smart about the build process. uv has some flags that most people don't know about that solve this elegantly.
2. can disable uv's default behavior of checking for updates and re-installing packages at runtime.

First, tell Python to stop trying to create bytecode files altogether by setting `PYTHONDONTWRITEBYTECODE=1`. This environment variable is your friend – it prevents Python from creating any `.pyc` files during execution. You can still get the performance benefits of bytecode compilation by using uv's `--compile-bytecode` flag during the build. This pre-compiles everything when you're building the image, so there's no need for runtime compilation.

Your Dockerfile should look something like this:

```dockerfile
# Install dependencies and pre-compile bytecode
COPY ./pyproject.toml ./uv.lock ./
RUN uv sync --locked --no-editable --compile-bytecode --no-dev && \
    chown -R ${UID}:${GID} /home/${USER}/.venv
```

The `--locked` flag ensures uv uses exactly what's in your lockfile instead of trying to resolve dependencies again. The `--no-editable` flag installs packages normally – rather than in development mode (which would require write access). And `--compile-bytecode` does all the bytecode compilation upfront.

And as for running the application, use `uv run` with the `--no-sync` flag to prevent uv from trying to re-install or update packages at runtime:

```bash
uv run --no-sync uvicorn app.main:app --host 0.0.0.0 --port 80
```

## Minimal Filesystem Writes

With the bytecode issue sorted, you only need tmpfs mounts for the bare minimum – just the uv cache directory for metadata. Your `docker-compose.yml` should look like this:

```yaml
read_only: true
tmpfs:
  - /home/appuser/.cache:uid=1001,gid=1001
environment:
  PYTHONDONTWRITEBYTECODE: 1
```

That's it. No mounting over site-packages, no complex volume configurations.

## Complete Example

Here's a complete working example:

**Dockerfile:**

```dockerfile
FROM python:3.13-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Create non-root user
ENV USER=appuser
ENV UID=1001
ENV GID=1001
RUN groupadd --gid ${GID} ${USER} && \
    useradd --system --create-home --home-dir /home/${USER} \
           --shell /bin/bash --gid ${GID} --uid ${UID} ${USER}

WORKDIR /home/${USER}

# Install dependencies
COPY ./pyproject.toml ./uv.lock ./
RUN uv sync --locked --no-editable --compile-bytecode --no-dev && \
    chown -R ${UID}:${GID} /home/${USER}/.venv

# Switch to non-root user
USER ${USER}

# Copy application code
COPY --chown=${UID}:${GID} ./app ./app

# Prevent bytecode generation at runtime
ENV PYTHONDONTWRITEBYTECODE=1

ENTRYPOINT ["app/entrypoint.sh"]
```

**docker-compose.yml:**

```yaml
services:
  app:
    image: my-app
    read_only: true
    tmpfs:
      - /home/appuser/.cache:uid=1001,gid=1001
    environment:
      PYTHONDONTWRITEBYTECODE: 1
    ports:
      - "8000:80"
    cap_drop:
      - ALL
```

**entrypoint.sh:**

```bash
#!/bin/bash
# Use uv run to execute with the pre-installed environment
uv run  --no-sync uvicorn app.main:app --host 0.0.0.0 --port 80
```

## Verification

To verify your container is working correctly in read-only mode:

```bash
# Check for filesystem changes
docker diff <container-name>

# Should show minimal output like:
# C /home/appuser
# A /home/appuser/.cache
```

The key insight is that UV's `--locked --no-editable --compile-bytecode` flags at build time, combined with `PYTHONDONTWRITEBYTECODE=1` at runtime, eliminate most filesystem write requirements while maintaining full functionality.

## Security Benefits

Running in read-only mode provides several security advantages:

- **Prevents privilege escalation**: Malicious code can't modify system files
- **Limits attack surface**: Reduces potential for persistent modifications
- **Compliance**: Meets security requirements for many organizations
- **Immutable infrastructure**: Ensures containers remain in known good state

This approach has been successfully tested with FastAPI applications using UV for dependency management, providing both security and performance benefits.
