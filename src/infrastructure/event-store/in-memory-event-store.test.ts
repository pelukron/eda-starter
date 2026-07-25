import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryEventStore } from './in-memory-event-store.js';
import { Event } from '../../domain/events/event.js';

class TestEvent extends Event {
  readonly type = 'TestEvent';
  constructor(public readonly payload: { value: string }) {
    super();
  }
}

describe('InMemoryEventStore', () => {
  let store: InMemoryEventStore;

  beforeEach(() => {
    store = new InMemoryEventStore();
  });

  describe('append', () => {
    it('appends event and returns position', async () => {
      const event = new TestEvent({ value: 'a' });
      const pos = await store.append(event);
      expect(pos).toBe(1);
    });

    it('assigns monotonically increasing positions', async () => {
      const pos1 = await store.append(new TestEvent({ value: 'a' }));
      const pos2 = await store.append(new TestEvent({ value: 'b' }));
      const pos3 = await store.append(new TestEvent({ value: 'c' }));

      expect(pos1).toBe(1);
      expect(pos2).toBe(2);
      expect(pos3).toBe(3);
    });

    it('positions are unique', async () => {
      const positions = new Set<number>();
      for (let i = 0; i < 10; i++) {
        const pos = await store.append(new TestEvent({ value: String(i) }));
        expect(positions.has(pos)).toBe(false);
        positions.add(pos);
      }
    });
  });

  describe('readStream', () => {
    beforeEach(async () => {
      await store.append(new TestEvent({ value: 'a' })); // pos 1
      await store.append(new TestEvent({ value: 'b' })); // pos 2
      await store.append(new TestEvent({ value: 'c' })); // pos 3
      await store.append(new TestEvent({ value: 'd' })); // pos 4
      await store.append(new TestEvent({ value: 'e' })); // pos 5
    });

    it('reads from position (exclusive) to position (inclusive)', async () => {
      const events: TestEvent[] = [];
      for await (const event of store.readStream(2, 4)) {
        events.push(event as TestEvent);
      }
      expect(events.map(e => e.payload.value)).toEqual(['c', 'd']);
    });

    it('reads from beginning when no fromPosition', async () => {
      const events: TestEvent[] = [];
      for await (const event of store.readStream()) {
        events.push(event as TestEvent);
      }
      expect(events.map(e => e.payload.value)).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('reads to end when no toPosition', async () => {
      const events: TestEvent[] = [];
      for await (const event of store.readStream(3)) {
        events.push(event as TestEvent);
      }
      expect(events.map(e => e.payload.value)).toEqual(['d', 'e']);
    });

    it('returns empty when fromPosition >= last position', async () => {
      const events: TestEvent[] = [];
      for await (const event of store.readStream(5)) {
        events.push(event as TestEvent);
      }
      expect(events).toEqual([]);
    });
  });

  describe('subscribe', () => {
    it('yields future appended events', async () => {
      const received: TestEvent[] = [];
      const iterator = store.subscribe();

      await store.append(new TestEvent({ value: 'first' }));
      await store.append(new TestEvent({ value: 'second' }));

      let count = 0;
      for await (const event of iterator) {
        received.push(event as TestEvent);
        count++;
        if (count === 2) break;
      }

      expect(received.map(e => e.payload.value)).toEqual(['first', 'second']);
    });

    it('does not replay existing events', async () => {
      await store.append(new TestEvent({ value: 'existing' }));

      const received: TestEvent[] = [];
      const iterator = store.subscribe();

      await store.append(new TestEvent({ value: 'new' }));

      let count = 0;
      for await (const event of iterator) {
        received.push(event as TestEvent);
        count++;
        if (count === 1) break;
      }

      expect(received.map(e => e.payload.value)).toEqual(['new']);
    });

    it('multiple subscribers receive same events', async () => {
      const received1: TestEvent[] = [];
      const received2: TestEvent[] = [];

      const iterator1 = store.subscribe();
      const iterator2 = store.subscribe();

      await store.append(new TestEvent({ value: 'shared' }));

      let count1 = 0, count2 = 0;
      const promises = [
        (async () => {
          for await (const event of iterator1) {
            received1.push(event as TestEvent);
            count1++;
            if (count1 === 1) break;
          }
        })(),
        (async () => {
          for await (const event of iterator2) {
            received2.push(event as TestEvent);
            count2++;
            if (count2 === 1) break;
          }
        })(),
      ];

      await Promise.all(promises);

      expect(received1[0].payload.value).toBe('shared');
      expect(received2[0].payload.value).toBe('shared');
    });
  });

  describe('getPosition', () => {
    it('returns 0 when empty', () => {
      expect(store.getPosition()).toBe(0);
    });

    it('returns highest assigned position', async () => {
      await store.append(new TestEvent({ value: 'a' }));
      await store.append(new TestEvent({ value: 'b' }));
      expect(store.getPosition()).toBe(2);
    });
  });
});