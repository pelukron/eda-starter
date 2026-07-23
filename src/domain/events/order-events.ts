import type { EventPayload } from './event.js';
import { Event } from './event.js';

export interface OrderCreatedPayload extends EventPayload {
  readonly orderId: string;
  readonly customerId: string;
  readonly items: readonly { readonly sku: string; readonly qty: number; readonly price: number }[];
  readonly total: number;
}

export class OrderCreated extends Event<OrderCreatedPayload> {
  public readonly type = 'OrderCreated';
}

export interface PaymentReservedPayload extends EventPayload {
  readonly orderId: string;
  readonly paymentId: string;
  readonly amount: number;
}

export class PaymentReserved extends Event<PaymentReservedPayload> {
  public readonly type = 'PaymentReserved';
}

export interface InventoryReservedPayload extends EventPayload {
  readonly orderId: string;
  readonly items: readonly { readonly sku: string; readonly qty: number }[];
}

export class InventoryReserved extends Event<InventoryReservedPayload> {
  public readonly type = 'InventoryReserved';
}

export interface OrderConfirmedPayload extends EventPayload {
  readonly orderId: string;
}

export class OrderConfirmed extends Event<OrderConfirmedPayload> {
  public readonly type = 'OrderConfirmed';
}

export interface OrderFailedPayload extends EventPayload {
  readonly orderId: string;
  readonly reason: string;
}

export class OrderFailed extends Event<OrderFailedPayload> {
  public readonly type = 'OrderFailed';
}
