import { EventBroker } from "../messaging/EventBroker";
import { Topics } from "../messaging/DomainEvents";
// Week 5 introduced this as an Observer. Week 6 backs it with a real EventBroker topic — same API.
export interface RideConfirmedEvent {
  type: "confirmed";
  rideId: string; riderContact: string; driverId: string;
  driverName: string; vehicle: string; fare: string; seats: number;
}
export type RideEvent = RideConfirmedEvent;
export interface RideObserver { onRideEvent(event: RideEvent): Promise<void>; }

export class RideStatusPublisher {
  constructor(private readonly broker: EventBroker = new EventBroker()) {}
  subscribe(observer: RideObserver): void {
    this.broker.subscribe<RideEvent>(Topics.RideConfirmed, (e) => observer.onRideEvent(e));
  }
  async publish(event: RideEvent): Promise<void> { await this.broker.publish(Topics.RideConfirmed, event); }
}
