import { randomUUID } from "node:crypto";

export interface EventMetadata {
  readonly eventId: string;
  readonly timestamp: Date;
  readonly correlationId?: string;
  readonly causationId?: string;
}

export interface EventPayload {
  readonly [key: string]: unknown;
}

export abstract class Event<TPayload extends EventPayload = EventPayload> {
  public readonly metadata: EventMetadata;
  public abstract readonly type: string;

  protected constructor(
    public readonly payload: TPayload,
    metadata?: Partial<EventMetadata>
  ) {
    this.metadata = {
      eventId: metadata?.eventId ?? randomUUID(),
      timestamp: metadata?.timestamp ?? new Date(),
      correlationId: metadata?.correlationId,
      causationId: metadata?.causationId,
    };
  }

  public withCorrelation(correlationId: string): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this, {
      metadata: { ...this.metadata, correlationId, causationId: this.metadata.eventId },
    });
  }
}