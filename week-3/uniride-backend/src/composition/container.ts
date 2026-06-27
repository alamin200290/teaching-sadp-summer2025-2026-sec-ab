import { Express } from "express";
import { AppConfig, loadConfig } from "../shared/config";
import { Logger } from "../shared/types";
import { ConsoleLogger } from "../shared/ConsoleLogger";
import { SystemClock } from "../shared/SystemClock";
import { SequentialIdGenerator } from "../shared/SequentialIdGenerator";
import { InMemoryRideRepository } from "../rides/InMemoryRideRepository";
import { RideService } from "../rides/RideService";
import { StandardFarePolicy } from "../rides/StandardFarePolicy";
import { DriverRepository } from "../drivers/DriverRepository";
import { InMemoryDriverRepository } from "../drivers/InMemoryDriverRepository";
import { MatchingEngine } from "../matching/MatchingEngine";
import { PaymentService } from "../payments/PaymentService";
import { NotificationDispatcher } from "../notifications/NotificationDispatcher";
import { DefaultNotificationChannelFactory } from "../notifications/NotificationChannelFactory";
import { regionProviderFactory } from "../providers/RegionProviderFactory";
import { RequestRideUseCase } from "../app/RequestRideUseCase";
import { createApp } from "../http/HttpServer";
import { RideController } from "../http/controllers/RideController";
import { DriverController } from "../http/controllers/DriverController";
import { HealthController } from "../http/controllers/HealthController";
import { seedDemoDrivers } from "./seed";

export const VERSION = "0.3.0-week3";

export interface Container {
  app: Express; logger: Logger; config: AppConfig; requestRide: RequestRideUseCase; driverRepo: DriverRepository;
}

export function buildContainer(env: NodeJS.ProcessEnv = process.env): Container {
  const config = loadConfig(env);
  const logger = new ConsoleLogger();
  const clock = new SystemClock();
  const ids = new SequentialIdGenerator();

  // Infrastructure
  const rideRepo = new InMemoryRideRepository();
  const driverRepo = new InMemoryDriverRepository();
  seedDemoDrivers(driverRepo);

  // Week 3 — Abstract Factory: one region factory yields a matching {payment, sms} family.
  const region = regionProviderFactory(config.region);
  logger.info("region.selected", { region: region.region });

  // Week 3 — Factory Method: the dispatcher gets a channel factory, seeded with the region's
  // SMS channel so "sms" notifications use the right regional sender.
  const channelFactory = new DefaultNotificationChannelFactory({ sms: region.createSmsChannel() });

  // Domain + Application
  const rideService = new RideService(rideRepo, clock, ids, logger);
  const matching = new MatchingEngine(driverRepo, config.matchRadiusKm);
  const farePolicy = new StandardFarePolicy(config);
  const payments = new PaymentService(region.createPaymentProvider(), logger);
  const notifications = new NotificationDispatcher(channelFactory, logger);
  const requestRide = new RequestRideUseCase(rideService, matching, farePolicy, payments, notifications, driverRepo, logger);

  // Presentation
  const controllers = {
    ride: new RideController(requestRide),
    driver: new DriverController(driverRepo, config.matchRadiusKm),
    health: new HealthController(VERSION),
  };
  const app = createApp({ logger, controllers });
  return { app, logger, config, requestRide, driverRepo };
}
