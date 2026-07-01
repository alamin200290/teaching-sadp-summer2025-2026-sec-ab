# UniRide Backend — Week 4 (Structural Design Patterns)

`v0.4.0-week4`. Builds on the Weeks 1–3 core (SOLID domain, layered MVC API, creational
patterns). Week 4 adds the five GoF **structural** patterns as real changes to the codebase —
all favouring composition over inheritance.

> Backend only. In-memory storage; the seams (`*Repository`, `PaymentProvider`,
> `NotificationChannel`, `GeocodingPort`) are where Postgres/Redis/FCM/maps land later.

---

## Run it

```bash
npm install
npm test     # build + 32 tests (node:test)
npm run demo # books via the Facade (addresses geocoded) + prints a Composite fare tree
npm start    # http://localhost:3000
```

```bash
curl localhost:3000/health
curl -X POST localhost:3000/rides -H 'content-type: application/json' \
  -d '{"riderId":"rider_1","pickup":{"lat":23.8203,"lng":90.4253},"dropoff":{"lat":23.7806,"lng":90.4193},"seats":2}'
```

Watch the server log on a booking: `driver_cache.miss` (Proxy) and `channel.send` (Decorator)
appear alongside the normal flow.

---

## Lecture → code map (Week 4)

| Pattern | Where it lives | What it does in UniRide |
|---|---|---|
| **Adapter** | `geocoding/LegacyMapsAdapter.ts` (+ `LegacyMapsSdk`, `GeocodingPort`) | Makes a legacy maps SDK (`pinpoint -> {x,y}`) satisfy our `GeocodingPort` (`geocode -> Location`). |
| **Facade** | `app/RideBookingFacade.ts` | One `book()` over geocoding + builder + use-case; the controller stays thin. |
| **Proxy** | `drivers/CachingDriverProxy.ts` | Same `DriverRepository` interface; caches `findAvailableNear`, invalidates on `save`. |
| **Decorator** | `notifications/ChannelDecorators.ts` | `LoggingChannel` / `RetryingChannel` wrap a `NotificationChannel` and stack. |
| **Composite** | `pricing/FareBreakdown.ts` | A fare tree where leaf line-items and groups share `amount()`; totals recurse. |

### What changed from Week 3
- `RideController` no longer calls the use-case directly — it calls `RideBookingFacade.book()`.
- The container wraps the driver repo in `CachingDriverProxy` and the push channel in
  `LoggingChannel(RetryingChannel(PushChannel))` — both transparent to callers because they
  keep the original interface.
- Bookings can now be made from **text addresses**, resolved by the Adapter (`demo.ts` shows it).

---

## Layers & the golden rule (unchanged)

```
Presentation (http/)  ->  Application (app/)  ->  Domain (rides, drivers, pricing, geocoding, ...)  ->  Infrastructure
```

Dependencies point downward only. `test/layering.test.ts` fails the build if any inner layer
imports `http/` or `express`; Week 4's new folders (`geocoding/`, `pricing/`) are in the scan.

> Note on structural patterns and the rule: Adapter, Proxy, and Decorator all keep the
> *interface* of what they wrap, so swapping a concrete class for its wrapper in the composition
> root changes behaviour without touching a single caller — the dependency rule never bends.

---

## Roadmap
- **Week 5** — Behavioural patterns: Strategy (matching/pricing), Observer (ride-status events),
  State (the ride lifecycle, replacing the manual status guards in `Ride`), Command, Template Method.
- Swap repositories to Postgres and back `NotificationChannel` with FCM/Twilio and `GeocodingPort`
  with a real maps API — the interfaces are already in place, so only the composition root changes.
