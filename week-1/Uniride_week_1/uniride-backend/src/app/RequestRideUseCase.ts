import { Location } from "../shared/Location";
import { Money } from "../shared/Money";
import { Logger } from "../shared/types";
import { Ride } from "../rides/Ride";
import { RideService } from "../rides/RideService";
import { FarePolicy } from "../rides/FarePolicy";
import { MatchingEngine } from "../matching/MatchingEngine";
import { PaymentService } from "../payments/PaymentService";
import { NotificationDispatcher } from "../notifications/NotificationDispatcher";
import { Driver } from "../drivers/Driver";
import { DriverRepository } from "../drivers/DriverRepository";

export interface RequestRideInput {
  riderId: string;
  riderContact: string;
  pickup: Location;
  dropoff: Location;
  seats: number;
}

export interface RequestRideOutput {
  ride: Ride;
  driver: Driver;
  fare: Money;
  paymentRef: string;
}

// The use-case ORCHESTRATES the single-responsibility services. It is the one place that
// knows the end-to-end "book a ride" flow. Note every collaborator is an abstraction
// supplied by the constructor (DIP) — so this whole flow is testable with fakes.
export class RequestRideUseCase {
  constructor(
    private readonly rideService: RideService,
    private readonly matching: MatchingEngine,
    private readonly fare: FarePolicy,
    private readonly payments: PaymentService,
    private readonly notifications: NotificationDispatcher,
    private readonly drivers: DriverRepository,
    private readonly logger: Logger,
  ) {}

  async execute(input: RequestRideInput): Promise<RequestRideOutput> {
    const ride = this.rideService.requestRide(
      input.riderId, input.pickup, input.dropoff, input.seats,
    );

    const driver = this.matching.findBestDriver(input.pickup, input.seats);
    if (!driver) {
      this.rideService.cancel(ride);
      throw new Error("No drivers available nearby");
    }

    const distanceKm = input.pickup.distanceKm(input.dropoff);
    const quote = this.fare.quote({ distanceKm, vehicle: driver.vehicle });
    this.rideService.assign(ride, driver.id, quote);

    driver.status = "on_trip";
    this.drivers.save(driver);

    const payment = await this.payments.authorizeFare(quote, ride.id);
    if (!payment.success) {
      this.rideService.cancel(ride);
      throw new Error("Payment authorisation failed");
    }

    await this.notifications.notify(
      "push", input.riderContact,
      `Your driver ${driver.name} (${driver.vehicle.describe()}) is on the way. Estimated fare ${quote.toString()}.`,
    );
    await this.notifications.notify(
      "push", driver.id,
      `New trip assigned: ride ${ride.id} (${input.seats} seat(s)).`,
    );

    this.logger.info("ride.confirmed", {
      rideId: ride.id, driverId: driver.id, fare: quote.toString(),
    });

    return { ride, driver, fare: quote, paymentRef: payment.reference };
  }
}
