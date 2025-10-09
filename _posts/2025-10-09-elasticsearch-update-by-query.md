---
layout: post
title: "Propagating Upstream Data Changes in Elasticsearch Without Full Reindexing"
date: 2025-10-09
categories: software
---

If you've worked with Elasticsearch for any length of time, you've probably run into this scenario: you have millions of documents indexed, and then some "upstream" data changes. A user renames their organization, a product category gets updated, or a client changes their display name. Now you need to update that denormalized data across potentially millions of documents.

The naive approach? Reindex everything. We used to do that a lot at our company. Just because we didn't know any better. The smarter approach? Use Elasticsearch's `update_by_query` API – asynchronously.

## The Problem with Denormalized Data

Elasticsearch excels at search, but it's not a relational database. When you index documents, you often denormalize data for performance. For example, instead of storing just a `user_id`, you might store the full user object:

```json
{
  "id": "measurement_123",
  "timestamp": "2025-10-09T10:30:00Z",
  "value": 42.5,
  "user": {
    "id": "user_456",
    "name": "Alice",
    "organization": "ACME Corp"
  }
}
```

This makes searches fast. You can filter by organization name without any joins. But what happens when Alice's organization changes its name from "ACME Corp" to "ACME Industries"?

You have three options:

1. **Do nothing** – Live with stale data. This is usually not acceptable, and our customers were rightfully unhappy about historic data being incorrect.
2. **Reindex everything** – Fetch millions of documents from your database, transform them, and push them back to Elasticsearch. Slow, expensive, error-prone. We used to do that a lot, creating bespoke reindex workers that took forever to run.
3. **Use `update_by_query`** – Update just the fields that changed, directly in Elasticsearch. Fast, efficient, elegant!

The [`update_by_query` API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-update-by-query) lets you update documents in place using a query to match which documents to update and a script to define what to change. Here's a simple example:

```bash
POST /analytics-*/_update_by_query
{
  "script": {
    "source": "ctx._source.user.organization = params.new_name",
    "lang": "painless",
    "params": {
      "new_name": "ACME Industries"
    }
  },
  "query": {
    "term": {
      "user.id.keyword": "user_456"
    }
  }
}
```

This finds all documents where `user.id` equals `user_456` and updates the `organization` field to "ACME Industries". No application code required, no fetching millions of documents, no complex transformation logic.

## Real-World Use Case: Analytics Data

Let me give you a concrete example from a real project. Imagine you're running an analytics platform that collects measurements from various clients. Each measurement document stores denormalized client information:

```json
{
  "id": "meas_001",
  "timestamp": "2025-10-09T10:00:00Z",
  "metric": "response_time",
  "value": 250,
  "client": {
    "uuid": "7f5b1303-ac3c-4d0e-a87c-f4edb531692c",
    "label": "prod-server-01",
    "type": "web"
  }
}
```

You have millions of these measurements spanning months or years. Now a client wants to rename their label from `prod-server-01` to `prod-web-server-primary`.

### The Old Way

```python
# Fetch all measurements for this client from your database
measurements = db.query("""
    SELECT * FROM measurements
    WHERE client_uuid = '7f5b1303-ac3c-4d0e-a87c-f4edb531692c'
""")

# Update and reindex each one
for measurement in measurements:
    measurement.client.label = "prod-web-server-primary"
    elasticsearch.index(
        index=get_index_name(measurement),
        id=measurement.id,
        document=measurement.to_dict()
    )
```

This approach loads potentially millions of rows into memory, transfers massive amounts of data over the network, puts load on your database, and takes hours or days to complete. Not to mention the complexity of error handling and retries.

### The Smart Way

```bash
POST /analytics-*/_update_by_query?wait_for_completion=false
{
  "script": {
    "source": "ctx._source.client.label = params.label",
    "lang": "painless",
    "params": {
      "label": "prod-web-server-primary"
    }
  },
  "query": {
    "term": {
      "client.uuid.keyword": "7f5b1303-ac3c-4d0e-a87c-f4edb531692c"
    }
  }
}
```

The update script is a [Painless script](https://www.elastic.co/docs/explore-analyze/scripting/modules-scripting-painless).

This runs entirely within Elasticsearch and updates only the field that changed. It processes updates in batches automatically, and returns immediately with a task ID (when using `wait_for_completion=false`).
Per Elastic's documentation:

> If the request contains wait_for_completion=false, Elasticsearch performs some preflight checks, launches the request, and returns a task you can use to cancel or get the status of the task. Elasticsearch creates a record of this task as a document at .tasks/task/${taskId}.

You get a response like this:

```json
{
  "task": "ny6LczdfQWSR3xheTITWpg:1834540"
}
```

You can then poll the task status later on:

```bash
GET /_tasks/ny6LczdfQWSR3xheTITWpg:1834540
```

Which returns progress information:

```json
{
  "completed": false,
  "task": {
    "status": {
      "total": 1000000,
      "updated": 450000,
      "batches": 450,
      "version_conflicts": 0
    }
  }
}
```

When it completes, it will show `completed: true` and a summary of the operation:

```json
{
  "completed": true,
  "response": {
    "total": 1000000,
    "updated": 1000000,
    "batches": 1000,
    "version_conflicts": 0,
    "failures": []
  }
}
```

## When NOT to Use `update_by_query`

This approach isn't always the answer:

- **Major schema changes** – Use reindex API with a mapping transformation
- **Adding new fields from external data** – Reindex from source
- **Complex transformations** – Consider Logstash or custom ETL
- **Real-time updates** – Use partial document updates instead

## Conclusion

The `update_by_query` API is one of Elasticsearch's most powerful yet underutilized features. When you have denormalized data and upstream changes, it lets you propagate those changes efficiently without the overhead of full reindexing.

Next time you're faced with updating millions of documents, remember: you don't need to reindex everything. Just update what changed.
