import { Driver } from "../drivers/Driver";
import { DriverRepository } from "../drivers/DriverRepository";
import { Location } from "../shared/Location";
export class MatchingEngine {
  constructor(private readonly drivers: DriverRepository, private readonly radiusKm: number) {}
  findBestDriver(pickup: Location, seatsNeeded: number): Driver | null {
    return this.drivers.findAvailableNear(pickup, seatsNeeded, this.radiusKm)[0] ?? null;
  }
}
