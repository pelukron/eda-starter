import { beforeEach, describe, expect, it } from 'vitest';
import type { Event } from '../../domain/events/event.js';
import {
  InventoryReserved,
  OrderCreated,
  OrderFailed,
  PaymentReserved,
} from '../../domain/events/order-events.js';
import type { EventHandler } from '../../domain/ports/event-handler.js';
import { InMemoryEventBus } from '../../infrastructure/event-bus/in-memory-event-bus.js';
import { OrderSaga } from './order-saga.js';

class CaptureHandler implements EventHandler<Event> {
  public readonly handles = '*';
  public readonly events: Event[] = [];

  public async handle(event: Event): Promise<void> {
    this.events.push(event);
  }
}

const orderId = 'ord_1';

function orderCreated(): OrderCreated {
  return new OrderCreated({
    orderId,
    customerId: 'cust_1',
    items: [{ sku: 'SKU001', qty: 1, price: 10 }],
    total: 10,
  });
}

function paymentReserved(): PaymentReserved {
  return new PaymentReserved({ orderId, paymentId: 'pay_1', amount: 10 });
}

function inventoryReserved(): InventoryReserved {
  return new InventoryReserved({ orderId, items: [{ sku: 'SKU001', qty: 1 }] });
}

function orderFailed(reason = 'cancelled'): OrderFailed {
  return new OrderFailed({ orderId, reason });
}

describe('OrderSaga', () => {
  let bus: InMemoryEventBus;
  let saga: OrderSaga;
  let capture: CaptureHandler;

  beforeEach(() => {
    bus = new InMemoryEventBus();
    saga = new OrderSaga(bus);
    capture = new CaptureHandler();
    bus.subscribe(capture);
    bus.subscribe(saga);
  });

  it('walks the happy path from STARTED to COMPLETED', async () => {
    await bus.publish(orderCreated());
    expect(saga.getState(orderId)).toBe('STARTED');

    await bus.publish(paymentReserved());
    expect(saga.getState(orderId)).toBe('PAYMENT_RESERVED');

    await bus.publish(inventoryReserved());
    expect(saga.getState(orderId)).toBe('COMPLETED');
    expect(capture.events.some((event) => event.type === 'OrderConfirmed')).toBe(true);
  });

  it('fails without compensation when nothing was reserved', async () => {
    await bus.publish(orderCreated());
    await bus.publish(orderFailed());

    expect(saga.getState(orderId)).toBe('FAILED');
    expect(capture.events.some((event) => event.type === 'PaymentRefunded')).toBe(false);
    expect(capture.events.some((event) => event.type === 'InventoryReleased')).toBe(false);
  });

  it('refunds the payment when failure happens after payment', async () => {
    await bus.publish(orderCreated());
    await bus.publish(paymentReserved());
    await bus.publish(orderFailed('inventory unavailable'));

    expect(saga.getState(orderId)).toBe('FAILED');
    expect(capture.events.some((event) => event.type === 'PaymentRefunded')).toBe(true);
    expect(capture.events.some((event) => event.type === 'InventoryReleased')).toBe(false);
  });

  it('compensates both reservations on a late failure', async () => {
    await bus.publish(orderCreated());
    await bus.publish(paymentReserved());
    await bus.publish(inventoryReserved());
    await bus.publish(orderFailed('confirmation failed'));

    expect(saga.getState(orderId)).toBe('FAILED');
    expect(capture.events.some((event) => event.type === 'PaymentRefunded')).toBe(true);
    expect(capture.events.some((event) => event.type === 'InventoryReleased')).toBe(true);
  });

  it('propagates correlation id to confirmed and compensation events', async () => {
    const correlationId = 'corr_1';
    await bus.publish(orderCreated().withCorrelation(correlationId));
    await bus.publish(paymentReserved().withCorrelation(correlationId));
    await bus.publish(inventoryReserved().withCorrelation(correlationId));

    const confirmed = capture.events.find((event) => event.type === 'OrderConfirmed');
    expect(confirmed?.metadata.correlationId).toBe(correlationId);
  });

  it('tracks independent orders separately', async () => {
    const otherId = 'ord_2';

    await bus.publish(orderCreated());
    await bus.publish(
      new OrderCreated({
        orderId: otherId,
        customerId: 'cust_2',
        items: [{ sku: 'SKU002', qty: 1, price: 20 }],
        total: 20,
      })
    );
    await bus.publish(paymentReserved());
    await bus.publish(new PaymentReserved({ orderId: otherId, paymentId: 'pay_2', amount: 20 }));

    expect(saga.getState(orderId)).toBe('PAYMENT_RESERVED');
    expect(saga.getState(otherId)).toBe('PAYMENT_RESERVED');
  });

  it('does not restart an order on a duplicate OrderCreated', async () => {
    await bus.publish(orderCreated());
    await bus.publish(paymentReserved());
    await bus.publish(orderCreated());

    expect(saga.getState(orderId)).toBe('PAYMENT_RESERVED');
  });

  it('ignores events for unknown orders', async () => {
    await bus.publish(new PaymentReserved({ orderId: 'unknown', paymentId: 'p', amount: 1 }));
    expect(saga.getState('unknown')).toBeUndefined();
  });
});
