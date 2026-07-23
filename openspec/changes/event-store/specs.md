# EventStore Specs

## ADDED Requirements

### Requirement: Append-only event log with position tracking
The EventStore SHALL provide an append-only log that assigns monotonically increasing positions to each event.

#### Scenario: Appending events assigns increasing positions
- **WHEN** appending multiple events sequentially
- **THEN** each event gets position = previous position + 1
- **AND** positions are unique and monotonically increasing

### Requirement: Stream reads from arbitrary positions
The EventStore SHALL allow reading events from any position to any position.

#### Scenario: Reading stream from position
- **GIVEN** events at positions 1, 2, 3, 4, 5
- **WHEN** reading stream from position 2 to position 4
- **THEN** returns events at positions 3, 4 (exclusive of from, inclusive of to)

#### Scenario: Reading stream from beginning
- **WHEN** reading stream with no fromPosition
- **THEN** returns all events from position 0

#### Scenario: Reading stream with no upper bound
- **WHEN** reading stream with no toPosition
- **THEN** returns events from fromPosition to end

### Requirement: Live subscriptions for real-time consumers
The EventStore SHALL provide live subscriptions that yield events as they are appended.

#### Scenario: Subscribing to live events
- **WHEN** subscribing to event store
- **THEN** returns async iterator that yields future appended events
- **AND** existing events are NOT replayed (only new events)

#### Scenario: Multiple subscribers receive same events
- **GIVEN** multiple subscribers
- **WHEN** appending an event
- **THEN** all subscribers receive the event

### Requirement: Dual-write from EventBus
The InMemoryEventBus SHALL write to EventStore on every publish.

#### Scenario: EventBus publishes and appends to EventStore
- **GIVEN** EventBus wired with EventStore
- **WHEN** publishing an event
- **THEN** event handlers are notified
- **AND** event is appended to EventStore with new position

### Requirement: Position tracking
The EventStore SHALL expose current log position for debugging and monitoring.

#### Scenario: Getting current position
- **GIVEN** events appended
- **WHEN** calling getPosition()
- **THEN** returns highest assigned position