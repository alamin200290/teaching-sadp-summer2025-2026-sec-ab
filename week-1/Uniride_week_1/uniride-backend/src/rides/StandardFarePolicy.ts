import { Money } from "../shared/Money";
import { AppConfig } from "../shared/config";
import { FarePolicy, FareQuoteInput } from "./FarePolicy";

export class StandardFarePolicy implements FarePolicy {
  constructor(private readonly config: AppConfig) {}

  quote({ distanceKm, vehicle }: FareQuoteInput): Money {
    const variable = this.config.perKm * distanceKm * vehicle.rateMultiplier;
    return Money.of(this.config.baseFare + variable, this.config.currency);
  }
}
