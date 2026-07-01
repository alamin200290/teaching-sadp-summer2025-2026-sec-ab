export class Money {
  private constructor(public readonly amount: number, public readonly currency: string) {}
  static of(amount: number, currency = "BDT"): Money {
    if (!Number.isFinite(amount) || amount < 0) throw new Error("Money amount must be a non-negative finite number");
    return new Money(Math.round(amount * 100) / 100, currency);
  }
  add(other: Money): Money { this.assertSameCurrency(other); return Money.of(this.amount + other.amount, this.currency); }
  multiply(factor: number): Money { return Money.of(this.amount * factor, this.currency); }
  private assertSameCurrency(other: Money): void {
    if (other.currency !== this.currency) throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
  }
  toString(): string { return `${this.amount.toFixed(2)} ${this.currency}`; }
}
