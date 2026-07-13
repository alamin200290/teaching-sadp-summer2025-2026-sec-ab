import { test } from "node:test"; import assert from "node:assert/strict";
import { CommandInvoker } from "../src/app/commands/Command";
import { CancelRideCommand } from "../src/app/commands/CancelRideCommand";
import { RefundPaymentCommand } from "../src/app/commands/RefundPaymentCommand";
import { RefundLedger } from "../src/app/commands/RefundLedger";
import { RideService } from "../src/rides/RideService";
import { InMemoryRideRepository } from "../src/rides/InMemoryRideRepository";
import { Location } from "../src/shared/Location";
import { Clock, IdGenerator, Logger } from "../src/shared/types";
const clock: Clock = { now: () => new Date("2026-01-01T10:00:00Z") };
const ids: IdGenerator = (() => { let n = 0; return { next: (p) => `${p}_${++n}` }; })();
const logger: Logger = { info() {}, warn() {}, error() {} };
test("CancelRideCommand cancels then undo restores prior state", async () => {
  const rides = new RideService(new InMemoryRideRepository(), clock, ids, logger);
  const ride = rides.requestRide("rider", new Location(0, 0), new Location(0, 1), 1);
  const invoker = new CommandInvoker();
  await invoker.run(new CancelRideCommand(ride, rides));
  assert.equal(ride.status, "CANCELLED"); assert.equal(invoker.size(), 1);
  await invoker.undoLast();
  assert.equal(ride.status, "REQUESTED"); assert.equal(invoker.size(), 0);
});
test("RefundPaymentCommand is reversible via undo", async () => {
  const ledger = new RefundLedger();
  const invoker = new CommandInvoker();
  await invoker.run(new RefundPaymentCommand(ledger, "txn_9"));
  assert.ok(ledger.has("txn_9")); assert.equal(ledger.size(), 1);
  await invoker.undoLast();
  assert.equal(ledger.has("txn_9"), false); assert.equal(ledger.size(), 0);
});
