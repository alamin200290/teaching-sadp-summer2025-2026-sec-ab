import { Money } from "../shared/Money";
import { FarePolicy, FareQuoteInput } from "./FarePolicy";

// OCP in action: surge pricing is a NEW policy that wraps any existing one. We extended
// pricing behaviour without modifying StandardFarePolicy. (The Decorator pattern that
// formalises this composition is taught in Week 4.)
export class SurgeFarePolicy implements FarePolicy {
  constructor(
    private readonly base: FarePolicy,
    private readonly multiplier: number,
  ) {
    if (multiplier < 1) throw new Error("Surge multiplier must be >= 1");
  }

  quote(input: FareQuoteInput): Money {
    return this.base.quote(input).multiply(this.multiplier);
  }
}
