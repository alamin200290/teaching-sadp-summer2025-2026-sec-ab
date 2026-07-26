import { PaymentProvider, PaymentResult } from "./PaymentProvider";
import { Money } from "../shared/Money";
import { CircuitBreaker } from "../resilience/CircuitBreaker";
import { retry } from "../resilience/retry";
// Decorator (W4) + resilience (W6): wraps a payment provider with retry then a circuit breaker,
// preserving the PaymentProvider interface so nothing downstream changes.
export class ResilientPaymentGateway implements PaymentProvider {
  readonly name: string;
  constructor(private readonly inner: PaymentProvider, private readonly breaker: CircuitBreaker, private readonly attempts = 3) {
    this.name = `resilient(${inner.name})`;
  }
  charge(amount: Money, idempotencyKey: string): Promise<PaymentResult> {
    return this.breaker.execute(() => retry(() => this.inner.charge(amount, idempotencyKey), { attempts: this.attempts, baseDelayMs: 5 }));
  }
  refund(reference: string): Promise<PaymentResult> {
    return this.breaker.execute(() => retry(() => this.inner.refund(reference), { attempts: this.attempts, baseDelayMs: 5 }));
  }
}
