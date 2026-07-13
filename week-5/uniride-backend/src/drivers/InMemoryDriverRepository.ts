import { Driver } from "./Driver";
import { DriverRepository } from "./DriverRepository";
import { Location } from "../shared/Location";
export class InMemoryDriverRepository implements DriverRepository {
  private readonly drivers = new Map<string, Driver>();
  save(d: Driver): void { this.drivers.set(d.id, d); }
  findById(id: string): Driver | undefined { return this.drivers.get(id); }
  findAvailableNear(pickup: Location, seatsNeeded: number, radiusKm: number): Driver[] {
    return [...this.drivers.values()]
      .filter((d) => d.status === "available" && d.vehicle.seats >= seatsNeeded && d.location.distanceKm(pickup) <= radiusKm)
      .sort((a, b) => a.location.distanceKm(pickup) - b.location.distanceKm(pickup));
  }
}
