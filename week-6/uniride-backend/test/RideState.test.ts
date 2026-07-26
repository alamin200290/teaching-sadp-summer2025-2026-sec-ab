import { test } from "node:test"; import assert from "node:assert/strict";
import { Ride } from "../src/rides/Ride";
import { Location } from "../src/shared/Location";
import { Money } from "../src/shared/Money";
function newRide() { return new Ride("r1", "rider", new Location(0, 0), new Location(0, 1), 1, new Date()); }
test("happy path: requested -> assigned -> in_progress -> completed", () => {
  const r = newRide(); assert.equal(r.status, "REQUESTED");
  r.assignDriver("drv", Money.of(100)); assert.equal(r.status, "ASSIGNED");
  assert.equal(r.driverId, "drv");
  r.start(); assert.equal(r.status, "IN_PROGRESS");
  r.complete(); assert.equal(r.status, "COMPLETED");
});
test("illegal transitions throw", () => {
  const r = newRide();
  assert.throws(() => r.complete(), /Invalid transition/);
  assert.throws(() => r.start(), /Invalid transition/);
});
test("terminal states reject cancel with a clear message", () => {
  const r = newRide(); r.assignDriver("d", Money.of(50)); r.start(); r.complete();
  assert.throws(() => r.cancel(), /Cannot cancel a COMPLETED ride/);
});
test("snapshot / restore round-trips state for undo", () => {
  const r = newRide(); r.assignDriver("d", Money.of(80));
  const snap = r.snapshot(); r.cancel(); assert.equal(r.status, "CANCELLED");
  r.restore(snap); assert.equal(r.status, "ASSIGNED"); assert.equal(r.driverId, "d");
});
