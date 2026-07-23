# Spec: InMemoryEventBus with Wildcard Support

## Requirement: Async in-memory event bus with exact + wildcard subscriptions

### Scenario: Subscribe and publish to exact handler
- **GIVEN** an InMemoryEventBus and a handler for "OrderCreated"
- **WHEN** publishing OrderCreated event
- **THEN** handler.handle() called exactly once with the event

### Scenario: Wildcard handler receives all events
- **GIVEN** a wildcard handler (handles = "*") and exact handler for "OrderCreated"
- **WHEN** publishing OrderCreated and PaymentReserved events
- **THEN** wildcard handler receives BOTH events
- **AND** exact handler receives only OrderCreated

### Scenario: Multiple handlers for same event
- **GIVEN** two handlers subscribed to "OrderCreated"
- **WHEN** publishing OrderCreated event
- **THEN** both handlers.handle() called concurrently

### Scenario: Unsubscribe removes handler
- **GIVEN** a subscribed handler
- **WHEN** calling unsubscribe(handler)
- **THEN** subsequent publishes don't call handler

### Scenario: Publish to no subscribers succeeds silently
- **GIVEN** no handlers for event type
- **WHEN** publishing event
- **THEN** no error, returns resolved promise

### Scenario: Handler error doesn't stop other handlers
- **GIVEN** a good handler and a failing handler for same event
- **WHEN** publishing event
- **THEN** good handler still called
- **AND** failing handler error is caught (Promise.allSettled)

### Scenario: publishAll publishes concurrently
- **GIVEN** multiple events
- **WHEN** calling publishAll(events)
- **THEN** all events published concurrently
- **AND** handlers for each event called

### Scenario: Subscriber count for debugging
- **GIVEN** bus with exact + wildcard handlers
- **WHEN** calling getSubscriberCount("OrderCreated")
- **THEN** returns exact + wildcard count
- **AND** getSubscriberCount() returns total

---

## Non-goals
- Persistence/durability
- Event ordering guarantees
- Retry/dead letter queues

---

## Related GitHub Issues
- #9 feat(infra): InMemoryEventBus with wildcard support