# UniRide Backend — Week 3 (Creational Design Patterns)

`v0.3.0-week3`. Builds directly on the Weeks 1–2 layered core (SOLID domain, in‑memory
repositories, Express MVC API, composition root, architecture fitness function). Week 3 adds
three creational patterns as **real refactors** to that codebase, plus a documented decision
to *avoid* the fourth (Singleton) in application code.

> Backend only (no React Native yet). Storage is in‑memory; the seams (`*Repository`,
> `PaymentProvider`, `NotificationChannel`) are where Postgres/Redis/FCM land later.

---

## Run it

```bash
npm install
npm test     # build + 23 tests (node:test)
npm run demo # books a ride assembled with RideRequestBuilder
npm start    # http://localhost:3000
```

```bash
curl localhost:3000/health
curl -X POST localhost:3000/rides -H 'content-type: application/json' \
  -d '{"riderId":"rider_1","pickup":{"lat":23.8203,"lng":90.4253},"dropoff":{"lat":23.7806,"lng":90.4193},"seats":2}'
curl "localhost:3000/drivers?lat=23.8203&lng=90.4253&seats=1"
```

`URIDE_REGION=INTL npm start` swaps the whole regional provider family (Card + intl SMS).

---

## Lecture → code map (Week 3)

| Pattern | Where it lives | What it does in UniRide |
|---|---|---|
| **Factory Method** | `notifications/NotificationChannelFactory.ts` (+ `EmailChannel.ts`) | Dispatcher asks the factory for a channel **by kind**; adding `EmailChannel` touched no caller (OCP). |
| **Abstract Factory** | `providers/RegionProviderFactory.ts` | One factory yields a **matching family** `{ payment, sms }` per region; swap the factory, swap the set. |
| **Builder** | `app/RideRequestBuilder.ts` | Fluent step‑by‑step assembly of `RequestRideInput` — kills the telescoping constructor. |
| **Singleton** | `patterns/SingletonExample.ts` (isolated) | Classic mechanics shown for the lecture; **app code injects a single instance instead** (ADR‑003). |

### How each refactor changed the Week 2 code
- `NotificationDispatcher` no longer receives a hard‑coded `channels[]`; it receives a
  `NotificationChannelFactory` and calls `create(kind)`. It no longer knows how channels are built.
- The composition root picks a `RegionProviderFactory` from `config.region`, then wires the
  region's payment provider into `PaymentService` and the region's SMS channel into the
  notification factory — both families chosen by **one** decision.
- `demo.ts` now builds its input via `RideRequestBuilder` instead of an inline object literal.

---

## Layers & the golden rule (unchanged from Week 2)

```
Presentation (http/)  ->  Application (app/)  ->  Domain (rides, drivers, ...)  ->  Infrastructure
```

Dependencies point **downward only**. `test/layering.test.ts` is a fitness function that fails
the build if any inner layer imports `http/` or `express`; Week 3's new folders
(`providers/`, `patterns/`) are included in that scan.

---

## Roadmap
- **Week 4** — Structural patterns (Adapter for the real bKash SDK, Decorator for surge/promo on `FarePolicy`, Facade over booking).
- **Week 5** — Behavioural patterns (Strategy for matching, Observer for ride‑status events, State for the ride lifecycle).
- Repositories swapped to Postgres; `NotificationChannel` backed by FCM/Twilio — interfaces already in place.
