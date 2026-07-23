import type { Event } from '../events/event.js';

export interface EventHandler<TEvent extends Event = Event> {
  readonly handles: string | '*';
  handle(event: TEvent): Promise<void>;
}

export type EventHandlerClass<TEvent extends Event = Event> = new (
  ...args: unknown[]
) => EventHandler<TEvent>;
