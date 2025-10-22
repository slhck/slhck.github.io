---
layout: post
title: "Forwarding HTTPS Requests to Elasticsearch with Self-Signed Certificates in Traefik"
date: 2025-10-22
categories: software
---

I recently had to debug a "502 Bad Gateway" error when trying to proxy Elasticsearch with a self-signed certificate through Traefik. The logs showed Elasticsearch rejecting the connection with `received plaintext http traffic on an https channel`, while Traefik was happily forwarding HTTP requests to what it thought was an HTTP backend.

If you're running Elasticsearch with HTTPS enabled (using self-signed certificates for internal Docker communication) and Traefik as your reverse proxy, you'll need to **explicitly tell Traefik** to use HTTPS for the backend connection and skip certificate verification.

Unfortunately, the Traefik docs are quite a mess, and I feel like they used to be more coherent regarding configuration. But I figured it out, so here's a step-by-step guide to get this working!

## The Problem

Traefik was using HTTP (`http://172.18.0.9:9200`) to connect to Elasticsearch, but Elasticsearch was configured to only accept HTTPS connections on port 9200.

This is a common setup when you have Elasticsearch running in Docker with TLS enabled for inter-container communication using self-signed certificates. Kibana and other services share the same certificate and can talk to Elasticsearch just fine, but Traefik – unless configured properly – defaults to HTTP for backend connections.

## Understanding Traefik's Docker Provider

When you look at your Traefik dynamic configuration, you might see services named like `elasticsearch-yourstack@docker`. The `@docker` suffix tells you that Traefik discovered this service automatically from the Docker provider, not from your file-based configuration. The `yourstack` part depends on your Docker Compose project name.

You can't just override the service in `dynamic.yaml` without understanding how Traefik merges configurations. The proper way to configure this is through Docker labels on the Elasticsearch container itself.

## The Solution

You need to do two things:

### 1. Define a serversTransport in Traefik's Dynamic Configuration

In your Traefik dynamic configuration file (e.g., `config/prod.oxyfi/dynamic.yaml`), add a `serversTransports` section that tells Traefik to skip certificate verification for self-signed certificates:

```yaml
# Dynamic Configuration
http:
  serversTransports:
    insecurehttp:
      insecureSkipVerify: true
  routers:
    elasticsearch:
      rule: Host(`elasticsearch.example.com`)
      service: elasticsearch-yourstack@docker
      tls:
        certResolver: le
    # ... your other routers here
```

The `insecureSkipVerify: true` setting allows Traefik to connect to backends using self-signed certificates without validation. This is safe for internal Docker networks where you control all the containers.
Now you need to connect this transport to your Elasticsearch service.

### 2. Add Docker Labels to Elasticsearch

In your Elasticsearch `docker-compose.yml`, add labels to tell Traefik to use HTTPS and the transport you just defined:

```yaml
services:
  elasticsearch:
    networks:
      - traefik
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik"
      - "traefik.http.services.elasticsearch-yourstack.loadbalancer.server.scheme=https"
      - "traefik.http.services.elasticsearch-yourstack.loadbalancer.serverstransport=insecurehttp@file"
```

The two key labels are:

- `scheme=https` — Tells Traefik to use HTTPS when connecting to the backend instead of HTTP
- `serverstransport=insecurehttp@file` — References the transport we defined in the file provider (the `@file` suffix is important!)

Note that the service name in the label must match the auto-discovered service name from Docker. If you're not sure what it is, check your Traefik logs or dashboard to see what Traefik calls the service.

### 3. Restart Services

After making these changes:

```bash
# Restart Elasticsearch to apply the new labels
cd /path/to/yourstack
docker compose restart elasticsearch

# Restart Traefik to reload the dynamic configuration
cd /path/to/traefik
docker compose restart traefik
```

## Why This Works

The configuration works because:

1. **Traefik discovers services** from Docker using the `docker` provider, labeling it `<service>-<stack>@docker`
2. **Docker labels override** the auto-discovered configuration, telling Traefik to use HTTPS
3. **The serversTransport** handles the self-signed certificate by skipping verification
4. **The `@file` suffix** tells Traefik where to find the transport definition (in the file provider, not Docker)

Without these settings, Traefik defaults to HTTP for backend connections, which fails when Elasticsearch expects HTTPS.
