# Spec: Event Base Classes (Event, EventHandler)

## Requirement: Immutable Event base class with metadata and correlation

### Scenario: Create Event with auto-generated metadata
- **GIVEN** an Event subclass
- **WHEN** instantiating with payload only
- **THEN** Event has:
  - `type` (abstract readonly string)
  - `payload` (typed, readonly)
  - `metadata`: { eventId (UUID), timestamp (Date), correlationId?, causationId? }

### Scenario: withCorrelation returns new Event with linked IDs
- **GIVEN** an Event instance
- **WHEN** calling `event.withCorrelation(correlationId)`
- **THEN** returns new Event with:
  - Same eventId, timestamp, payload, type
  - correlationId = provided
  - causationId = original eventId

### Scenario: Event immutability (compile-time)
- **GIVEN** an Event instance
- **WHEN** attempting to mutate payload or metadata properties
- **THEN** TypeScript compile error (readonly properties)

---

## Requirement: EventHandler port interface

### Scenario: Define handler contract for DI
- **GIVEN** an EventHandler<TEvent> interface
- **THEN** it requires:
  - `handles: string | "*"` (event type or wildcard)
  - `handle(event: TEvent): Promise<void>`

### Scenario: Wildcard handler for observability
- **GIVEN** a handler with `handles = "*"`
- **WHEN** any event is published
- **THEN** wildcard handler receives all events

---

## Non-goals
- Persistence/serialization (in-memory only)
- Event versioning/upcasting

---

## Related GitHub Issues
- #8 feat(domain): Event base class + EventHandler port