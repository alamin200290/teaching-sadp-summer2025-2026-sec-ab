# UniRide — Backend

AIUB campus ride-sharing platform. This repository grows **one lecture at a time**: after
each week's CSC 4273 lecture, we add the code for that week's topics, so the running
project always reflects what has been taught.

**Current version: `0.2.0-week2`.**
- **Week 1** — SOLID foundations + a quality-attribute-driven domain core.
- **Week 2** — a **layered architecture** with an **MVC HTTP API** (Express) over that core. UniRide is now a running web service.

---

## Quick start

```bash
npm install      # one-time
npm test         # compile + run all tests (14: domain, HTTP, and an architecture rule)
npm start        # boot the HTTP server on http://localhost:3000
npm run demo     # run the "book a ride" scenario as a script (no server)
```

Requires Node.js 20+. Storage is still in-memory (PostgreSQL/Redis arrive in Week 6).

### Try the API

```bash
curl -s localhost:3000/health
curl -s "localhost:3000/drivers?lat=23.8203&lng=90.4253&seats=1"
curl -s -X POST localhost:3000/rides -H 'content-type: application/json' \
  -d '{"riderId":"rider_19-12345",
       "pickup":{"lat":23.8203,"lng":90.4253,"label":"AIUB"},
       "dropoff":{"lat":23.7806,"lng":90.4193,"label":"Banani"},
       "seats":2}'
```

| Method & path | Purpose |
|---|---|
| `GET /health` | Liveness + version (foundation for the Availability attribute) |
| `POST /rides` | Book a ride → `201` with driver, fare, payment ref |
| `GET /drivers?lat=&lng=&seats=&radiusKm=` | List available drivers near a point |

Errors are consistent JSON: `{ "error": { "code": "VALIDATION", "message": "..." } }`
(`400` validation, `409` no driver available, `500` unexpected).

---

## Architecture — the layers (Week 2)

Dependencies point **downward only** (the lecture's "golden rule"). An inner layer never
imports an outer one — and that rule is **enforced by a test** (`test/layering.test.ts`).

```
  Presentation   src/http/         controllers (thin), routes, DTOs, middleware   [Express]
       |          delegates to
  Application    src/app/          RequestRideUseCase  (+ rides/RideService)
       |          calls
  Domain         src/rides, drivers, matching, ...   entities + interfaces (no framework)
       ^          implemented by
  Infrastructure src/*/InMemory*Repository, payment gateways, channels
```

The **composition root** `src/composition/container.ts` is the only file that names
concrete classes; it wires infrastructure → application → presentation once at startup.
Swap an implementation there (e.g. `InMemoryRideRepository` → `PostgresRideRepository` in
Week 6) and nothing else changes.

### MVC mapping (Express)

| MVC role | In UniRide |
|---|---|
| **Controller** | `src/http/controllers/*` — parse request, delegate, serialise. **Thin** (no business logic — the opposite of the Fat Controller anti-pattern). |
| **Model** | the application use-case + domain (`RequestRideUseCase`, entities, services) |
| **View** | the response DTOs in `src/http/dto/RideDtos.ts` (JSON serialisation) |

> The React Native client (a later deliverable) will use **MVVM** — "the same system uses
> both," as the lecture notes.

### Lecture → code map (Week 2)

| Week 2 topic | Where to see it |
|---|---|
| N-Tier layered architecture | the `http → app → domain → infrastructure` layering; `container.ts` wiring |
| Dependency-direction golden rule | enforced automatically by `test/layering.test.ts` |
| MVC (Express style) | `http/controllers/*` (C), use-case/domain (M), `http/dto` (V) |
| Fat Controller anti-pattern | avoided — controllers only parse/delegate/serialise |
| Monolith vs SOA decision | `ARCHITECTURE.md` → ADR-002 (modular monolith now, microservices in Week 6) |
| C4 model | diagrams live in the Week 2 lecture deck; this codebase is their Level-2 subject |

(Week 1 SOLID map is unchanged — see `ARCHITECTURE.md`.)

---

## The weekly AI-assisted workflow

We use AI to generate each week's code **after** the lecture, against this growing codebase.

1. Give it `ARCHITECTURE.md` + the module(s) it will touch.
2. State the week's topic and the deliverable in architectural terms.
3. Demand the constraints: TS strict, reuse existing abstractions, thin controllers, no
   breaking public-API changes, add tests.
4. Require it to run: `npm test` and `npm start` must stay green.

### Reusable prompt template

```
You are extending the UniRide backend (TypeScript, strict). Architecture is in
ARCHITECTURE.md (attached). Existing code for the modules you will touch is attached.

This week's lecture topic: <WEEK N TOPIC>.
Deliverable: <what should exist after this week, in architectural terms>.

Rules:
- Respect the layers: presentation (http/) -> application (app/) -> domain -> infrastructure.
  Inner layers must not import outer ones (a test enforces this).
- Reuse existing abstractions (Clock, Logger, *Repository, FarePolicy, PaymentProvider,
  NotificationChannel). Wire new pieces in composition/container.ts only.
- Each new class has one responsibility; controllers stay thin.
- Add tests (node:test); keep all existing tests green.
- Output full files + one line per file naming the principle/pattern it shows.
```

---

## Roadmap

| Week | Status | Adds |
|---|---|---|
| 1 | ✅ | SOLID domain core, quality-attribute structure, ADR-000 (CAP) |
| 2 | ✅ | Layered architecture, MVC HTTP API, container.ts, ADR-002 (monolith) |
| 3–5 | ⏳ | GoF patterns: Factory (notifications), Adapter/Decorator/Proxy, Strategy/Observer/State |
| 6 | ⏳ | Microservices split; PostgreSQL + Redis repository adapters; API gateway; Saga |
| 8–9 | ⏳ | Scaling, resilience, caching, Zero-Trust auth (JWT/OAuth2), observability |
| 13 | ⏳ | Serverless jobs; blue-green & canary deployment |
