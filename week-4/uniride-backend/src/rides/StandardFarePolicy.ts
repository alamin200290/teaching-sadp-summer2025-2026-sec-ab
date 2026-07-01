import { Money } from "../shared/Money";
import { AppConfig } from "../shared/config";
import { FarePolicy, FareQuoteInput } from "./FarePolicy";
export class StandardFarePolicy implements FarePolicy {
  constructor(private readonly config: AppConfig) {}
  quote({ distanceKm, vehicle }: FareQuoteInput): Money {
    return Money.of(this.config.baseFare + this.config.perKm * distanceKm * vehicle.rateMultiplier, this.config.currency);
  }
}
