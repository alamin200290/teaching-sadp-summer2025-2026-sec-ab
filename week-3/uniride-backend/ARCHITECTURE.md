# UniRide — Architecture (living document)

A cumulative record of structure and decisions. Weeks 1–2 established the layered core and the
dependency rule; Week 3 adds creational patterns.

## Layers

```
Presentation (http/)        controllers, DTO parsing, middleware, routing
        │  depends on
Application (app/)           use-cases (RequestRideUseCase), input builders
        │
Domain (rides, drivers,      entities, value objects (Money, Location), domain services,
matching, payments,          policies, and the PORT interfaces (Repository, PaymentProvider,
notifications, providers)    NotificationChannel, FarePolicy, *Factory)
        │
Infrastructure (shared/,     adapters & runtime concerns: in-memory repos, gateways,
*InMemory*, gateways)        ConsoleLogger, SystemClock, id generator
```

**Golden rule:** dependencies point downward only. Enforced by `test/layering.test.ts`.
Composition (the only place `new` wires graphs) lives in `src/composition/container.ts`.

## Week 3 — Creational patterns applied

### Factory Method — `notifications/NotificationChannelFactory.ts`
The `NotificationDispatcher` previously held a hard-coded list of channels. It now depends on a
`NotificationChannelFactory` and calls `create(kind)`. Adding `EmailChannel` required changes to
the factory only — dispatcher and use-cases were untouched (Open/Closed). The default factory
caches one instance per kind (so each channel's outbox persists) and accepts per-kind overrides,
which is how the region-specific SMS channel is injected.

### Abstract Factory — `providers/RegionProviderFactory.ts`
A region is a *family* of collaborators that must agree: payment gateway + SMS sender.
`BangladeshProviderFactory` yields `{ bKash, SmsChannel("BD") }`; `InternationalProviderFactory`
yields `{ Card, SmsChannel("INTL") }`. The composition root chooses one factory from
`config.region` and the entire matching set follows — there is no code path that pairs bKash with
an international sender.

### Builder — `app/RideRequestBuilder.ts`
`RequestRideInput` grew optional parts (promo code, scheduled time, notes). Rather than a wide
constructor or a sprawling literal, callers assemble it fluently
(`forRider().from().to().seats().withPromoCode().build()`); `build()` validates required parts.

### Singleton — deliberately avoided in app code (see ADR-003)
`patterns/SingletonExample.ts` shows the textbook mechanics in isolation, but the application
does not use it. The "one instance" benefit is obtained by creating one `AppConfig`/`Logger` in
the composition root and injecting it — without the hidden global coupling.

## Decision records

### ADR-000 — Polyglot persistence honouring CAP (accepted, Week 2)
Rides/drivers in Postgres (consistency); driver-location/matching cache in Redis (availability).
Domain depends on repository interfaces so the store is swappable.

### ADR-002 — Modular monolith first (accepted, Week 2)
One deployable, hard module boundaries (the layered packages). Defers microservice cost until
scale demands it; boundaries already drawn for later extraction.

### ADR-003 — Prefer DI-scoped single instances over the Singleton pattern (accepted, Week 3)
**Context.** Several collaborators should exist once per process (config, logger, channel
instances). The Singleton pattern (`getInstance()`) is the textbook answer.
**Decision.** In application code we do **not** use Singletons. The composition root constructs
exactly one instance and injects it; the notification factory caches one channel per kind.
**Consequences.** (+) Dependencies stay explicit in constructors; tests pass fakes freely; no
global state leaking between test cases. (−) Slightly more wiring in `container.ts`. A standalone
`patterns/SingletonExample.ts` is retained purely as a teaching reference.

## Test strategy
`node:test` + `node:assert`. Unit (Money, Vehicle, RideService, PaymentService), pattern units
(NotificationChannelFactory, RideRequestBuilder, RegionProviderFactory, SingletonExample),
end-to-end use-case, HTTP integration (supertest-free, real `app.listen(0)`), and the
`layering` fitness function. 23 tests, clean `tsc`.
