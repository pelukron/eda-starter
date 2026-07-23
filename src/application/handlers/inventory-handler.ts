import type { PaymentReserved } from '../../domain/events/order-events.js';
import { InventoryReserved } from '../../domain/events/order-events.js';
import type { EventHandler } from '../../domain/ports/event-handler.js';
import type { InMemoryEventBus } from '../../infrastructure/event-bus/in-memory-event-bus.js';

export class InventoryHandler implements EventHandler<PaymentReserved> {
  public readonly handles = 'PaymentReserved';

  constructor(private readonly bus: InMemoryEventBus) {}

  public async handle(event: PaymentReserved): Promise<void> {
    const reserved = new InventoryReserved({
      orderId: event.payload.orderId,
      items: [{ sku: 'SKU001', qty: 2 }],
    }).withCorrelation(event.metadata.correlationId ?? event.metadata.eventId);

    await this.bus.publish(reserved);
  }
}
