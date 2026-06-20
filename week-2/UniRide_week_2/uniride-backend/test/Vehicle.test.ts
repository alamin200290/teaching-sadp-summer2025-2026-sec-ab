import { test } from "node:test";
import assert from "node:assert/strict";
import { Vehicle, Car, Motorbike, Rickshaw } from "../src/drivers/Vehicle";

// LSP: any Vehicle subtype is usable wherever a Vehicle is expected, with no surprises.
test("all vehicle types are substitutable for Vehicle", () => {
  const fleet: Vehicle[] = [new Car(), new Motorbike(), new Rickshaw()];
  for (const v of fleet) {
    assert.ok(v.seats >= 1, `${v.kind} must seat at least 1`);
    assert.ok(v.rateMultiplier > 0, `${v.kind} must have a positive rate`);
    assert.ok(v.describe().includes(v.kind));
  }
});
