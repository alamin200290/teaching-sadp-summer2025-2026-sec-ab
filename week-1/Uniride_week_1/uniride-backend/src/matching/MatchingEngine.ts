import { Driver } from "../drivers/Driver";
import { DriverRepository } from "../drivers/DriverRepository";
import { Location } from "../shared/Location";

// SRP: matching ONLY. It chooses a driver; it does not price, pay, or notify.
// DIP: it depends on the DriverRepository abstraction.
export class MatchingEngine {
  constructor(
    private readonly drivers: DriverRepository,
    private readonly radiusKm: number,
  ) {}

  findBestDriver(pickup: Location, seatsNeeded: number): Driver | null {
    const candidates = this.drivers.findAvailableNear(pickup, seatsNeeded, this.radiusKm);
    return candidates[0] ?? null; // nearest available, already sorted by distance
  }
}
