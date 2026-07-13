import { Money } from "../shared/Money";
import { Vehicle } from "../drivers/Vehicle";
export interface FareQuoteInput { distanceKm: number; vehicle: Vehicle; }
export interface FarePolicy { quote(input: FareQuoteInput): Money; }
