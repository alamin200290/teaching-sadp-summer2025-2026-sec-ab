import { Clock, IdGenerator, Logger } from "../shared/types";
import { Location } from "../shared/Location";
import { Money } from "../shared/Money";
import { Ride } from "./Ride";
import { RideRepository } from "./RideRepository";
export class RideService {
  constructor(private readonly rides: RideRepository, private readonly clock: Clock,
    private readonly ids: IdGenerator, private readonly logger: Logger) {}
  requestRide(riderId: string, pickup: Location, dropoff: Location, seats: number): Ride {
    if (seats < 1) throw new Error("seats must be >= 1");
    const ride = new Ride(this.ids.next("ride"), riderId, pickup, dropoff, seats, this.clock.now());
    this.rides.save(ride); this.logger.info("ride.requested", { rideId: ride.id, riderId }); return ride;
  }
  assign(ride: Ride, driverId: string, fare: Money): void {
    ride.assignDriver(driverId, fare); this.rides.save(ride);
    this.logger.info("ride.assigned", { rideId: ride.id, driverId, fare: fare.toString() });
  }
  start(ride: Ride): void { ride.start(); this.rides.save(ride); this.logger.info("ride.started", { rideId: ride.id }); }
  complete(ride: Ride): void { ride.complete(); this.rides.save(ride); this.logger.info("ride.completed", { rideId: ride.id }); }
  cancel(ride: Ride): void { ride.cancel(); this.rides.save(ride); this.logger.warn("ride.cancelled", { rideId: ride.id }); }
}
