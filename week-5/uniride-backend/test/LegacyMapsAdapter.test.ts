import { test } from "node:test"; import assert from "node:assert/strict";
import { LegacyMapsAdapter } from "../src/geocoding/LegacyMapsAdapter";
import { LegacyMapsSdk } from "../src/geocoding/LegacyMapsSdk";
test("Adapter translates the legacy {x,y} SDK into our Location(lat,lng)", () => {
  const geo = new LegacyMapsAdapter(new LegacyMapsSdk());
  const loc = geo.geocode("AIUB Campus");
  assert.equal(loc.lat, 23.8203); assert.equal(loc.lng, 90.4253); assert.equal(loc.label, "AIUB Campus");
});
test("Adapter surfaces SDK errors for unknown places", () => {
  assert.throws(() => new LegacyMapsAdapter(new LegacyMapsSdk()).geocode("Mars"), /unknown place/);
});
