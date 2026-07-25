import { InMemoryEventBus } from '../infrastructure/event-bus/in-memory-event-bus.js';
import { InMemoryEventStore } from '../infrastructure/event-store/in-memory-event-store.js';
import { InventoryHandler } from './handlers/inventory-handler.js';
import { NotificationHandler } from './handlers/notification-handler.js';
import { PaymentHandler } from './handlers/payment-handler.js';

export async function buildApplication(): Promise<{
  bus: InMemoryEventBus;
  store: InMemoryEventStore;
}> {
  const store = new InMemoryEventStore();
  const bus = new InMemoryEventBus(store);
  bus.subscribe(new PaymentHandler(bus));
  bus.subscribe(new InventoryHandler(bus));
  bus.subscribe(new NotificationHandler());
  return { bus, store };
}
