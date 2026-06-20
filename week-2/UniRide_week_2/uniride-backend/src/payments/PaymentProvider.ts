import { Money } from "../shared/Money";

// O — Open/Closed (the slide's payment example). New providers implement this interface;
// PaymentService never changes when one is added.
export interface PaymentResult {
  success: boolean;
  reference: string;
  provider: string;
}

export interface PaymentProvider {
  readonly name: string;
  charge(amount: Money, idempotencyKey: string): Promise<PaymentResult>;
  refund(reference: string): Promise<PaymentResult>;
}
