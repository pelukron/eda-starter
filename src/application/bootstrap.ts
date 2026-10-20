import { InMemoryEventBus } from '../infrastructure/event-bus/in-memory-event-bus.js';
import { InMemoryEventStore } from '../infrastructure/event-store/in-memory-event-store.js';
import { OutboxRelay, TransactionalOutbox } from '../infrastructure/outbox/transactional-outbox.js';
import { InventoryHandler } from './handlers/inventory-handler.js';
import { NotificationHandler } from './handlers/notification-handler.js';
import { PaymentHandler } from './handlers/payment-handler.js';
import { OrderSaga } from './sagas/order-saga.js';

export async function buildApplication(): Promise<{
  bus: InMemoryEventBus;
  store: InMemoryEventStore;
  saga: OrderSaga;
  outbox: TransactionalOutbox;
  relay: OutboxRelay;
}> {
  const store = new InMemoryEventStore();
  const bus = new InMemoryEventBus(store);
  const saga = new OrderSaga(bus);
  const outbox = new TransactionalOutbox();
  const relay = new OutboxRelay(outbox, bus);

  bus.subscribe(saga);
  bus.subscribe(new PaymentHandler(bus));
  bus.subscribe(new InventoryHandler(bus));
  bus.subscribe(new NotificationHandler());

  return { bus, store, saga, outbox, relay };
}
