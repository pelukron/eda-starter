#!/usr/bin/env tsx
import { buildApplication } from './application/bootstrap.js';
import { OrderCreated } from './domain/events/order-events.js';
import { randomUUID } from 'node:crypto';

async function main() {
  console.log('🚀 EDA Starter Demo — Event-Driven Order Flow');
  console.log('='.repeat(50));

  const bus = await buildApplication();

  const order = new OrderCreated({
    orderId: `ord_${randomUUID().slice(0, 8)}`,
    customerId: 'cust_123',
    items: [{ sku: 'SKU001', qty: 2, price: 29.99 }],
    total: 59.98,
  });

  console.log(`📥 Publishing: ${order.type} (order=${order.payload.orderId})`);
  await bus.publish(order);

  await new Promise((r) => setTimeout(r, 100));
  console.log('\n✅ Demo complete — check logs above for event flow');
}

main().catch(console.error);
