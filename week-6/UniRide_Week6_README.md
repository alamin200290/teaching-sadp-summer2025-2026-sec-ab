# UniRide Backend — Week 6 (Distributed & Cloud-Native Patterns)

`v0.6.0-week6` · CSC 4273 Software Architecture & Design Patterns · AIUB

This week adds the **distributed & cloud-native** patterns from the Week 6 lecture on top of the
Week 1–5 core. The service still ships as one modular monolith (ADR-002), but these patterns model — and
prepare the code for — a services topology: an event broker, resilience around a flaky dependency, and a
saga for a multi-step transaction.

## What is new this week

| Pattern | Where | What it does |
|---|---|---|
| **Event-Driven (broker)** | `messaging/EventBroker.ts`, `messaging/DomainEvents.ts` | Topic-based pub/sub with isolated delivery. The Week 5 `RideStatusPublisher` is now a typed facade over the broker — the same Observer API, backed by real pub/sub on the `ride.confirmed` topic. |
| **Circuit Breaker** | `resilience/CircuitBreaker.ts` | CLOSED → OPEN → HALF_OPEN. After `failureThreshold` failures it opens and fails fast; after `cooldownMs` it lets one trial through. |
| **Retry (backoff)** | `resilience/retry.ts` | Retries a transient action with exponential backoff; `sleep` is injectable for fast, deterministic tests. |
| **Resilient gateway** | `payments/ResilientPaymentGateway.ts` | A Decorator (W4) that wraps a `PaymentProvider` with retry **and** a circuit breaker — the interface is unchanged, so nothing downstream knows. |
| **Saga** | `app/BookingSaga.ts` | Runs booking steps as local transactions; on any failure it compensates the completed steps **in reverse** — consistency without a distributed lock. |

## Where the distributed concepts live

- **Microservices decomposition & API Gateway** are architectural (deployment) decisions — see
  `ARCHITECTURE.md` and **ADR-006**. The module boundaries (`rides`, `matching`, `payments`,
  `notifications`, `drivers`) are the seams along which services would be extracted; the HTTP layer is the
  gateway seam.
- **Event-Driven, Circuit Breaker, Retry, Saga** are implemented here as real, tested code.

## Run it

```bash
npm install
npm test          # 55 tests (build + node --test)
npm run demo      # EDA booking + circuit breaker tripping + saga compensation
npm start         # HTTP API on :3000
```

Tuneable resilience (circuit breaker) via env:

```bash
URIDE_CB_THRESHOLD=4 URIDE_CB_COOLDOWN_MS=10000 npm start
```

## Roadmap

**Week 8 — Scalability & Resilience (NFAs).** Turn these building blocks into measured non-functional
targets: horizontal-scale the stateless API, add bulkheads and back-pressure to the broker, and load-test
the circuit-breaker thresholds. **Week 9** then adds performance/security tactics and formal ADRs.
