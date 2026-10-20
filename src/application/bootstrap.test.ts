import { describe, expect, it } from 'vitest';
import { OrderCreated, OrderFailed } from '../domain/events/order-events.js';
import { buildApplication } from './bootstrap.js';

describe('buildApplication', () => {
  it('completes an order through the handlers and the saga', async () => {
    const { bus, saga, store } = await buildApplication();
    const order = new OrderCreated({
      orderId: 'ord_integration',
      customerId: 'cust_1',
      items: [{ sku: 'SKU001', qty: 1, price: 10 }],
      total: 10,
    });

    await bus.publish(order);

    expect(saga.getState(order.payload.orderId)).toBe('COMPLETED');

    const types: string[] = [];
    for await (const event of store.readStream()) {
      types.push(event.type);
    }
    expect(types).toEqual([
      'OrderCreated',
      'PaymentReserved',
      'InventoryReserved',
      'OrderConfirmed',
    ]);
  });

  it('compensates a failed order through the saga', async () => {
    const { bus, saga } = await buildApplication();
    const order = new OrderCreated({
      orderId: 'ord_failed',
      customerId: 'cust_1',
      items: [{ sku: 'SKU001', qty: 1, price: 10 }],
      total: 10,
    });

    await bus.publish(order);
    await bus.publish(new OrderFailed({ orderId: order.payload.orderId, reason: 'late failure' }));

    expect(saga.getState(order.payload.orderId)).toBe('FAILED');
  });
});
