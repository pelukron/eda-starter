import type { Event } from '../../domain/events/event.js';
import type { EventHandler } from '../../domain/ports/event-handler.js';
import type { InMemoryEventStore } from '../../infrastructure/event-store/in-memory-event-store.js';

export class InMemoryEventBus {
  private readonly handlers = new Set<EventHandler>();
  private readonly eventStore?: InMemoryEventStore;

  constructor(eventStore?: InMemoryEventStore) {
    this.eventStore = eventStore;
  }

  public subscribe(handler: EventHandler): void {
    this.handlers.add(handler);
  }

  public unsubscribe(handler: EventHandler): void {
    this.handlers.delete(handler);
  }

  public async publish<TEvent extends Event>(event: TEvent): Promise<void> {
    // Persist before dispatch so the store keeps causal order even when a
    // handler publishes follow-up events (nested publishes).
    if (this.eventStore) {
      await this.eventStore.append(event);
    }

    const allHandlers = [...this.handlers].filter(
      (handler) => handler.handles === '*' || handler.handles === event.type
    );

    if (allHandlers.length === 0) {
      return;
    }

    // Handlers run in subscription order, so producers wired after a saga
    // cannot publish follow-up events before the saga observes the cause.
    await Promise.allSettled(allHandlers.map((handler) => handler.handle(event as never)));
  }

  public async publishAll<TEvent extends Event>(events: TEvent[]): Promise<void> {
    await Promise.all(events.map((e) => this.publish(e)));
  }

  public getSubscriberCount(eventType?: string): number {
    if (eventType) {
      return [...this.handlers].filter(
        (handler) => handler.handles === '*' || handler.handles === eventType
      ).length;
    }
    return this.handlers.size;
  }
}
