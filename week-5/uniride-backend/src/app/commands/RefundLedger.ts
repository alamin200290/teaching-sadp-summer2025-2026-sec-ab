// Receiver for RefundPaymentCommand — a reversible in-memory record of refunds.
export class RefundLedger {
  private readonly refunds = new Set<string>();
  refund(reference: string): void { this.refunds.add(reference); }
  reverse(reference: string): void { this.refunds.delete(reference); }
  has(reference: string): boolean { return this.refunds.has(reference); }
  size(): number { return this.refunds.size; }
}
