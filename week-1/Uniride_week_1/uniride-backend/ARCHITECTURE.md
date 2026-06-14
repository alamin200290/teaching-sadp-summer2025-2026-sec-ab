# UniRide — Architecture Notes (Week 1)

A living document. Week 1 records the foundations: the quality-attribute targets, the
logical view of the system, and the first significant decision (CAP / persistence).

## 1. Quality-attribute targets (the "-ilities")

These are the non-functional goals that drive design decisions. Week 1 sets the targets;
later weeks implement the mechanisms.

| Attribute | Target for UniRide | Foundation laid in Week 1 |
|---|---|---|
| Scalability | Handle a convocation-day peak (~5,000 concurrent users) | Stateless services; no session state in service objects |
| Availability | No single point of failure on the booking path | Interfaces allow redundant/replicated implementations later |
| Security | Never store raw card data; authenticate every request | Payment goes through a provider abstraction; auth deferred to Week 9 |
| Maintainability | A change touches one module, not many | SRP modules + DIP; each module independently testable |
| Performance | Booking feels instant (p99 budget set in Week 8/9) | Pure, cheap domain logic; caching introduced later |
| Reliability | No double charges; valid ride states only | Self-validating `Money`; explicit ride state transitions |

## 2. The 4+1 view model (Week 1 logical view)

- **Logical view** (structure that delivers functionality): the modules in `src/` —
  `rides`, `drivers`, `matching`, `payments`, `notifications`, orchestrated by
  `app/RequestRideUseCase`. Each maps to a domain capability (SRP at architecture scale).
- **Process view** (runtime): a single process in Week 1; the "book a ride" use case runs
  the perceive→decide→act flow synchronously. Concurrency/queues arrive with EDA in Week 6.
- **Development view**: one module per folder, each independently testable; dependencies
  point inward toward `shared` abstractions.
- **Physical view**: a single Node process now; containers and AWS deployment in Weeks 6/13.
- **+1 Scenarios**: the driving scenario is *"a student books a ride from AIUB to Banani"* —
  implemented end-to-end in `RequestRideUseCase` and exercised by the demo and tests.

## 3. ADR-000 — Persistence & CAP stance (polyglot persistence)

**Status:** Accepted (Week 1)

**Context.** UniRide has two kinds of data with opposite needs: ride/payment **state**
(must never disagree across servers) and live driver **location** (must stay available and
can tolerate being a couple of seconds stale).

**Decision.** Adopt **polyglot persistence** with a CAP stance per data type:
- **Ride & payment state → CP** (a relational store, PostgreSQL, with ACID transactions).
  Correctness beats availability: better to reject a write than to show two truths.
- **Driver locations & sessions → AP** (Redis). Availability and speed beat strict
  consistency: a 2-second-stale position is fine.

**Consequences.** (+) Each data type gets the guarantee it needs. (−) Two stores to operate
and reason about. In Week 1 both are represented by in-memory repositories behind interfaces
(`RideRepository`, `DriverRepository`); the real PostgreSQL/Redis adapters arrive in Week 6
and slot in without changing any service (DIP).

> This ADR is the first entry in UniRide's decision log. The ADR format itself is taught in
> Week 9; the running set is tracked across the course.
