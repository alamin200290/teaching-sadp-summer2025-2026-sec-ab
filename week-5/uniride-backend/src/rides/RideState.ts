import { Money } from "../shared/Money";
import { RideStatus } from "./RideStatus";
import type { Ride } from "./Ride";

// STATE (Week 5). Each concrete state knows only its own legal transitions; illegal ones throw.
// This replaces the manual status-flag conditionals that guarded Ride's lifecycle.
export interface RideState {
  readonly status: RideStatus;
  assign(ride: Ride, driverId: string, fare: Money): RideState;
  start(ride: Ride): RideState;
  complete(ride: Ride): RideState;
  cancel(ride: Ride): RideState;
}
function illegal(from: RideStatus, action: string): never {
  throw new Error(`Invalid transition: cannot ${action} a ride that is ${from}`);
}

export class RequestedState implements RideState {
  readonly status = "REQUESTED" as const;
  assign(ride: Ride, driverId: string, fare: Money): RideState { ride.attachAssignment(driverId, fare); return new AssignedState(); }
  start(): RideState { return illegal("REQUESTED", "start"); }
  complete(): RideState { return illegal("REQUESTED", "complete"); }
  cancel(): RideState { return new CancelledState(); }
}
export class AssignedState implements RideState {
  readonly status = "ASSIGNED" as const;
  assign(): RideState { return illegal("ASSIGNED", "re-assign"); }
  start(): RideState { return new InProgressState(); }
  complete(): RideState { return illegal("ASSIGNED", "complete"); }
  cancel(): RideState { return new CancelledState(); }
}
export class InProgressState implements RideState {
  readonly status = "IN_PROGRESS" as const;
  assign(): RideState { return illegal("IN_PROGRESS", "assign"); }
  start(): RideState { return illegal("IN_PROGRESS", "re-start"); }
  complete(): RideState { return new CompletedState(); }
  cancel(): RideState { return new CancelledState(); }
}
export class CompletedState implements RideState {
  readonly status = "COMPLETED" as const;
  assign(): RideState { return illegal("COMPLETED", "assign"); }
  start(): RideState { return illegal("COMPLETED", "start"); }
  complete(): RideState { return illegal("COMPLETED", "complete"); }
  cancel(): RideState { throw new Error("Cannot cancel a COMPLETED ride"); }
}
export class CancelledState implements RideState {
  readonly status = "CANCELLED" as const;
  assign(): RideState { return illegal("CANCELLED", "assign"); }
  start(): RideState { return illegal("CANCELLED", "start"); }
  complete(): RideState { return illegal("CANCELLED", "complete"); }
  cancel(): RideState { throw new Error("Cannot cancel a CANCELLED ride"); }
}
export function stateFor(status: RideStatus): RideState {
  switch (status) {
    case "REQUESTED": return new RequestedState();
    case "ASSIGNED": return new AssignedState();
    case "IN_PROGRESS": return new InProgressState();
    case "COMPLETED": return new CompletedState();
    case "CANCELLED": return new CancelledState();
  }
}
