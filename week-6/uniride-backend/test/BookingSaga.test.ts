import { test } from "node:test"; import assert from "node:assert/strict";
import { BookingSaga, SagaFailedError } from "../src/app/BookingSaga";
test("happy path runs every step and no compensations", async () => {
  const log: string[] = [];
  const step = (n: string) => ({ name: n, action: async () => { log.push("do:" + n); }, compensation: async () => { log.push("undo:" + n); } });
  await new BookingSaga([step("a"), step("b"), step("c")]).run();
  assert.deepEqual(log, ["do:a", "do:b", "do:c"]);
});
test("a failing step compensates completed steps in reverse order", async () => {
  const log: string[] = [];
  const good = (n: string) => ({ name: n, action: async () => { log.push("do:" + n); }, compensation: async () => { log.push("undo:" + n); } });
  const bad = (n: string) => ({ name: n, action: async () => { log.push("do:" + n); throw new Error("fail"); }, compensation: async () => { log.push("undo:" + n); } });
  await assert.rejects(new BookingSaga([good("a"), good("b"), bad("c")]).run(), (e) => {
    assert.ok(e instanceof SagaFailedError); assert.equal((e as SagaFailedError).failedStep, "c"); return true;
  });
  // a and b ran, c failed; compensations run for b then a (reverse); c's own compensation is not run
  assert.deepEqual(log, ["do:a", "do:b", "do:c", "undo:b", "undo:a"]);
});
