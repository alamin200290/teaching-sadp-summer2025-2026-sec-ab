# UniRide — Architecture & Decision Log

CSC 4273 · AIUB. A living document; each week adds a section and any Architecture Decision Records (ADRs).

## Layering (unchanged since Week 2)
`presentation (http) → application (app) → domain (rides, matching, pricing, drivers, providers,
notifications, geocoding, messaging, resilience) → infrastructure/shared`. **Dependencies point downward
only** — enforced by `test/layering.test.ts`, now also covering `messaging` and `resilience`.

## Week 3 — Creational patterns
Factory Method, Abstract Factory, Builder, isolated Singleton. See **ADR-003**.

## Week 4 — Structural patterns
Adapter, Facade, Proxy, Decorator, Composite. See **ADR-004**.

## Week 5 — Behavioural patterns
Strategy (matching), Observer (ride events), Command (cancel/refund undo), Template Method (fare
settlement), State (ride lifecycle). See **ADR-005**.

## Week 6 — Distributed & cloud-native patterns

The monolith stays a single deployment, but its internals now use the patterns that make a distributed
system tractable — and mark the seams for later extraction.

- **Event-Driven Architecture** — `EventBroker` is a generic topic pub/sub with per-subscriber error
  isolation. `RideStatusPublisher` (the Week 5 Observer) is re-expressed as a typed facade over the broker
  publishing to `ride.confirmed`; the notifier and analytics are two independent subscribers. Adding a
  consumer touches neither the producer nor the other consumers.
- **Circuit Breaker** — `CircuitBreaker` guards a failing dependency: after `failureThreshold` failures it
  OPENs and fails fast, then HALF_OPENs after `cooldownMs` to probe recovery.
- **Retry** — `retry()` re-attempts transient failures with exponential backoff (injectable `sleep`).
- **Resilient payment gateway** — `ResilientPaymentGateway` is a Decorator that composes retry + circuit
  breaker around any `PaymentProvider`, wired into the payment path in the composition root.
- **Saga** — `BookingSaga` runs the booking as local steps (create ride → reserve driver → charge payment
  → confirm), compensating completed steps in reverse if any step fails.

### ADR-006 — Distributed patterns inside a modular monolith; defer service extraction

**Status:** Accepted (Week 6).

**Context.** UniRide must be resilient (a flaky payment provider must not cascade), extensible in its
reactions to events, and consistent across a multi-step booking — all properties usually associated with a
microservices platform. But the team is small and premature decomposition (ADR-002) would split along the
wrong boundaries and add heavy operational cost.

**Decision.** Adopt the distributed *patterns* now, in-process, while staying a single deployment: an
**event broker** for producer/consumer decoupling, a **circuit breaker** + **retry** for resilience around
payments, and a **saga** for the booking transaction. Keep module boundaries clean so each can later become
a network boundary; treat the **API gateway** as the existing HTTP layer.

**Consequences.**
- *Positive:* real resilience and decoupling today; the patterns are identical whether calls are in-process
  or over the network, so extraction is a wiring change, not a redesign; every pattern is unit-tested.
- *Negative:* in-process pub/sub and sagas do not exercise partial-failure and network semantics (no real
  message durability or partition behaviour). Accepted for this stage; Week 8 stress-tests these.
- *CAP note:* when the broker and saga do cross the network, the booking chooses availability + compensation
  over a distributed lock (eventual consistency), while payment remains strongly consistent (CP).

**Alternatives considered.** Extract services now (rejected — ADR-002 cost/boundary risk); a two-phase
commit for booking (rejected — locking and coordinator fragility; a saga fits the domain better).

## Cumulative ADR index
- **ADR-001** Layered architecture; dependencies downward only (Week 2).
- **ADR-002** Modular monolith with a staged migration path to services (Week 2).
- **ADR-003** Prefer DI-scoped single instances over the Singleton pattern (Week 3).
- **ADR-004** Wrappers (Adapter/Proxy/Decorator) preserve the wrapped interface (Week 4).
- **ADR-005** Replace conditionals with delegated behaviour — Strategy + State, Observer decoupling (Week 5).
- **ADR-006** Distributed patterns inside a modular monolith; defer service extraction (Week 6).
