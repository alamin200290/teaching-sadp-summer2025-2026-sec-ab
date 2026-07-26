import { Money } from "../shared/Money";
import { PaymentProvider, PaymentResult } from "./PaymentProvider";
export class CardGateway implements PaymentProvider {
  readonly name = "Card";
  async charge(amount: Money, idempotencyKey: string): Promise<PaymentResult> {
    return { success: amount.amount > 0, reference: `CARD-${idempotencyKey}`, provider: this.name };
  }
  async refund(reference: string): Promise<PaymentResult> { return { success: true, reference, provider: this.name }; }
}
