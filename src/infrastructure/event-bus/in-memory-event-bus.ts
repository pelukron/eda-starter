import type { Event } from '../../domain/events/event.js';
import type { EventHandler } from '../../domain/ports/event-handler.js';
import type { InMemoryEventStore } from '../../infrastructure/event-store/in-memory-event-store.js';

export class InMemoryEventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();
  private readonly wildcardHandlers = new Set<EventHandler>();
  private readonly eventStore?: InMemoryEventStore;

  constructor(eventStore?: InMemoryEventStore) {
    this.eventStore = eventStore;
  }

  public subscribe(handler: EventHandler): void {
    if (handler.handles === '*') {
      this.wildcardHandlers.add(handler);
    } else {
      if (!this.handlers.has(handler.handles)) {
        this.handlers.set(handler.handles, new Set());
      }
      this.handlers.get(handler.handles)?.add(handler);
    }
  }

  public unsubscribe(handler: EventHandler): void {
    if (handler.handles === '*') {
      this.wildcardHandlers.delete(handler);
    } else {
      this.handlers.get(handler.handles)?.delete(handler);
    }
  }

  public async publish<TEvent extends Event>(event: TEvent): Promise<void> {
    const exactHandlers = this.handlers.get(event.type) ?? new Set();
    const allHandlers = [...exactHandlers, ...this.wildcardHandlers];

    if (allHandlers.length === 0) {
      // Still append to store even if no handlers
      if (this.eventStore) {
        await this.eventStore.append(event);
      }
      return;
    }

    // Notify handlers
    await Promise.allSettled(allHandlers.map((handler) => handler.handle(event as never)));

    // Dual-write to EventStore
    if (this.eventStore) {
      await this.eventStore.append(event);
    }
  }

  public async publishAll<TEvent extends Event>(events: TEvent[]): Promise<void> {
    await Promise.all(events.map((e) => this.publish(e)));
  }

  public getSubscriberCount(eventType?: string): number {
    if (eventType) {
      return (this.handlers.get(eventType)?.size ?? 0) + this.wildcardHandlers.size;
    }
    let count = this.wildcardHandlers.size;
    for (const set of this.handlers.values()) {
      count += set.size;
    }
    return count;
  }
}
