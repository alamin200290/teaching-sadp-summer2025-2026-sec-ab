import { Clock } from "../shared/types";
// CIRCUIT BREAKER (Week 6). Protects a failing dependency: after too many failures it OPENs and
// fails fast; after a cool-down it goes HALF_OPEN and lets one trial through to test recovery.
export type BreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";
export class CircuitOpenError extends Error {
  constructor() { super("Circuit breaker is OPEN"); this.name = "CircuitOpenError"; }
}
export interface CircuitBreakerOptions { failureThreshold: number; cooldownMs: number; }
export class CircuitBreaker {
  private state: BreakerState = "CLOSED";
  private failures = 0;
  private openedAt = 0;
  constructor(private readonly opts: CircuitBreakerOptions, private readonly clock: Clock = { now: () => new Date() }) {}
  get current(): BreakerState { return this.state; }
  async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (this.clock.now().getTime() - this.openedAt >= this.opts.cooldownMs) this.state = "HALF_OPEN";
      else throw new CircuitOpenError();
    }
    try { const result = await action(); this.onSuccess(); return result; }
    catch (err) { this.onFailure(); throw err; }
  }
  private onSuccess(): void { this.failures = 0; this.state = "CLOSED"; }
  private onFailure(): void {
    this.failures++;
    if (this.state === "HALF_OPEN" || this.failures >= this.opts.failureThreshold) {
      this.state = "OPEN"; this.openedAt = this.clock.now().getTime();
    }
  }
}
