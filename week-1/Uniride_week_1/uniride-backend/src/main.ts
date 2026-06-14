// COMPOSITION ROOT. This is the only place that knows about concrete classes; it wires
// the abstractions together (manual dependency injection) and runs one real scenario.
// Swap any implementation here — InMemory -> Postgres, bKash -> Card — without touching
// the services above. That is the payoff of DIP.
import { loadConfig } from "./shared/config";
import { ConsoleLogger } from "./shared/ConsoleLogger";
import { SystemClock } from "./shared/SystemClock";
import { SequentialIdGenerator } from "./shared/SequentialIdGenerator";
import { Location } from "./shared/Location";

import { InMemoryRideRepository } from "./rides/InMemoryRideRepository";
import { RideService } from "./rides/RideService";
import { StandardFarePolicy } from "./rides/StandardFarePolicy";

import { InMemoryDriverRepository } from "./drivers/InMemoryDriverRepository";
import { Driver } from "./drivers/Driver";
import { Car, Motorbike, Rickshaw } from "./drivers/Vehicle";
import { MatchingEngine } from "./matching/MatchingEngine";

import { BkashGateway } from "./payments/BkashGateway";
import { PaymentService } from "./payments/PaymentService";

import { PushChannel } from "./notifications/PushChannel";
import { SmsChannel } from "./notifications/SmsChannel";
import { NotificationDispatcher } from "./notifications/NotificationDispatcher";

import { RequestRideUseCase } from "./app/RequestRideUseCase";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = new ConsoleLogger();
  const clock = new SystemClock();
  const ids = new SequentialIdGenerator();

  // Repositories (in-memory for Week 1; PostgreSQL/Redis arrive in later weeks).
  const rideRepo = new InMemoryRideRepository();
  const driverRepo = new InMemoryDriverRepository();

  // Seed a few AIUB-campus drivers around Kuratoli/Bashundhara.
  driverRepo.save(new Driver("drv_01", "Rahim", new Car(), new Location(23.8223, 90.4265, "Kuratoli")));
  driverRepo.save(new Driver("drv_02", "Karim", new Motorbike(), new Location(23.8198, 90.4242, "AIUB Gate")));
  driverRepo.save(new Driver("drv_03", "Shila", new Rickshaw(), new Location(23.8245, 90.4288, "Jamuna FC")));

  // Services (each single-responsibility, each depending only on abstractions).
  const rideService = new RideService(rideRepo, clock, ids, logger);
  const matching = new MatchingEngine(driverRepo, config.matchRadiusKm);
  const farePolicy = new StandardFarePolicy(config);
  const payments = new PaymentService(new BkashGateway(), logger);
  const notifications = new NotificationDispatcher([new PushChannel(), new SmsChannel()], logger);

  const requestRide = new RequestRideUseCase(
    rideService, matching, farePolicy, payments, notifications, driverRepo, logger,
  );

  console.log("\n=== UniRide — Week 1 demo: book a ride ===\n");
  const result = await requestRide.execute({
    riderId: "rider_19-12345",
    riderContact: "rider_19-12345",
    pickup: new Location(23.8203, 90.4253, "AIUB Campus"),
    dropoff: new Location(23.7806, 90.4193, "Banani"),
    seats: 2,
  });

  console.log("\n--- Result ---");
  console.log(`Ride        : ${result.ride.id}  [${result.ride.status}]`);
  console.log(`Driver      : ${result.driver.name}  (${result.driver.vehicle.describe()})`);
  console.log(`Distance    : ${result.ride.pickup.distanceKm(result.ride.dropoff).toFixed(2)} km`);
  console.log(`Fare        : ${result.fare.toString()}`);
  console.log(`Payment ref : ${result.paymentRef}`);
  console.log("\nDone.\n");
}

main().catch((err) => {
  console.error("Demo failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
