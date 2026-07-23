import { InMemoryEventBus } from '../infrastructure/event-bus/in-memory-event-bus.js';
import { InventoryHandler } from './handlers/inventory-handler.js';
import { NotificationHandler } from './handlers/notification-handler.js';
import { PaymentHandler } from './handlers/payment-handler.js';

export async function buildApplication(): Promise<InMemoryEventBus> {
  const bus = new InMemoryEventBus();
  bus.subscribe(new PaymentHandler(bus));
  bus.subscribe(new InventoryHandler(bus));
  bus.subscribe(new NotificationHandler());
  return bus;
}
