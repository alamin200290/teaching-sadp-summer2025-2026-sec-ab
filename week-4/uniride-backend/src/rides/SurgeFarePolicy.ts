import { Money } from "../shared/Money";
import { FarePolicy, FareQuoteInput } from "./FarePolicy";
export class SurgeFarePolicy implements FarePolicy {
  constructor(private readonly base: FarePolicy, private readonly multiplier: number) {
    if (multiplier < 1) throw new Error("Surge multiplier must be >= 1");
  }
  quote(input: FareQuoteInput): Money { return this.base.quote(input).multiply(this.multiplier); }
}
