## Context
Currently have `InMemoryEventBus` with Pub/Sub (exact + wildcard subscriptions). Need to add Event Sourcing pattern with append-only event log for:
- Event replay / debugging
- Live subscriptions for real-time consumers
- Foundation for Saga and Outbox patterns

## Goals
- Append-only in-memory event log with position tracking
- Stream reads from arbitrary positions
- Live subscriptions (async iterators) for real-time consumers
- Dual-write: EventBus.publish → EventStore.append

## Non-Goals
- Persistence/durability (in-memory only)
- Event versioning/upcasting
- Snapshotting

## Decisions
1. **In-memory only** — swap to SQLite/Postgres later via repository pattern
2. **Position-based reads** — integer position for stream reads, enables replay from any point
3. **Async iterators for subscriptions** — `for await (const event of store.subscribe())` pattern
4. **Dual-write in EventBus** — `publish()` calls `store.append()` after notifying handlers

## Risks / Trade-offs
- In-memory = no durability (acceptable for demo)
- Dual-write = potential inconsistency if store fails (acceptable for demo, real impl needs transactional outbox)
- No event ordering guarantees beyond position (single-threaded append is ordered)