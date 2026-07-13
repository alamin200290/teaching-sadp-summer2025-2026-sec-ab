import { test } from "node:test"; import assert from "node:assert/strict";
import { BuildInfo } from "../src/patterns/SingletonExample";
test("Singleton: getInstance() always returns the same object", () => {
  assert.equal(BuildInfo.getInstance(), BuildInfo.getInstance());
});
