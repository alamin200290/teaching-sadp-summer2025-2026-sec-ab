import { Money } from "../shared/Money";
import { PaymentProvider, PaymentResult } from "./PaymentProvider";
export class BkashGateway implements PaymentProvider {
  readonly name = "bKash";
  async charge(amount: Money, idempotencyKey: string): Promise<PaymentResult> {
    return { success: amount.amount > 0, reference: `BKASH-${idempotencyKey}`, provider: this.name };
  }
  async refund(reference: string): Promise<PaymentResult> { return { success: true, reference, provider: this.name }; }
}
