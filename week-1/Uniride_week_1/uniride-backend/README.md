# UniRide — Backend

AIUB campus ride-sharing platform. This repository grows **one lecture at a time**: after
each week's CSC 4273 lecture, we add the code for that week's topics, so the running project always reflects what has been taught.

> **This is the Week 1 deliverable: SOLID foundations + a quality-attribute-driven module
> structure.** It is a real, runnable, fully tested core — not pseudocode.

---

## Quick start

```bash
npm install      # one-time
npm test         # compile + run the unit/integration tests (8 tests)
npm start        # compile + run the "book a ride" demo scenario
```

Requires Node.js 20+ (uses the built-in test runner). No database needed in Week 1 —
storage is in-memory behind interfaces (that is deliberate; see DIP below).

---

## What Week 1 delivers

A clean **domain core** for the "book a ride" flow, structured so that every SOLID
principle from the lecture is visible in the code, and so that later weeks can extend it without rewrites.

### Module structure (slide 24 — "SRP at architecture scale")

```
src/
  shared/         value objects (Money, Location) + injected abstractions (Clock, Logger, IdGenerator) + config
  rides/          Ride entity, RideService (lifecycle), RideRepository (ISP), FarePolicy (OCP)
  drivers/        Driver, Vehicle hierarchy (LSP), DriverRepository
  matching/       MatchingEngine (driver selection only)
  payments/       PaymentProvider (OCP) + bKash/Card gateways + PaymentService
  notifications/  NotificationChannel + Push/SMS + NotificationDispatcher
  app/            RequestRideUseCase (orchestrates the single-responsibility services)
  main.ts         composition root — wires concretes, runs the demo
test/             unit + end-to-end tests
```

### Lecture → code map

| Week 1 topic | Where to see it |
|---|---|
| **S** — Single Responsibility | `rides/Ride.ts` (state only), `rides/RideService.ts`, `matching/MatchingEngine.ts`, `notifications/NotificationDispatcher.ts` — each has one reason to change |
| **O** — Open/Closed | `payments/PaymentProvider.ts` (+ `BkashGateway`/`CardGateway`), `rides/FarePolicy.ts` (+ `StandardFarePolicy`/`SurgeFarePolicy`) — add behaviour without editing callers |
| **L** — Liskov Substitution | `drivers/Vehicle.ts` — `Car`/`Motorbike`/`Rickshaw` are interchangeable; none throws "not implemented" |
| **I** — Interface Segregation | `rides/RideRepository.ts` — `RideReader` and `RideWriter` are separate; clients depend only on what they use |
| **D** — Dependency Inversion | every service takes abstractions via its constructor; `main.ts` is the only place that names concrete classes |
| **Quality attributes** | see `ARCHITECTURE.md` — and note the injected `Clock`/`Logger` (testability + observability), `shared/config.ts` (operability), `Money`/validation (reliability) |
| **4+1 views & CAP** | documented in `ARCHITECTURE.md` (the logical view = these modules; the CAP/persistence decision = ADR-000) |

### Why in-memory repositories?

DIP lets us ship a working system in Week 1 with `InMemory*Repository` behind the same interface a PostgreSQL adapter will implement later. When Week 6 adds the real database,
**no service changes** — only the wiring in `main.ts`. That swap is the payoff of DIP, and you can see it is real because the same repositories are what make the tests fast.

---

## The weekly AI-assisted workflow

We use AI to generate each week's code **after** the lecture, against this growing codebase. Keep these rules so the AI extends the architecture instead of fighting it:

1. **Give it the context**: paste `ARCHITECTURE.md` + the relevant existing module(s).
2. **State the week's topic and the deliverable** in architectural terms (e.g. Week 3 =
   "introduce a Factory for notification channels; do not change `NotificationDispatcher`'s
   public API").
3. **Demand the constraints**: TypeScript strict, depend on existing abstractions, add tests,
   keep each class single-responsibility, no breaking changes to public interfaces.
4. **Require it to run**: `npm test` and `npm start` must still pass before you accept the diff.

### Reusable prompt template

```
You are extending the UniRide backend (TypeScript, strict mode). Architecture and
conventions are in ARCHITECTURE.md (attached). Existing code for the modules you will touch is attached.

This week's lecture topic: <WEEK N TOPIC>.
Deliverable: <what should exist after this week, in architectural terms>.

Rules:
- Reuse the existing abstractions (Clock, Logger, IdGenerator, *Repository, FarePolicy,
  PaymentProvider, NotificationChannel). Do not duplicate them.
- Each new class has a single responsibility; depend on interfaces, inject via constructor.
- Do NOT change the public API of existing classes unless the task explicitly says so.
- Add unit tests (node:test) for new behaviour and keep all existing tests green.
- Output: the new/changed files in full, plus a one-line note per file on which
  principle/pattern it demonstrates.

Verify mentally that `npm test` and `npm start` still pass.
```

---

## Roadmap (what later weeks add — intentionally absent now)

| Week | Adds |
|---|---|
| 2 | Layered architecture + an Express/MVC HTTP layer over this core; C4 diagrams |
| 3–5 | GoF patterns: Factory (notifications), Adapter/Decorator/Proxy, Strategy/Observer/State |
| 6 | Split into microservices; PostgreSQL + Redis repository adapters; API gateway; Saga |
| 8–9 | Scaling, resilience, caching, Zero-Trust auth (JWT/OAuth2), observability |
| 13 | Serverless jobs; blue-green & canary deployment |

Each builds on the interfaces defined here.
