## Why
Implement Event Sourcing pattern with an in-memory append-only Event Store to enable:
- Event replay for debugging and testing
- Live subscriptions for real-time consumers
- Foundation for Saga orchestration and Outbox pattern

## What Changes
Add `InMemoryEventStore` with append-only log, stream reads, and live subscriptions. Wire `EventBus.publish` → `EventStore.append` for dual-write.

## Capabilities

### New Capabilities
- `event-store`: In-memory append-only event log with stream reads and live subscriptions

### Modified Capabilities
- `event-bus`: Dual-write to EventStore on publish (dual-write pattern)

## Impact
- New files: `src/infrastructure/event-store/in-memory-event-store.ts`, tests, exports
- Modified: `src/infrastructure/event-bus/in-memory-event-bus.ts` (dual-write), `src/application/bootstrap.ts` (wire EventStore)
- Tests: unit tests for append, read stream, live subscription, position tracking