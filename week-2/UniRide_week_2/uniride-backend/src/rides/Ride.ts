import { Location } from "../shared/Location";
import { Money } from "../shared/Money";
import { RideStatus } from "./RideStatus";

// S — Single Responsibility. The Ride entity owns ride STATE and the rules for valid
// transitions — nothing else. It does not match drivers, take payments, or send
// notifications. (A full State pattern arrives in Week 5; here the guards are explicit.)
export class Ride {
  status: RideStatus = "REQUESTED";
  driverId?: string;
  fare?: Money;

  constructor(
    public readonly id: string,
    public readonly riderId: string,
    public readonly pickup: Location,
    public readonly dropoff: Location,
    public readonly seats: number,
    public readonly requestedAt: Date,
  ) {}

  assignDriver(driverId: string, fare: Money): void {
    this.ensure("REQUESTED");
    this.driverId = driverId;
    this.fare = fare;
    this.status = "ASSIGNED";
  }

  start(): void {
    this.ensure("ASSIGNED");
    this.status = "IN_PROGRESS";
  }

  complete(): void {
    this.ensure("IN_PROGRESS");
    this.status = "COMPLETED";
  }

  cancel(): void {
    if (this.status === "COMPLETED" || this.status === "CANCELLED") {
      throw new Error(`Cannot cancel a ${this.status} ride`);
    }
    this.status = "CANCELLED";
  }

  private ensure(expected: RideStatus): void {
    if (this.status !== expected) {
      throw new Error(`Invalid transition: expected ${expected}, but ride was ${this.status}`);
    }
  }
}
