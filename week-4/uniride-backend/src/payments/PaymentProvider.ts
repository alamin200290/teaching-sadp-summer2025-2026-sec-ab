import { Money } from "../shared/Money";
export interface PaymentResult { success: boolean; reference: string; provider: string; }
export interface PaymentProvider {
  readonly name: string;
  charge(amount: Money, idempotencyKey: string): Promise<PaymentResult>;
  refund(reference: string): Promise<PaymentResult>;
}
