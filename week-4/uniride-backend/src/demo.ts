// Week 4 demo: book via the Facade using TEXT addresses (geocoded by the Adapter), then print
// a fare-breakdown as a Composite tree.
import { buildContainer } from "./composition/container";
import { Money } from "./shared/Money";
import { FareGroup, FareLineItem } from "./pricing/FareBreakdown";

async function demo(): Promise<void> {
  const { booking } = buildContainer();
  console.log("\n=== UniRide Week 4 — book via RideBookingFacade (addresses geocoded by adapter) ===\n");
  const r = await booking.book({ riderId: "rider_19-12345", pickup: "AIUB Campus", dropoff: "Banani", seats: 2, promoCode: "AIUB10" });
  console.log(`\nRide ${r.ride.id} [${r.ride.status}] -> ${r.driver.name} (${r.driver.vehicle.describe()}), ` +
    `fare ${r.fare.toString()}, ref ${r.paymentRef}`);

  console.log("\n=== Composite — fare breakdown tree ===\n");
  const breakdown = new FareGroup("Trip total")
    .add(new FareLineItem("Base fare", Money.of(40)))
    .add(new FareGroup("Distance block")
      .add(new FareLineItem("Distance", Money.of(98)))
      .add(new FareLineItem("Surge x1.2", Money.of(19.6))));
  console.log(breakdown.print());
  console.log("");
}
demo().catch((err) => { console.error("Demo failed:", err instanceof Error ? err.message : err); process.exit(1); });
