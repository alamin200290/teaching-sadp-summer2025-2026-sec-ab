import { Location } from "../shared/Location";
import { Money } from "../shared/Money";
import { RideStatus } from "./RideStatus";
import { RideState, RequestedState, stateFor } from "./RideState";

export interface RideSnapshot { status: RideStatus; driverId?: string; fare?: Money; }

export class Ride {
  private state: RideState = new RequestedState();
  driverId?: string;
  fare?: Money;
  constructor(
    public readonly id: string, public readonly riderId: string,
    public readonly pickup: Location, public readonly dropoff: Location,
    public readonly seats: number, public readonly requestedAt: Date,
  ) {}

  get status(): RideStatus { return this.state.status; }
  assignDriver(driverId: string, fare: Money): void { this.state = this.state.assign(this, driverId, fare); }
  start(): void { this.state = this.state.start(this); }
  complete(): void { this.state = this.state.complete(this); }
  cancel(): void { this.state = this.state.cancel(this); }

  // invoked by RequestedState.assign
  attachAssignment(driverId: string, fare: Money): void { this.driverId = driverId; this.fare = fare; }

  // Command undo support (a minimal memento)
  snapshot(): RideSnapshot { return { status: this.status, driverId: this.driverId, fare: this.fare }; }
  restore(s: RideSnapshot): void { this.state = stateFor(s.status); this.driverId = s.driverId; this.fare = s.fare; }
}
