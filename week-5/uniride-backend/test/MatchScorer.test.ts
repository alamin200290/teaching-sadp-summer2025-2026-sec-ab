import { test } from "node:test"; import assert from "node:assert/strict";
import { MatchingEngine } from "../src/matching/MatchingEngine";
import { NearestScorer, HighestRatedScorer, CheapestScorer } from "../src/matching/MatchScorer";
import { InMemoryDriverRepository } from "../src/drivers/InMemoryDriverRepository";
import { Driver } from "../src/drivers/Driver";
import { Car, Motorbike, Rickshaw } from "../src/drivers/Vehicle";
import { Location } from "../src/shared/Location";
function repo() {
  const r = new InMemoryDriverRepository();
  r.save(new Driver("near",  "Near",  new Car(),       new Location(23.8203, 90.4256), "available", 4.2)); // closest, car
  r.save(new Driver("rated", "Rated", new Rickshaw(), new Location(23.8230, 90.4290), "available", 4.9)); // best rating
  r.save(new Driver("cheap", "Cheap", new Motorbike(),  new Location(23.8235, 90.4300), "available", 4.0)); // cheapest (rickshaw)
  return r;
}
const pickup = new Location(23.8203, 90.4253);
test("NearestScorer picks the closest driver", () => {
  const e = new MatchingEngine(repo(), 10, new NearestScorer());
  assert.equal(e.findBestDriver(pickup, 1)!.id, "near");
});
test("HighestRatedScorer picks the best-rated driver", () => {
  const e = new MatchingEngine(repo(), 10, new HighestRatedScorer());
  assert.equal(e.findBestDriver(pickup, 1)!.id, "rated");
});
test("CheapestScorer picks the lowest-rate vehicle", () => {
  const e = new MatchingEngine(repo(), 10, new CheapestScorer());
  assert.equal(e.findBestDriver(pickup, 1)!.id, "cheap");
});
