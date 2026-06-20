import { Ride } from "./Ride";
import { RideRepository } from "./RideRepository";

export class InMemoryRideRepository implements RideRepository {
  private readonly rides = new Map<string, Ride>();

  save(ride: Ride): void {
    this.rides.set(ride.id, ride);
  }

  findById(id: string): Ride | undefined {
    return this.rides.get(id);
  }

  findByRider(riderId: string): Ride[] {
    return [...this.rides.values()].filter((r) => r.riderId === riderId);
  }
}
