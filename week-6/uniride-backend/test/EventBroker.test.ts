import { test } from "node:test"; import assert from "node:assert/strict";
import { EventBroker } from "../src/messaging/EventBroker";
test("delivers a published event to every subscriber on the topic", async () => {
  const broker = new EventBroker();
  const seen: string[] = [];
  broker.subscribe<string>("t", (p) => { seen.push("a:" + p); });
  broker.subscribe<string>("t", (p) => { seen.push("b:" + p); });
  await broker.publish("t", "x");
  assert.deepEqual(seen.sort(), ["a:x", "b:x"]); assert.equal(broker.subscriberCount("t"), 2);
});
test("a failing subscriber is isolated and does not break the others", async () => {
  const broker = new EventBroker();
  let reached = false;
  broker.subscribe("t", () => { throw new Error("boom"); });
  broker.subscribe("t", () => { reached = true; });
  await broker.publish("t", 1);   // must not reject
  assert.equal(reached, true);
});
test("subscribers only receive their own topic", async () => {
  const broker = new EventBroker();
  let got = 0;
  broker.subscribe("a", () => { got++; });
  await broker.publish("b", 1);
  assert.equal(got, 0);
});
