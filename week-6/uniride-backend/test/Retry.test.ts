import { test } from "node:test"; import assert from "node:assert/strict";
import { retry } from "../src/resilience/retry";
const noSleep = async () => {};
test("retries transient failures then succeeds", async () => {
  let n = 0;
  const result = await retry(async () => { if (++n < 3) throw new Error("transient"); return "done"; }, { attempts: 3, sleep: noSleep });
  assert.equal(result, "done"); assert.equal(n, 3);
});
test("gives up after the maximum attempts", async () => {
  let n = 0;
  await assert.rejects(retry(async () => { n++; throw new Error("always"); }, { attempts: 2, sleep: noSleep }), /always/);
  assert.equal(n, 2);
});
