Do you use conditional writes to prevent lost updates? (optimistic locking version attribute, or conditional expressions)

Do you have idempotency for “adjust stock” (to prevent duplicate decrement on retries)?

Mock Test

README that sells (most important)

Add these sections:

Problem: what inventory pain point it solves

Architecture: one diagram (API → Service → DynamoDB → EB)

Core workflows: create item, adjust stock, audit, search

DynamoDB modeling:

table name

partition key / sort key design

access patterns you optimized for
DynamoDB is “access-pattern-driven”—reviewers will look for this explicitly.

Trade-offs:

eventual vs strong consistency (where you chose which and why)

why DynamoDB vs Postgres

How to run locally (docker compose if possible)

How to deploy (Beanstalk steps)