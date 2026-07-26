import { test } from "node:test"; import assert from "node:assert/strict";
import { buildContainer } from "../src/composition/container";
test("Facade books from text addresses (geocoded by the adapter)", async () => {
  const { booking } = buildContainer({});
  const out = await booking.book({ riderId: "rider_1", pickup: "AIUB Campus", dropoff: "Banani", seats: 2 });
  assert.equal(out.ride.status, "ASSIGNED"); assert.ok(out.fare.amount > 0);
});
test("Facade also accepts explicit coordinates", async () => {
  const { booking } = buildContainer({});
  const { Location } = await import("../src/shared/Location");
  const out = await booking.book({ riderId: "rider_2",
    pickup: new Location(23.8203, 90.4253), dropoff: new Location(23.7806, 90.4193), seats: 1 });
  assert.equal(out.ride.status, "ASSIGNED");
});
