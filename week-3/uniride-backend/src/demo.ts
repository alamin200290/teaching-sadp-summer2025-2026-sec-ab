// Week 3 demo: build a ride request with the fluent Builder (optional promo + schedule),
// then run it through the same container the server uses.
import { buildContainer } from "./composition/container";
import { Location } from "./shared/Location";
import { RideRequestBuilder } from "./app/RideRequestBuilder";

async function demo(): Promise<void> {
  const { requestRide } = buildContainer();
  const input = new RideRequestBuilder()
    .forRider("rider_19-12345")
    .from(new Location(23.8203, 90.4253, "AIUB Campus"))
    .to(new Location(23.7806, 90.4193, "Banani"))
    .seats(2)
    .withPromoCode("AIUB10")
    .build();

  console.log("\n=== UniRide Week 3 — book a ride (built with RideRequestBuilder) ===\n");
  const r = await requestRide.execute(input);
  console.log(`\nRide ${r.ride.id} [${r.ride.status}] -> ${r.driver.name} (${r.driver.vehicle.describe()}), ` +
    `fare ${r.fare.toString()}, ref ${r.paymentRef}\n`);
}
demo().catch((err) => { console.error("Demo failed:", err instanceof Error ? err.message : err); process.exit(1); });
