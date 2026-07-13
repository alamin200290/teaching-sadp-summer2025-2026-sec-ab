# UniRide — Architecture & Decision Log

CSC 4273 · AIUB. A living document; each week adds a section and any Architecture Decision Records (ADRs).

## Layering (unchanged since Week 2)

`presentation (http) → application (app) → domain (rides, matching, pricing, drivers, providers,
notifications, geocoding) → infrastructure/shared`. **Dependencies point downward only** — enforced by
`test/layering.test.ts`, which fails the build if an inner layer imports Express or the `http` layer.

## Week 3 — Creational patterns
Factory Method (notification channels), Abstract Factory (regional providers: BD vs INTL payment + SMS),
Builder (`RideRequestBuilder`), and an isolated Singleton example. See **ADR-003**.

## Week 4 — Structural patterns
Adapter (legacy maps → `GeocodingPort`), Facade (`RideBookingFacade` over the request-ride use case),
Proxy (`CachingDriverProxy`), Decorator (logging/retry notification channels), Composite (`FareBreakdown`).
See **ADR-004**.

## Week 5 — Behavioural patterns

The behavioural patterns move *decisions and lifecycle* out of tangled conditionals and into objects.

- **Strategy** — `MatchScorer` makes the driver-ranking algorithm a pluggable object. `MatchingEngine`
  holds one scorer and calls `score()`; the algorithm is selected in the composition root from
  `URIDE_MATCH_STRATEGY`. Adding a ranking rule adds a class, not an `if`.
- **Observer** — `RideStatusPublisher` publishes a `confirmed` event; `NotifyingObserver` and
  `AnalyticsObserver` subscribe. The request-ride use case no longer calls the notifier directly — it
  publishes an event, decoupling *what happened* from *who reacts*.
- **Command** — `Command` (`execute`/`undo`) with a `CommandInvoker` history. `CancelRideCommand`
  snapshots the ride before cancelling and restores it on undo; `RefundPaymentCommand` reverses a refund.
- **Template Method** — `FareSettlement.settle()` fixes the step order; subclasses override only the
  `applyRideAdjustment()` hook (`StandardSettlement`, `PoolSettlement`).
- **State** — `Ride` delegates lifecycle behaviour to a `RideState`. Each state (`Requested`, `Assigned`,
  `InProgress`, `Completed`, `Cancelled`) permits only its legal transitions and throws otherwise,
  replacing the previous status-flag guards while preserving the public `Ride` API and error messages.

### ADR-005 — Replace conditionals with delegated behaviour (Strategy + State)

**Status:** Accepted (Week 5).

**Context.** Driver selection was hard-coded to "nearest", and the ride lifecycle was guarded by manual
status checks scattered in `Ride`/`RideService`. Both are points of frequent change (we A/B test matching;
the lifecycle gains states over time) and both were growing conditionals — exactly the smell SOLID's OCP
warns about.

**Decision.** Inject behaviour instead of branching on it. Matching uses the **Strategy** pattern
(`MatchScorer`); the ride lifecycle uses the **State** pattern (`RideState`). Notifications are decoupled
via **Observer** so new reactions do not touch the use case.

**Consequences.**
- *Positive:* new scorers, states, and reactions are added by adding a class (open for extension, closed
  for modification); each is unit-tested in isolation; the `MatchingEngine` and `Ride` stop growing `if`s.
- *Negative:* more small classes and a little indirection; a reader must follow a delegation to find
  behaviour. Accepted — the classes are cohesive and individually trivial.
- *Undo note:* `Ride.snapshot()/restore()` is a minimal Memento used only by `CancelRideCommand.undo()`;
  it deliberately bypasses the normal transition guards because reversing a cancellation is the point.

**Alternatives considered.** Keep `switch` statements (rejected — reopens closed code on every change);
a rules engine (rejected — over-engineered for five states and three scorers).

## Cumulative ADR index
- **ADR-001** Layered architecture; dependencies downward only (Week 2).
- **ADR-002** Modular monolith with a staged migration path to services (Week 2).
- **ADR-003** Prefer DI-scoped single instances over the Singleton pattern (Week 3).
- **ADR-004** Wrappers (Adapter/Proxy/Decorator) preserve the wrapped interface (Week 4).
- **ADR-005** Replace conditionals with delegated behaviour — Strategy + State, with Observer decoupling (Week 5).
