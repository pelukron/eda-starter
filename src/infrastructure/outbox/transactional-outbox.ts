import type { Event } from '../../domain/events/event.js';

export interface EventPublisher {
  publish(event: Event): Promise<void>;
}

export interface OutboxEntry {
  readonly id: string;
  readonly event: Event;
  readonly savedAt: Date;
  readonly publishedAt?: Date;
}

export class TransactionalOutbox {
  private readonly entries = new Map<string, OutboxEntry>();

  public async save(event: Event): Promise<void> {
    const id = event.metadata.eventId;
    if (this.entries.has(id)) {
      return;
    }

    this.entries.set(id, { id, event, savedAt: new Date() });
  }

  public async getPending(): Promise<OutboxEntry[]> {
    return [...this.entries.values()].filter((entry) => entry.publishedAt === undefined);
  }

  public async markPublished(ids: readonly string[]): Promise<void> {
    for (const id of ids) {
      const entry = this.entries.get(id);
      if (entry && entry.publishedAt === undefined) {
        this.entries.set(id, { ...entry, publishedAt: new Date() });
      }
    }
  }
}

export class OutboxRelay {
  constructor(
    private readonly outbox: TransactionalOutbox,
    private readonly publisher: EventPublisher
  ) {}

  public async poll(): Promise<number> {
    const pending = await this.outbox.getPending();
    let published = 0;

    for (const entry of pending) {
      await this.publisher.publish(entry.event);
      await this.outbox.markPublished([entry.id]);
      published++;
    }

    return published;
  }
}
