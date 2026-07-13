# UniRide Backend — Week 5 (Behavioural Design Patterns)

`v0.5.0-week5` · CSC 4273 Software Architecture & Design Patterns · AIUB

This week layers the five **behavioural** GoF patterns from the Week 5 lecture on top of the
Week 1–4 core (SOLID + layering, creational, and structural patterns). Each pattern is a real
refactor of UniRide code, backed by tests.

## What is new this week

| Pattern | Where | What it does |
|---|---|---|
| **Strategy** | `matching/MatchScorer.ts`, `matching/MatchingEngine.ts` | The engine ranks drivers with an injected `MatchScorer` — `NearestScorer`, `HighestRatedScorer`, `CheapestScorer` — chosen from config. No `if/else` over strategy kinds. |
| **Observer** | `rides/RideEvents.ts`, `rides/observers/*` | `RideStatusPublisher` broadcasts a `confirmed` event; `NotifyingObserver` sends the rider/driver push, `AnalyticsObserver` counts. Adding a reaction needs no change to the publisher. |
| **Command** | `app/commands/*` | `CancelRideCommand` and `RefundPaymentCommand` are executable, reversible objects; `CommandInvoker` keeps history and supports `undoLast()`. |
| **Template Method** | `pricing/FareSettlement.ts` | `settle()` fixes the step order (service fee → hook → finalise); `StandardSettlement` and `PoolSettlement` override only the adjustment hook. |
| **State** | `rides/RideState.ts`, `rides/Ride.ts` | `Ride` delegates to a `RideState`; each state knows its legal transitions and throws on illegal ones — replacing the old status-flag conditionals. |

## Pattern → file map (cumulative)

- Week 3 (creational): `notifications/NotificationChannelFactory` (Factory Method), `providers/RegionProviderFactory` (Abstract Factory), `rides/RideRequestBuilder` (Builder), `examples/SingletonExample` (isolated).
- Week 4 (structural): `geocoding/LegacyMapsAdapter` (Adapter), `app/RideBookingFacade` (Facade), `drivers/CachingDriverProxy` (Proxy), `notifications/ChannelDecorators` (Decorator), `pricing/FareBreakdown` (Composite).
- Week 5 (behavioural): the table above.

## Run it

```bash
npm install
npm test          # 45 tests (build + node --test)
npm run demo      # Strategy match + Observer notify + Template Method + Command undo
npm start         # HTTP API on :3000  (URIDE_MATCH_STRATEGY=nearest|highest-rated|cheapest)
```

```bash
curl localhost:3000/health
curl -X POST localhost:3000/rides -H 'content-type: application/json' \
  -d '{"riderId":"r1","pickup":{"lat":23.8203,"lng":90.4253},"dropoff":{"lat":23.7806,"lng":90.4193},"seats":2}'
```

Switch the matching Strategy without a code change:

```bash
URIDE_MATCH_STRATEGY=highest-rated npm start
```


## Roadmap

**Week 6 — Distributed & Cloud-Native.** Extract the Matching service behind an API gateway; introduce
event-driven messaging (the Observer publisher becomes a real broker), CQRS for ride analytics, and
resilience patterns (circuit breaker, retry/back-pressure) with explicit CAP/consistency ADRs.
