// OBSERVER (Week 5). The publisher broadcasts ride events to subscribers it knows nothing about.
export interface RideConfirmedEvent {
  type: "confirmed";
  rideId: string; riderContact: string; driverId: string;
  driverName: string; vehicle: string; fare: string; seats: number;
}
export type RideEvent = RideConfirmedEvent;

export interface RideObserver { onRideEvent(event: RideEvent): Promise<void>; }

export class RideStatusPublisher {
  private readonly observers: RideObserver[] = [];
  subscribe(observer: RideObserver): void { this.observers.push(observer); }
  async publish(event: RideEvent): Promise<void> {
    for (const observer of this.observers) await observer.onRideEvent(event);
  }
}
