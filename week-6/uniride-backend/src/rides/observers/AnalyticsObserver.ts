import { RideEvent, RideObserver } from "../RideEvents";
// A second, independent observer — added without touching the publisher or the notifier.
export class AnalyticsObserver implements RideObserver {
  private confirmed = 0;
  async onRideEvent(e: RideEvent): Promise<void> { if (e.type === "confirmed") this.confirmed++; }
  stats(): { confirmed: number } { return { confirmed: this.confirmed }; }
}
