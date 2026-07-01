# UniRide — Architecture (living document)

A cumulative record of structure and decisions. Weeks 1–2 established the layered core and the
dependency rule; Week 3 added creational patterns; Week 4 adds structural patterns.

## Layers

```
Presentation (http/)         controllers, DTO parsing, middleware, routing
        │  depends on
Application (app/)            use-cases, RideRequestBuilder, RideBookingFacade
        │
Domain (rides, drivers,       entities, value objects (Money, Location), domain services,
matching, payments,           policies, pricing (Composite), and the PORT interfaces
notifications, providers,     (Repository, PaymentProvider, NotificationChannel, FarePolicy,
geocoding, pricing)           GeocodingPort, *Factory)
        │
Infrastructure (shared/,      adapters & runtime: in-memory repos, gateways, LegacyMapsAdapter,
*InMemory*, adapters)         ConsoleLogger, SystemClock, id generator
```

**Golden rule:** dependencies point downward only — enforced by `test/layering.test.ts`.
Composition (the only place graphs are wired) lives in `src/composition/container.ts`.

## Week 4 — Structural patterns applied

### Adapter — `geocoding/LegacyMapsAdapter.ts`
`LegacyMapsSdk` is a stand-in third party we cannot change: `pinpoint(query)` returns `{x, y}`
with longitude as `x`. `LegacyMapsAdapter` implements our `GeocodingPort` (`geocode(label) ->
Location`) and translates both the method and the shape. The application depends only on the port.

### Facade — `app/RideBookingFacade.ts`
The booking subsystem is several collaborators (geocoding, `RideRequestBuilder`,
`RequestRideUseCase`). The facade exposes a single `book(command)` over them; the controller
parses input and calls one method (the "Facade vs fat controller" point).

### Proxy — `drivers/CachingDriverProxy.ts`
A surrogate that implements `DriverRepository` exactly. It memoises `findAvailableNear` keyed by a
rounded query and clears the cache on any `save`, so availability never goes stale. Callers
(`MatchingEngine`, `DriverController`) are unaware they're talking to a proxy.

### Decorator — `notifications/ChannelDecorators.ts`
`ChannelDecorator` wraps a `NotificationChannel` and is one itself, so wrappers stack. The
container builds `LoggingChannel(RetryingChannel(PushChannel))`; the dispatcher still just calls
`send()`. Behaviour (logging, retry) is added by wrapping — the core channel is untouched.

### Composite — `pricing/FareBreakdown.ts`
`FareComponent` is implemented by both a leaf (`FareLineItem`) and a group (`FareGroup`). A group
sums its children, which may themselves be groups, so `amount()` recurses and any node totals the
same way. (Components are charges — non-negative, honouring Money's invariant; discounts are a
separate step.)

## Decision records

### ADR-000 — Polyglot persistence honouring CAP (accepted, Week 2)
Rides/drivers in Postgres (consistency); driver-location/matching cache in Redis (availability).

### ADR-002 — Modular monolith first (accepted, Week 2)
One deployable, hard module boundaries; defers microservice cost until scale demands it.

### ADR-003 — Prefer DI-scoped single instances over the Singleton pattern (accepted, Week 3)
The composition root constructs one instance and injects it; no global `getInstance()` in app code.

### ADR-004 — Wrappers must preserve the wrapped interface (accepted, Week 4)
**Context.** Adapter, Proxy, and Decorator all interpose on an existing collaborator.
**Decision.** Each wrapper implements the *same* interface as what it wraps, and wrapping happens
only in the composition root. A caching proxy is a `DriverRepository`; a logging decorator is a
`NotificationChannel`; an SDK adapter is a `GeocodingPort`.
**Consequences.** (+) Behaviour is swapped by changing one line in `container.ts`; no caller
changes; the layering rule holds. (−) An extra indirection to trace when reading the wiring —
mitigated by keeping all wrapping in one file.

## Test strategy
`node:test` + `node:assert`. Unit (Money, Vehicle, RideService, PaymentService), creational
pattern units (Week 3), structural pattern units (LegacyMapsAdapter, CachingDriverProxy,
ChannelDecorators, FareBreakdown, RideBookingFacade), end-to-end use-case, HTTP integration, and
the `layering` fitness function. 32 tests, clean `tsc`.
