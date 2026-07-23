import { describe, it, expect } from 'vitest';
import type { EventHandler } from './event-handler.js';
import type { EventPayload } from '../events/event.js';
import { Event } from '../events/event.js';

interface TestPayload extends EventPayload {
  value: string;
}

class TestEvent extends Event<TestPayload> {
  public readonly type = 'TestEvent';
}

class TestHandler implements EventHandler<TestEvent> {
  public readonly handles = 'TestEvent';
  public handled: TestEvent[] = [];

  public async handle(event: TestEvent): Promise<void> {
    this.handled.push(event);
  }
}

describe('EventHandler', () => {
  it('has correct handles property', () => {
    const handler = new TestHandler();
    expect(handler.handles).toBe('TestEvent');
  });

  it('can handle events', async () => {
    const handler = new TestHandler();
    const evt = new TestEvent({ value: 'test' });
    await handler.handle(evt);
    expect(handler.handled).toHaveLength(1);
    expect(handler.handled[0]).toBe(evt);
  });

  it('supports wildcard handler', () => {
    class WildcardHandler implements EventHandler<TestEvent> {
      public readonly handles = '*';
      public async handle(): Promise<void> {}
    }
    const handler = new WildcardHandler();
    expect(handler.handles).toBe('*');
  });
});
