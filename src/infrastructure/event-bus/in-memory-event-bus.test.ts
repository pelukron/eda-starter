import { beforeEach, describe, expect, it } from 'vitest';
import type { EventPayload } from '../../domain/events/event.js';
import { Event } from '../../domain/events/event.js';
import type { EventHandler } from '../../domain/ports/event-handler.js';
import { InMemoryEventBus } from './in-memory-event-bus.js';

interface TestPayload extends EventPayload {
  value: string;
}

class TestEvent extends Event<TestPayload> {
  public readonly type = 'TestEvent';
}

class OtherEvent extends Event<TestPayload> {
  public readonly type = 'OtherEvent';
}

class TestHandler implements EventHandler<TestEvent> {
  public readonly handles = 'TestEvent';
  public handled: TestEvent[] = [];
  public async handle(event: TestEvent): Promise<void> {
    this.handled.push(event);
  }
}

class WildcardHandler implements EventHandler<Event> {
  public readonly handles = '*';
  public handled: Event[] = [];
  public async handle(event: Event): Promise<void> {
    this.handled.push(event);
  }
}

class FailingHandler implements EventHandler<TestEvent> {
  public readonly handles = 'TestEvent';
  public async handle(): Promise<void> {
    throw new Error('Handler failed');
  }
}

describe('InMemoryEventBus', () => {
  let bus: InMemoryEventBus;

  beforeEach(() => {
    bus = new InMemoryEventBus();
  });

  it('subscribes and publishes to exact handler', async () => {
    const handler = new TestHandler();
    bus.subscribe(handler);

    const evt = new TestEvent({ value: 'hello' });
    await bus.publish(evt);

    expect(handler.handled).toHaveLength(1);
    expect(handler.handled[0]).toBe(evt);
  });

  it('wildcard handler receives all events', async () => {
    const wildcard = new WildcardHandler();
    bus.subscribe(wildcard);

    const evt1 = new TestEvent({ value: '1' });
    const evt2 = new OtherEvent({ value: '2' });

    await bus.publish(evt1);
    await bus.publish(evt2);

    expect(wildcard.handled).toHaveLength(2);
  });

  it('multiple handlers for same event all called', async () => {
    const h1 = new TestHandler();
    const h2 = new TestHandler();
    bus.subscribe(h1);
    bus.subscribe(h2);

    const evt = new TestEvent({ value: 'x' });
    await bus.publish(evt);

    expect(h1.handled).toHaveLength(1);
    expect(h2.handled).toHaveLength(1);
  });

  it('unsubscribe removes handler', async () => {
    const handler = new TestHandler();
    bus.subscribe(handler);
    bus.unsubscribe(handler);

    const evt = new TestEvent({ value: 'y' });
    await bus.publish(evt);

    expect(handler.handled).toHaveLength(0);
  });

  it('publish to no subscribers does not error', async () => {
    const evt = new TestEvent({ value: 'z' });
    await expect(bus.publish(evt)).resolves.not.toThrow();
  });

  it('handler error does not stop other handlers', async () => {
    const good = new TestHandler();
    const bad = new FailingHandler();
    bus.subscribe(good);
    bus.subscribe(bad);

    const evt = new TestEvent({ value: 'err' });
    await bus.publish(evt);

    expect(good.handled).toHaveLength(1);
  });

  it('publishAll publishes concurrently', async () => {
    const handler = new TestHandler();
    bus.subscribe(handler);

    const events = [
      new TestEvent({ value: '1' }),
      new TestEvent({ value: '2' }),
      new TestEvent({ value: '3' }),
    ];

    await bus.publishAll(events);
    expect(handler.handled).toHaveLength(3);
  });

  it('getSubscriberCount returns correct counts', () => {
    const h1 = new TestHandler();
    const h2 = new WildcardHandler();
    bus.subscribe(h1);
    bus.subscribe(h2);

    expect(bus.getSubscriberCount('TestEvent')).toBe(2);
    expect(bus.getSubscriberCount('OtherEvent')).toBe(1);
    expect(bus.getSubscriberCount()).toBe(2);
  });
});
