// Week 6 demo: Event-Driven booking, a tripping Circuit Breaker, and a Saga that compensates.
import { buildContainer } from "./composition/container";
import { CircuitBreaker, CircuitOpenError } from "./resilience/CircuitBreaker";
import { ResilientPaymentGateway } from "./payments/ResilientPaymentGateway";
import { BookingSaga, SagaFailedError } from "./app/BookingSaga";
import { PaymentProvider, PaymentResult } from "./payments/PaymentProvider";
import { Money } from "./shared/Money";

class FailingProvider implements PaymentProvider {
  readonly name = "flaky";
  async charge(): Promise<PaymentResult> { throw new Error("gateway timeout"); }
  async refund(): Promise<PaymentResult> { throw new Error("gateway timeout"); }
}

async function demo(): Promise<void> {
  const { booking, analytics, broker } = buildContainer();

  console.log("\n=== Event-Driven \u2014 booking publishes ride.confirmed to the broker ===\n");
  const r = await booking.book({ riderId: "rider_19-12345", pickup: "AIUB Campus", dropoff: "Banani", seats: 2 });
  console.log(`Ride ${r.ride.id} [${r.ride.status}] -> ${r.driver.name}, fare ${r.fare.toString()}`);
  console.log(`broker subscribers on ride.confirmed: ${broker.subscriberCount("ride.confirmed")}`);
  console.log(`analytics (a subscriber): ${JSON.stringify(analytics.stats())}`);

  console.log("\n=== Circuit Breaker \u2014 repeated payment failures trip the breaker ===");
  const breaker = new CircuitBreaker({ failureThreshold: 3, cooldownMs: 10000 });
  const gw = new ResilientPaymentGateway(new FailingProvider(), breaker, 1);
  for (let i = 1; i <= 5; i++) {
    try { await gw.charge(Money.of(100), `k${i}`); }
    catch (e) { console.log(`call ${i}: ${e instanceof CircuitOpenError ? "SHORT-CIRCUITED (fail fast)" : "failed"}  [state=${breaker.current}]`); }
  }

  console.log("\n=== Saga \u2014 payment step fails, completed steps compensate in reverse ===");
  const log: string[] = [];
  const saga = new BookingSaga([
    { name: "create-ride",    action: async () => { log.push("do:create"); },  compensation: async () => { log.push("undo:create"); } },
    { name: "reserve-driver", action: async () => { log.push("do:reserve"); }, compensation: async () => { log.push("undo:reserve"); } },
    { name: "charge-payment", action: async () => { log.push("do:charge"); throw new Error("card declined"); }, compensation: async () => { log.push("undo:charge"); } },
  ]);
  try { await saga.run(); }
  catch (e) { console.log(`saga: ${(e as SagaFailedError).message}`); }
  console.log(`order: ${log.join(" -> ")}\n`);
}
demo().catch((err) => { console.error("Demo failed:", err instanceof Error ? err.message : err); process.exit(1); });
