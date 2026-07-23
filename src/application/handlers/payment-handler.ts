import type { OrderCreated } from '../../domain/events/order-events.js';
import { PaymentReserved } from '../../domain/events/order-events.js';
import type { EventHandler } from '../../domain/ports/event-handler.js';
import type { InMemoryEventBus } from '../../infrastructure/event-bus/in-memory-event-bus.js';

export class PaymentHandler implements EventHandler<OrderCreated> {
  public readonly handles = 'OrderCreated';

  constructor(private readonly bus: InMemoryEventBus) {}

  public async handle(event: OrderCreated): Promise<void> {
    const paymentId = `pay_${crypto.randomUUID().slice(0, 8)}`;
    const reserved = new PaymentReserved({
      orderId: event.payload.orderId,
      paymentId,
      amount: event.payload.total,
    }).withCorrelation(event.metadata.correlationId ?? event.metadata.eventId);

    await this.bus.publish(reserved);
  }
}
