import { RideEvent, RideObserver } from "../RideEvents";
import { NotificationDispatcher } from "../../notifications/NotificationDispatcher";
// An observer that turns a ride event into the rider/driver push notifications.
export class NotifyingObserver implements RideObserver {
  constructor(private readonly notifications: NotificationDispatcher) {}
  async onRideEvent(e: RideEvent): Promise<void> {
    if (e.type !== "confirmed") return;
    await this.notifications.notify("push", e.riderContact,
      `Your driver ${e.driverName} (${e.vehicle}) is on the way. Estimated fare ${e.fare}.`);
    await this.notifications.notify("push", e.driverId, `New trip assigned: ride ${e.rideId} (${e.seats} seat(s)).`);
  }
}
