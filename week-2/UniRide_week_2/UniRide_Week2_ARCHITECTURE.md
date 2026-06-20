# UniRide — Architecture Notes

A living document, extended each week. Weeks covered: 1 (foundations), 2 (layering & MVC).

## 1. Quality-attribute targets (the "-ilities")

| Attribute | Target for UniRide | Mechanism so far |
|---|---|---|
| Scalability | ~5,000 concurrent users (convocation day) | stateless services; no state held in service objects |
| Availability | no single point of failure on the booking path | `GET /health` for LB/orchestrator probes; replaceable layers |
| Security | never store raw card data; authenticate every request | payments behind a provider abstraction; input validated at the edge; auth in Week 9 |
| Maintainability | a change touches one module/layer, not many | SOLID modules + strict layering (enforced by a test) |
| Performance | booking feels instant (p99 budget set in Week 8/9) | cheap pure domain logic; caching later |
| Reliability | no double charges; valid ride states only | self-validating `Money`; explicit ride state machine; typed errors |

## 2. Layered architecture & the dependency-direction rule (Week 2)

Four layers, dependencies pointing **downward only**:

```
Presentation (src/http)        controllers, routes, DTOs, middleware  [Express]
      | depends on
Application  (src/app)         use-cases that orchestrate the domain
      | depends on
Domain       (src/rides, ...)  entities, domain services, and the interfaces (ports)
      ^ implemented by
Infrastructure (src/*/InMemory*, gateways, channels)   the concrete adapters
```

**Golden rule:** an inner layer never imports an outer one. This is not just a convention —
`test/layering.test.ts` is a *fitness function* that scans the domain/application source and
fails the build if it imports the presentation layer or Express. (Architecture evaluation
returns formally as ATAM in Week 8.)

**Composition root.** `src/composition/container.ts` is the single place that knows concrete
classes. It builds infrastructure → application → presentation and hands each layer the
interfaces it needs. This is what makes implementations swappable without touching callers.

## 3. MVC mapping (Week 2)

- **Controller** — `src/http/controllers/*`: parse/validate, delegate, serialise. Thin by
  design (the Fat Controller anti-pattern is what we are avoiding).
- **Model** — the application use-case and the domain (`RequestRideUseCase`, entities,
  `RideService`, `MatchingEngine`, ...).
- **View** — response DTOs (`src/http/dto/RideDtos.ts`): the JSON serialisation boundary.

The future React Native client will follow **MVVM** — the same system, two presentation
patterns.

## 4. The 4+1 view model

- **Logical view**: the modules in `src/` (rides, drivers, matching, payments,
  notifications) plus the application and presentation layers.
- **Process view**: an HTTP request now flows Controller → Use-Case → domain services →
  repositories, synchronously. Async/event-driven flow arrives with EDA in Week 6.
- **Development view**: one folder per module/layer; the dependency rule is test-enforced.
- **Physical view**: a single Node process; containers + AWS in Weeks 6/13.
- **+1 Scenarios**: *"a student books a ride from AIUB to Banani"* — now reachable as
  `POST /rides`, and exercised by the HTTP tests.

## 5. Decision log

### ADR-000 — Persistence & CAP stance (polyglot persistence) — Accepted (Week 1)
Ride/payment **state → CP** (PostgreSQL, ACID): correctness over availability.
Driver **locations & sessions → AP** (Redis): availability/speed over strict consistency.
In Week 1–2 both are in-memory repositories behind interfaces; real adapters land in Week 6
with no change to services (DIP).

### ADR-002 — Start as a modular monolith, not microservices — Accepted (Week 2)
**Context.** UniRide is a new product built by a small team. Microservices add operational
complexity (deployment, networking, distributed data) that is not justified before we have
load or team scale to need it. But we do not want a tangled monolith that is impossible to
split later.
**Decision.** Ship a **modular monolith**: one deployable process, but cleanly separated
modules (`rides`, `drivers`, `matching`, `payments`, `notifications`) that talk through
interfaces and a use-case layer — never by reaching into each other's internals.
**Alternatives.** Microservices from day one — rejected: premature operational cost and
distributed-system failure modes for no current benefit. A single unstructured module —
rejected: would not be safely splittable later.
**Consequences.** (+) Simple to run and reason about now; the module seams are exactly the
future service boundaries. (−) One process is a single deployment/scaling unit until Week 6,
when the seams here become independently deployable services.

> ADR-001 (the layered structure itself) is implied by Week 2's design; ADR numbering is
> kept continuous with the lecture's running example.
