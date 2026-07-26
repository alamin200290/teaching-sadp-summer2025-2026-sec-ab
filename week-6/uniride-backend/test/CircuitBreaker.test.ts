import { test } from "node:test"; import assert from "node:assert/strict";
import { CircuitBreaker, CircuitOpenError } from "../src/resilience/CircuitBreaker";
function mkClock() { let t = 0; return { clock: { now: () => new Date(t) }, advance: (ms: number) => { t += ms; } }; }
const fail = () => Promise.reject(new Error("x"));
const ok = () => Promise.resolve("ok");
test("opens after the failure threshold, then fails fast without calling the action", async () => {
  const { clock } = mkClock();
  const cb = new CircuitBreaker({ failureThreshold: 2, cooldownMs: 1000 }, clock);
  await assert.rejects(cb.execute(fail)); assert.equal(cb.current, "CLOSED");
  await assert.rejects(cb.execute(fail)); assert.equal(cb.current, "OPEN");
  let called = false;
  await assert.rejects(cb.execute(async () => { called = true; return 1; }), (e) => e instanceof CircuitOpenError);
  assert.equal(called, false); // short-circuited
});
test("after cool-down a successful trial closes the breaker", async () => {
  const { clock, advance } = mkClock();
  const cb = new CircuitBreaker({ failureThreshold: 1, cooldownMs: 500 }, clock);
  await assert.rejects(cb.execute(fail)); assert.equal(cb.current, "OPEN");
  advance(500);
  assert.equal(await cb.execute(ok), "ok"); assert.equal(cb.current, "CLOSED");
});
test("a failed trial in HALF_OPEN re-opens the breaker", async () => {
  const { clock, advance } = mkClock();
  const cb = new CircuitBreaker({ failureThreshold: 1, cooldownMs: 500 }, clock);
  await assert.rejects(cb.execute(fail)); assert.equal(cb.current, "OPEN");
  advance(500);
  await assert.rejects(cb.execute(fail)); assert.equal(cb.current, "OPEN");
});
