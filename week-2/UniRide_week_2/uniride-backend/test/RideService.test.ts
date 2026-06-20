import { test } from "node:test";
import assert from "node:assert/strict";
import { RideService } from "../src/rides/RideService";
import { InMemoryRideRepository } from "../src/rides/InMemoryRideRepository";
import { Location } from "../src/shared/Location";
import { Money } from "../src/shared/Money";
import { Clock, IdGenerator, Logger } from "../src/shared/types";

// DIP makes this trivial to test: we inject fakes for clock, ids, and logger.
const fixedClock: Clock = { now: () => new Date("2026-01-01T10:00:00Z") };
const seqIds: IdGenerator = (() => { let n = 0; return { next: (p) => `${p}_${++n}` }; })();
const noopLogger: Logger = { info() {}, warn() {}, error() {} };

function makeService() {
  return new RideService(new InMemoryRideRepository(), fixedClock, seqIds, noopLogger);
}

test("requestRide creates a REQUESTED ride with an id and timestamp", () => {
  const svc = makeService();
  const ride = svc.requestRide("rider_1", new Location(0, 0), new Location(0, 1), 2);
  assert.equal(ride.status, "REQUESTED");
  assert.match(ride.id, /^ride_/);
  assert.equal(ride.requestedAt.toISOString(), "2026-01-01T10:00:00.000Z");
});

test("lifecycle transitions are enforced; invalid ones throw", () => {
  const svc = makeService();
  const ride = svc.requestRide("rider_1", new Location(0, 0), new Location(0, 1), 1);
  assert.throws(() => svc.complete(ride), /Invalid transition/); // can't complete before start
  svc.assign(ride, "drv_1", Money.of(120));
  svc.start(ride);
  svc.complete(ride);
  assert.equal(ride.status, "COMPLETED");
  assert.throws(() => svc.cancel(ride), /Cannot cancel a COMPLETED ride/);
});
