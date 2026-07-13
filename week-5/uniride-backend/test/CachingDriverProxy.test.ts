import { test } from "node:test"; import assert from "node:assert/strict";
import { CachingDriverProxy } from "../src/drivers/CachingDriverProxy";
import { InMemoryDriverRepository } from "../src/drivers/InMemoryDriverRepository";
import { Driver } from "../src/drivers/Driver"; import { Car } from "../src/drivers/Vehicle";
import { Location } from "../src/shared/Location";
test("Proxy caches repeat lookups and invalidates on save", () => {
  const real = new InMemoryDriverRepository();
  const proxy = new CachingDriverProxy(real);
  proxy.save(new Driver("d1", "A", new Car(), new Location(23.8203, 90.4255)));
  const here = new Location(23.8203, 90.4253);
  proxy.findAvailableNear(here, 1, 5);          // miss
  proxy.findAvailableNear(here, 1, 5);          // hit
  assert.deepEqual(proxy.stats(), { hits: 1, misses: 1 });
  proxy.save(new Driver("d2", "B", new Car(), new Location(23.8203, 90.4256))); // invalidates
  proxy.findAvailableNear(here, 1, 5);          // miss again
  assert.equal(proxy.stats().misses, 2);
});
