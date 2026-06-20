import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { buildContainer } from "../src/composition/container";

let server: Server;
let base: string;

before(async () => {
  const { app } = buildContainer({ ...process.env });
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      base = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

test("GET /health returns ok + version", async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "ok");
  assert.equal(body.version, "0.2.0-week2");
});

test("POST /rides books a ride and returns 201 with fare + driver", async () => {
  const res = await fetch(`${base}/rides`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      riderId: "rider_1",
      pickup: { lat: 23.8203, lng: 90.4253, label: "AIUB" },
      dropoff: { lat: 23.7806, lng: 90.4193, label: "Banani" },
      seats: 2,
    }),
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.match(body.rideId, /^ride_/);
  assert.equal(body.status, "ASSIGNED");
  assert.ok(body.fare.amount > 0);
  assert.ok(body.driver.id);
});

test("POST /rides with an invalid body returns 400 VALIDATION", async () => {
  const res = await fetch(`${base}/rides`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ riderId: "rider_1", seats: 2 }), // missing pickup/dropoff
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error.code, "VALIDATION");
});

test("POST /rides with no driver in range returns 409 UNAVAILABLE", async () => {
  const res = await fetch(`${base}/rides`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      riderId: "rider_1",
      pickup: { lat: 0, lng: 0 },
      dropoff: { lat: 0, lng: 1 },
      seats: 1,
    }),
  });
  assert.equal(res.status, 409);
  const body = await res.json();
  assert.equal(body.error.code, "UNAVAILABLE");
});

test("GET /drivers lists available drivers near a point", async () => {
  const res = await fetch(`${base}/drivers?lat=23.8203&lng=90.4253&seats=1`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.count >= 1);
  assert.ok(Array.isArray(body.drivers));
});
