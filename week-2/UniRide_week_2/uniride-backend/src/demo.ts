// The Week-1 "book a ride" scenario, now wired through the same composition root the
// server uses — proof that one set of dependencies serves both a script and the web app.
import { buildContainer } from "./composition/container";
import { Location } from "./shared/Location";

async function demo(): Promise<void> {
  const { requestRide } = buildContainer();
  console.log("\n=== UniRide — book a ride (via container) ===\n");
  const result = await requestRide.execute({
    riderId: "rider_19-12345",
    riderContact: "rider_19-12345",
    pickup: new Location(23.8203, 90.4253, "AIUB Campus"),
    dropoff: new Location(23.7806, 90.4193, "Banani"),
    seats: 2,
  });
  console.log(`\nRide ${result.ride.id} [${result.ride.status}] -> ${result.driver.name} ` +
    `(${result.driver.vehicle.describe()}), fare ${result.fare.toString()}, ref ${result.paymentRef}\n`);
}

demo().catch((err) => {
  console.error("Demo failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
