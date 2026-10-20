import type { Event } from '../../domain/events/event.js';
import {
  InventoryReleased,
  type InventoryReserved,
  OrderConfirmed,
  type OrderCreated,
  type OrderFailed,
  PaymentRefunded,
  type PaymentRefundedPayload,
  type PaymentReserved,
} from '../../domain/events/order-events.js';
import type { EventHandler } from '../../domain/ports/event-handler.js';
import type { InMemoryEventBus } from '../../infrastructure/event-bus/in-memory-event-bus.js';

export type SagaState =
  | 'STARTED'
  | 'PAYMENT_RESERVED'
  | 'INVENTORY_RESERVED'
  | 'COMPLETED'
  | 'FAILED'
  | 'COMPENSATING';

interface InventoryReservation {
  readonly items: readonly { readonly sku: string; readonly qty: number }[];
}

interface OrderContext {
  state: SagaState;
  payment?: PaymentRefundedPayload;
  inventory?: InventoryReservation;
}

export class OrderSaga implements EventHandler<Event> {
  public readonly handles = '*';

  private readonly orders = new Map<string, OrderContext>();

  constructor(private readonly bus: InMemoryEventBus) {}

  public getState(orderId: string): SagaState | undefined {
    return this.orders.get(orderId)?.state;
  }

  public async handle(event: Event): Promise<void> {
    switch (event.type) {
      case 'OrderCreated':
        this.onOrderCreated(event as OrderCreated);
        return;
      case 'PaymentReserved':
        this.onPaymentReserved(event as PaymentReserved);
        return;
      case 'InventoryReserved':
        await this.onInventoryReserved(event as InventoryReserved);
        return;
      case 'OrderFailed':
        await this.onOrderFailed(event as OrderFailed);
        return;
      default:
        return;
    }
  }

  private onOrderCreated(event: OrderCreated): void {
    if (!this.orders.has(event.payload.orderId)) {
      this.orders.set(event.payload.orderId, { state: 'STARTED' });
    }
  }

  private onPaymentReserved(event: PaymentReserved): void {
    const context = this.orders.get(event.payload.orderId);
    if (context?.state !== 'STARTED') {
      return;
    }

    context.state = 'PAYMENT_RESERVED';
    context.payment = {
      orderId: event.payload.orderId,
      paymentId: event.payload.paymentId,
      amount: event.payload.amount,
    };
  }

  private async onInventoryReserved(event: InventoryReserved): Promise<void> {
    const context = this.orders.get(event.payload.orderId);
    if (context?.state !== 'PAYMENT_RESERVED') {
      return;
    }

    context.state = 'INVENTORY_RESERVED';
    context.inventory = { items: event.payload.items };

    await this.bus.publish(
      new OrderConfirmed({ orderId: event.payload.orderId }).withCorrelation(
        this.correlationId(event)
      )
    );

    context.state = 'COMPLETED';
  }

  private async onOrderFailed(event: OrderFailed): Promise<void> {
    const context = this.orders.get(event.payload.orderId);
    if (!context || context.state === 'FAILED' || context.state === 'COMPENSATING') {
      return;
    }

    context.state = 'COMPENSATING';
    const correlationId = this.correlationId(event);

    if (context.inventory) {
      await this.bus.publish(
        new InventoryReleased({
          orderId: event.payload.orderId,
          items: context.inventory.items,
        }).withCorrelation(correlationId)
      );
    }

    if (context.payment) {
      await this.bus.publish(new PaymentRefunded(context.payment).withCorrelation(correlationId));
    }

    context.state = 'FAILED';
  }

  private correlationId(event: Event): string {
    return event.metadata.correlationId ?? event.metadata.eventId;
  }
}
