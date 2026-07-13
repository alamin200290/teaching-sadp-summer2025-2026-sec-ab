// Week 5 demo: book via the Facade (Strategy chooses the driver, Observer fires notifications),
// then show Template Method fare settlement and a Command with undo.
import { buildContainer } from "./composition/container";
import { Money } from "./shared/Money";
import { StandardSettlement, PoolSettlement } from "./pricing/FareSettlement";
import { RideService } from "./rides/RideService";
import { InMemoryRideRepository } from "./rides/InMemoryRideRepository";
import { SystemClock } from "./shared/SystemClock";
import { SequentialIdGenerator } from "./shared/SequentialIdGenerator";
import { ConsoleLogger } from "./shared/ConsoleLogger";
import { Location } from "./shared/Location";
import { CommandInvoker } from "./app/commands/Command";
import { CancelRideCommand } from "./app/commands/CancelRideCommand";

async function demo(): Promise<void> {
  const { booking, analytics } = buildContainer();
  console.log("\n=== UniRide Week 5 \u2014 book via Facade (Strategy match + Observer notify) ===\n");
  const r = await booking.book({ riderId: "rider_19-12345", pickup: "AIUB Campus", dropoff: "Banani", seats: 2 });
  console.log(`\nRide ${r.ride.id} [${r.ride.status}] -> ${r.driver.name} (${r.driver.vehicle.describe()}), fare ${r.fare.toString()}`);
  console.log(`Observer analytics: ${JSON.stringify(analytics.stats())}`);

  console.log("\n=== Template Method \u2014 fare settlement (same skeleton, different hook) ===");
  console.log(`Standard: ${new StandardSettlement().settle(r.fare).toString()}`);
  console.log(`Pool:     ${new PoolSettlement().settle(r.fare).toString()}`);

  console.log("\n=== Command \u2014 cancel a ride, then undo ===");
  const rides = new RideService(new InMemoryRideRepository(), new SystemClock(), new SequentialIdGenerator(), new ConsoleLogger());
  const ride = rides.requestRide("rider_x", new Location(0, 0), new Location(0, 1), 1);
  const invoker = new CommandInvoker();
  console.log(`before: ${ride.status}`);
  await invoker.run(new CancelRideCommand(ride, rides));
  console.log(`after execute: ${ride.status}`);
  await invoker.undoLast();
  console.log(`after undo: ${ride.status}\n`);
}
demo().catch((err) => { console.error("Demo failed:", err instanceof Error ? err.message : err); process.exit(1); });
