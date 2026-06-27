import { test } from "node:test"; import assert from "node:assert/strict";
import { RequestRideUseCase } from "../src/app/RequestRideUseCase";
import { RideService } from "../src/rides/RideService";
import { InMemoryRideRepository } from "../src/rides/InMemoryRideRepository";
import { StandardFarePolicy } from "../src/rides/StandardFarePolicy";
import { InMemoryDriverRepository } from "../src/drivers/InMemoryDriverRepository";
import { Driver } from "../src/drivers/Driver"; import { Car } from "../src/drivers/Vehicle";
import { MatchingEngine } from "../src/matching/MatchingEngine";
import { PaymentService } from "../src/payments/PaymentService";
import { BkashGateway } from "../src/payments/BkashGateway";
import { NotificationDispatcher } from "../src/notifications/NotificationDispatcher";
import { DefaultNotificationChannelFactory } from "../src/notifications/NotificationChannelFactory";
import { PushChannel } from "../src/notifications/PushChannel";
import { Location } from "../src/shared/Location"; import { loadConfig } from "../src/shared/config";
import { Clock, IdGenerator, Logger } from "../src/shared/types";
const clock: Clock = { now: () => new Date("2026-01-01T10:00:00Z") };
const ids: IdGenerator = (() => { let n = 0; return { next: (p) => `${p}_${++n}` }; })();
const logger: Logger = { info() {}, warn() {}, error() {} };
function wire(driverRepo: InMemoryDriverRepository, factory: DefaultNotificationChannelFactory) {
  const config = loadConfig({});
  return new RequestRideUseCase(
    new RideService(new InMemoryRideRepository(), clock, ids, logger),
    new MatchingEngine(driverRepo, config.matchRadiusKm),
    new StandardFarePolicy(config),
    new PaymentService(new BkashGateway(), logger),
    new NotificationDispatcher(factory, logger), driverRepo, logger);
}
test("end-to-end: matches a driver, prices, pays, notifies, confirms", async () => {
  const driverRepo = new InMemoryDriverRepository();
  driverRepo.save(new Driver("drv_1", "Rahim", new Car(), new Location(23.8203, 90.4255)));
  const factory = new DefaultNotificationChannelFactory();
  const out = await wire(driverRepo, factory).execute({
    riderId: "rider_1", riderContact: "rider_1",
    pickup: new Location(23.8203, 90.4253), dropoff: new Location(23.7806, 90.4193), seats: 2 });
  assert.equal(out.ride.status, "ASSIGNED"); assert.equal(out.driver.id, "drv_1");
  assert.ok(out.fare.amount > loadConfig({}).baseFare);
  assert.equal((factory.create("push") as PushChannel).outbox().length, 2);
});
test("no driver in range -> cancelled + UnavailableError", async () => {
  const driverRepo = new InMemoryDriverRepository();
  driverRepo.save(new Driver("drv_far", "Far", new Car(), new Location(0, 0)));
  await assert.rejects(wire(driverRepo, new DefaultNotificationChannelFactory()).execute({
    riderId: "rider_1", riderContact: "rider_1",
    pickup: new Location(23.82, 90.42), dropoff: new Location(23.78, 90.41), seats: 1 }), /No drivers available/);
});
