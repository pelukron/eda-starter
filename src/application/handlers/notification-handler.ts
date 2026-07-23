import type { EventHandler } from '../../domain/ports/event-handler.js';
import type { Event } from '../../domain/events/event.js';

export class NotificationHandler implements EventHandler<Event> {
  public readonly handles = '*';

  public async handle(event: Event): Promise<void> {
    console.log(`📬 [Notification] ${event.type}:`, event.payload);
  }
}
