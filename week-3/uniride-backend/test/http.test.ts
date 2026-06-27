import { test, before, after } from "node:test"; import assert from "node:assert/strict";
import type { Server } from "node:http";
import { buildContainer } from "../src/composition/container";
let server: Server; let base: string;
before(async () => {
  const { app } = buildContainer({ ...process.env });
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => { const a = server.address(); base = `http://127.0.0.1:${typeof a === "object" && a ? a.port : 0}`; resolve(); });
  });
});
after(async () => { await new Promise<void>((resolve) => server.close(() => resolve())); });
test("GET /health returns ok + version", async () => {
  const r = await fetch(`${base}/health`); assert.equal(r.status, 200);
  const b = await r.json(); assert.equal(b.status, "ok"); assert.equal(b.version, "0.3.0-week3");
});
test("POST /rides books a ride (201)", async () => {
  const r = await fetch(`${base}/rides`, { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ riderId: "rider_1", pickup: { lat: 23.8203, lng: 90.4253 }, dropoff: { lat: 23.7806, lng: 90.4193 }, seats: 2 }) });
  assert.equal(r.status, 201); const b = await r.json();
  assert.match(b.rideId, /^ride_/); assert.equal(b.status, "ASSIGNED"); assert.ok(b.fare.amount > 0);
});
test("POST /rides invalid -> 400 VALIDATION", async () => {
  const r = await fetch(`${base}/rides`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ riderId: "x" }) });
  assert.equal(r.status, 400); assert.equal((await r.json()).error.code, "VALIDATION");
});
test("POST /rides no driver -> 409 UNAVAILABLE", async () => {
  const r = await fetch(`${base}/rides`, { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ riderId: "r", pickup: { lat: 0, lng: 0 }, dropoff: { lat: 0, lng: 1 }, seats: 1 }) });
  assert.equal(r.status, 409); assert.equal((await r.json()).error.code, "UNAVAILABLE");
});
test("GET /drivers lists nearby drivers", async () => {
  const r = await fetch(`${base}/drivers?lat=23.8203&lng=90.4253&seats=1`);
  assert.equal(r.status, 200); assert.ok((await r.json()).count >= 1);
});
