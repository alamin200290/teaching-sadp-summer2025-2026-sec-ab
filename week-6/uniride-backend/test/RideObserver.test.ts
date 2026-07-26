import { test } from "node:test"; import assert from "node:assert/strict";
import { RideStatusPublisher, RideEvent } from "../src/rides/RideEvents";
import { AnalyticsObserver } from "../src/rides/observers/AnalyticsObserver";
import { NotifyingObserver } from "../src/rides/observers/NotifyingObserver";
import { NotificationDispatcher } from "../src/notifications/NotificationDispatcher";
import { DefaultNotificationChannelFactory } from "../src/notifications/NotificationChannelFactory";
import { PushChannel } from "../src/notifications/PushChannel";
const logger = { info() {}, warn() {}, error() {} };
const event: RideEvent = { type: "confirmed", rideId: "r1", riderContact: "rider", driverId: "drv",
  driverName: "Rahim", vehicle: "Car", fare: "BDT 120.00", seats: 2 };
test("publisher fans out to every subscribed observer", async () => {
  const pub = new RideStatusPublisher();
  const a1 = new AnalyticsObserver(); const a2 = new AnalyticsObserver();
  pub.subscribe(a1); pub.subscribe(a2);
  await pub.publish(event); await pub.publish(event);
  assert.equal(a1.stats().confirmed, 2); assert.equal(a2.stats().confirmed, 2);
});
test("NotifyingObserver sends rider + driver push on a confirmed event", async () => {
  const factory = new DefaultNotificationChannelFactory();
  const pub = new RideStatusPublisher();
  pub.subscribe(new NotifyingObserver(new NotificationDispatcher(factory, logger)));
  await pub.publish(event);
  assert.equal((factory.create("push") as PushChannel).outbox().length, 2);
});
