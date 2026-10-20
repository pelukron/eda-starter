#!/usr/bin/env tsx
import { randomUUID } from 'node:crypto';
import { buildApplication } from './application/bootstrap.js';
import { OrderCreated, OrderFailed } from './domain/events/order-events.js';

async function main() {
  console.log('🚀 EDA Starter Demo — Event-Driven Order Flow');
  console.log('='.repeat(50));

  const { bus } = await buildApplication();

  const order = new OrderCreated({
    orderId: `ord_${randomUUID().slice(0, 8)}`,
    customerId: 'cust_123',
    items: [{ sku: 'SKU001', qty: 2, price: 29.99 }],
    total: 59.98,
  });

  console.log(`📥 Publishing: ${order.type} (order=${order.payload.orderId})`);
  await bus.publish(order);

  console.log('\n↩️  Publishing a late failure to demonstrate compensation');
  await bus.publish(
    new OrderFailed({
      orderId: order.payload.orderId,
      reason: 'demo compensation',
    })
  );

  await new Promise((r) => setTimeout(r, 100));
  console.log('\n✅ Demo complete — check logs above for event flow');
}

main().catch(console.error);
