import { Command } from "./Command";
import { RefundLedger } from "./RefundLedger";
export class RefundPaymentCommand implements Command {
  readonly label = "refund-payment";
  constructor(private readonly ledger: RefundLedger, private readonly reference: string) {}
  execute(): void { this.ledger.refund(this.reference); }
  undo(): void { this.ledger.reverse(this.reference); }
}
