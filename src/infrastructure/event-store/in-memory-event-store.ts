import type { Event } from '../../domain/events/event.js';

export interface StoredEvent {
  readonly event: Event;
  readonly position: number;
}

export class InMemoryEventStore {
  private events: StoredEvent[] = [];
  private position = 0;
  private subscribers: Array<{ queue: Event[]; resolve: (value: Event) => void }> = [];

  public async append(event: Event): Promise<number> {
    this.position++;
    const stored = { event, position: this.position };
    this.events.push(stored);
    this.notifySubscribers(event);
    return this.position;
  }

  public async *readStream(fromPosition = 0, toPosition?: number): AsyncIterableIterator<Event> {
    for (const stored of this.events) {
      if (stored.position > fromPosition) {
        if (toPosition && stored.position > toPosition) break;
        yield stored.event;
      }
    }
  }

  public subscribe(): AsyncIterableIterator<Event> {
    const queue: Event[] = [];
    let resolve: (value: Event) => void;
    let promise = new Promise<Event>((r) => {
      resolve = r;
    });
    const subscriber = {
      queue,
      get resolve() { return resolve; },
      set resolve(v: (value: Event) => void) { resolve = v; }
    };
    this.subscribers.push(subscriber);

    return (async function* () {
      while (true) {
        if (queue.length > 0) {
          const event = queue.shift();
          if (event) yield event;
        } else {
          yield await promise;
          promise = new Promise<Event>((r) => {
            resolve = r;
          });
        }
      }
    })();
  }

  private notifySubscribers(event: Event): void {
    for (const sub of this.subscribers) {
      sub.queue.push(event);
      if (sub.resolve) {
        sub.resolve(event);
        sub.resolve = null as never;
      }
    }
  }

  public getPosition(): number {
    return this.position;
  }
}