import { describe, it, expect } from "vitest";
import { Event, EventPayload } from "./event.js";

interface TestPayload extends EventPayload {
  value: string;
}

class TestEvent extends Event<TestPayload> {
  public readonly type = "TestEvent";
}

describe("Event", () => {
  it("creates event with auto-generated metadata", () => {
    const evt = new TestEvent({ value: "hello" });
    expect(evt.type).toBe("TestEvent");
    expect(evt.payload).toEqual({ value: "hello" });
    expect(evt.metadata.eventId).toBeDefined();
    expect(evt.metadata.timestamp).toBeInstanceOf(Date);
    expect(evt.metadata.correlationId).toBeUndefined();
    expect(evt.metadata.causationId).toBeUndefined();
  });

  it("preserves custom metadata", () => {
    const customId = "custom-id";
    const customTime = new Date("2024-01-01");
    const evt = new TestEvent({ value: "x" }, { eventId: customId, timestamp: customTime });
    expect(evt.metadata.eventId).toBe(customId);
    expect(evt.metadata.timestamp).toBe(customTime);
  });

  it("withCorrelation returns new event with correlation", () => {
    const evt = new TestEvent({ value: "x" });
    const correlated = evt.withCorrelation("corr-123");
    expect(correlated.metadata.correlationId).toBe("corr-123");
    expect(correlated.metadata.causationId).toBe(evt.metadata.eventId);
    expect(correlated.metadata.eventId).toBe(evt.metadata.eventId);
    expect(correlated).not.toBe(evt);
  });

  it("readonly properties are compile-time only (runtime mutation possible)", () => {
    const evt = new TestEvent({ value: "x" });
    // @ts-expect-error - readonly at compile time
    evt.payload.value = "y";
    // @ts-expect-error - readonly at compile time
    evt.metadata.eventId = "z";
    // At runtime, mutation succeeds (TypeScript readonly is compile-time only)
    expect(evt.payload.value).toBe("y");
  });
});