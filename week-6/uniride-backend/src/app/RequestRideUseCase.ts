import { Location } from "../shared/Location";
import { Money } from "../shared/Money";
import { Logger } from "../shared/types";
import { Ride } from "../rides/Ride";
import { RideService } from "../rides/RideService";
import { FarePolicy } from "../rides/FarePolicy";
import { RideStatusPublisher } from "../rides/RideEvents";
import { MatchingEngine } from "../matching/MatchingEngine";
import { PaymentService } from "../payments/PaymentService";
import { Driver } from "../drivers/Driver";
import { DriverRepository } from "../drivers/DriverRepository";
import { UnavailableError } from "../shared/errors";

export interface RequestRideInput {
  riderId: string; riderContact: string; pickup: Location; dropoff: Location; seats: number;
  promoCode?: string; scheduledAt?: Date; notes?: string;
}
export interface RequestRideOutput { ride: Ride; driver: Driver; fare: Money; paymentRef: string; }

export class RequestRideUseCase {
  constructor(
    private readonly rideService: RideService,
    private readonly matching: MatchingEngine,
    private readonly fare: FarePolicy,
    private readonly payments: PaymentService,
    private readonly events: RideStatusPublisher,   // Week 5: Observer, not a direct dispatcher
    private readonly drivers: DriverRepository,
    private readonly logger: Logger,
  ) {}

  async execute(input: RequestRideInput): Promise<RequestRideOutput> {
    const ride = this.rideService.requestRide(input.riderId, input.pickup, input.dropoff, input.seats);
    if (input.promoCode) this.logger.info("ride.promo_applied", { rideId: ride.id, promoCode: input.promoCode });
    if (input.scheduledAt) this.logger.info("ride.scheduled", { rideId: ride.id, at: input.scheduledAt.toISOString() });

    const driver = this.matching.findBestDriver(input.pickup, input.seats);
    if (!driver) { this.rideService.cancel(ride); throw new UnavailableError("No drivers available nearby"); }

    const distanceKm = input.pickup.distanceKm(input.dropoff);
    const quote = this.fare.quote({ distanceKm, vehicle: driver.vehicle });
    this.rideService.assign(ride, driver.id, quote);
    driver.status = "on_trip"; this.drivers.save(driver);

    const payment = await this.payments.authorizeFare(quote, ride.id);
    if (!payment.success) { this.rideService.cancel(ride); throw new UnavailableError("Payment authorisation failed"); }

    // Publish a domain event; subscribed observers handle notifications, analytics, audit, ...
    await this.events.publish({
      type: "confirmed", rideId: ride.id, riderContact: input.riderContact,
      driverId: driver.id, driverName: driver.name, vehicle: driver.vehicle.describe(),
      fare: quote.toString(), seats: input.seats,
    });

    this.logger.info("ride.confirmed", { rideId: ride.id, driverId: driver.id, fare: quote.toString() });
    return { ride, driver, fare: quote, paymentRef: payment.reference };
  }
}
