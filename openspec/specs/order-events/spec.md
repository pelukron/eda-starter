# Spec: Order Flow Domain Events

## Requirement: Concrete domain events for e-commerce order flow

### Scenario: OrderCreated event with order details
- **GIVEN** an OrderCreated event
- **WHEN** instantiated with orderId, customerId, items[], total
- **THEN** event has:
  - type = "OrderCreated"
  - payload: { orderId, customerId, items: [{sku, qty, price}], total }
  - metadata (inherited from Event base)

### Scenario: PaymentReserved event with payment details
- **GIVEN** a PaymentReserved event
- **WHEN** instantiated with orderId, paymentId, amount
- **THEN** event has:
  - type = "PaymentReserved"
  - payload: { orderId, paymentId, amount }
  - correlationId linked to OrderCreated

### Scenario: InventoryReserved event with reserved items
- **GIVEN** an InventoryReserved event
- **WHEN** instantiated with orderId, items[]
- **THEN** event has:
  - type = "InventoryReserved"
  - payload: { orderId, items: [{sku, qty}] }

### Scenario: OrderConfirmed event for successful completion
- **GIVEN** an OrderConfirmed event
- **WHEN** instantiated with orderId
- **THEN** event has type = "OrderConfirmed", payload: { orderId }

### Scenario: OrderFailed event for compensation
- **GIVEN** an OrderFailed event
- **WHEN** instantiated with orderId, reason
- **THEN** event has type = "OrderFailed", payload: { orderId, reason }

### Scenario: All events exported from domain events index
- **GIVEN** src/domain/events/index.ts
- **WHEN** importing from 'eda-starter/domain/events'
- **THEN** all 5 events + Event base are exported

---

## Non-goals
- Event versioning/upcasting
- Event serialization

---

## Related GitHub Issues
- #10 feat(domain): Order flow events (OrderCreated, PaymentReserved, ...)