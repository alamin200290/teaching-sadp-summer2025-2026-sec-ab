import { Command } from "./Command";
import { Ride, RideSnapshot } from "../../rides/Ride";
import { RideService } from "../../rides/RideService";
// execute() cancels the ride after snapshotting it; undo() restores the snapshot.
export class CancelRideCommand implements Command {
  readonly label = "cancel-ride";
  private before?: RideSnapshot;
  constructor(private readonly ride: Ride, private readonly rides: RideService) {}
  execute(): void { this.before = this.ride.snapshot(); this.rides.cancel(this.ride); }
  undo(): void { if (this.before) { this.ride.restore(this.before); this.rides.save(this.ride); } }
}
