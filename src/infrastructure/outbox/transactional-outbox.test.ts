import { beforeEach, describe, expect, it } from 'vitest';
import { Event } from '../../domain/events/event.js';
import { InMemoryEventBus } from '../event-bus/in-memory-event-bus.js';
import { InMemoryEventStore } from '../event-store/in-memory-event-store.js';
import { type EventPublisher, OutboxRelay, TransactionalOutbox } from './transactional-outbox.js';

class TestEvent extends Event<{ value: string }> {
  public readonly type = 'TestEvent';
}

class SpyPublisher implements EventPublisher {
  public readonly published: Event[] = [];

  public async publish(event: Event): Promise<void> {
    this.published.push(event);
  }
}

describe('TransactionalOutbox', () => {
  let outbox: TransactionalOutbox;

  beforeEach(() => {
    outbox = new TransactionalOutbox();
  });

  it('saves an event as pending with its event id', async () => {
    const event = new TestEvent({ value: 'a' });
    await outbox.save(event);

    const pending = await outbox.getPending();
    expect(pending).toHaveLength(1);
    expect(pending[0]?.id).toBe(event.metadata.eventId);
    expect(pending[0]?.event).toBe(event);
  });

  it('does not duplicate an event saved twice', async () => {
    const event = new TestEvent({ value: 'a' });
    await outbox.save(event);
    await outbox.save(event);

    expect(await outbox.getPending()).toHaveLength(1);
  });

  it('marks events as published and removes them from pending', async () => {
    const event = new TestEvent({ value: 'a' });
    await outbox.save(event);
    await outbox.markPublished([event.metadata.eventId]);

    expect(await outbox.getPending()).toHaveLength(0);
  });

  it('markPublished is idempotent', async () => {
    const event = new TestEvent({ value: 'a' });
    await outbox.save(event);

    await outbox.markPublished([event.metadata.eventId]);
    await outbox.markPublished([event.metadata.eventId]);

    expect(await outbox.getPending()).toHaveLength(0);
  });

  it('ignores unknown ids', async () => {
    await expect(outbox.markPublished(['missing-id'])).resolves.toBeUndefined();
  });

  it('preserves insertion order', async () => {
    const first = new TestEvent({ value: 'first' });
    const second = new TestEvent({ value: 'second' });
    await outbox.save(first);
    await outbox.save(second);

    const pending = await outbox.getPending();
    expect(pending.map((entry) => entry.event)).toEqual([first, second]);
  });
});

describe('OutboxRelay', () => {
  it('publishes pending events and marks them published', async () => {
    const outbox = new TransactionalOutbox();
    const publisher = new SpyPublisher();
    const relay = new OutboxRelay(outbox, publisher);
    const event = new TestEvent({ value: 'a' });
    await outbox.save(event);

    const publishedCount = await relay.poll();

    expect(publishedCount).toBe(1);
    expect(publisher.published).toEqual([event]);
    expect(await outbox.getPending()).toHaveLength(0);
  });

  it('dual-writes through the event bus into the event store', async () => {
    const store = new InMemoryEventStore();
    const bus = new InMemoryEventBus(store);
    const outbox = new TransactionalOutbox();
    const relay = new OutboxRelay(outbox, bus);
    const event = new TestEvent({ value: 'a' });
    await outbox.save(event);

    await relay.poll();

    expect(store.getPosition()).toBe(1);
  });

  it('leaves events pending when publishing fails', async () => {
    const outbox = new TransactionalOutbox();
    const failingPublisher: EventPublisher = {
      async publish(): Promise<void> {
        throw new Error('publisher down');
      },
    };
    const relay = new OutboxRelay(outbox, failingPublisher);
    const event = new TestEvent({ value: 'a' });
    await outbox.save(event);

    await expect(relay.poll()).rejects.toThrow('publisher down');
    expect(await outbox.getPending()).toHaveLength(1);
  });

  it('does not republish already published events', async () => {
    const outbox = new TransactionalOutbox();
    const publisher = new SpyPublisher();
    const relay = new OutboxRelay(outbox, publisher);
    const event = new TestEvent({ value: 'a' });
    await outbox.save(event);

    await relay.poll();
    await relay.poll();

    expect(publisher.published).toEqual([event]);
  });
});
