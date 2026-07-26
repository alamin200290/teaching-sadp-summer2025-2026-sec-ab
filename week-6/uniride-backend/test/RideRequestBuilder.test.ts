import { test } from "node:test"; import assert from "node:assert/strict";
import { RideRequestBuilder } from "../src/app/RideRequestBuilder";
import { Location } from "../src/shared/Location";
test("Builder assembles a valid input fluently with optional parts", () => {
  const at = new Date("2026-02-01T09:00:00Z");
  const input = new RideRequestBuilder()
    .forRider("rider_1").from(new Location(23.82, 90.42)).to(new Location(23.78, 90.41))
    .seats(3).withPromoCode("AIUB10").scheduledAt(at).build();
  assert.equal(input.riderId, "rider_1"); assert.equal(input.riderContact, "rider_1");
  assert.equal(input.seats, 3); assert.equal(input.promoCode, "AIUB10"); assert.equal(input.scheduledAt, at);
});
test("Builder defaults seats to 1 and contact to riderId", () => {
  const input = new RideRequestBuilder().forRider("r1").from(new Location(0, 0)).to(new Location(0, 1)).build();
  assert.equal(input.seats, 1); assert.equal(input.riderContact, "r1");
});
test("Builder enforces required parts at build()", () => {
  assert.throws(() => new RideRequestBuilder().from(new Location(0, 0)).to(new Location(0, 1)).build(), /riderId is required/);
  assert.throws(() => new RideRequestBuilder().forRider("r1").to(new Location(0, 1)).build(), /pickup is required/);
});
