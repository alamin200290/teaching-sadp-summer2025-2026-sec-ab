import { Money } from "../shared/Money";
import { Vehicle } from "../drivers/Vehicle";

// O — Open/Closed. Pricing is behind an interface. New pricing rules are added by writing
// a NEW FarePolicy — existing code that depends on this interface never changes.
export interface FareQuoteInput {
  distanceKm: number;
  vehicle: Vehicle;
}

export interface FarePolicy {
  quote(input: FareQuoteInput): Money;
}
