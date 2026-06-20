// COMPOSITION ROOT — "wired once at application startup" (the Week 2 container.ts slide).
// This is the ONLY place that names concrete classes. Each layer receives interfaces, not
// implementations, so swapping InMemory* for Postgres/Redis here (Week 6) changes nothing
// in the application or presentation layers. Dependencies are built bottom-up:
// Infrastructure -> Domain/Application -> Presentation.
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

import { BkashGateway } from "../payments/BkashGateway";
import { PaymentService } from "../payments/PaymentService";

import { PushChannel } from "../notifications/PushChannel";
import { SmsChannel } from "../notifications/SmsChannel";
import { NotificationDispatcher } from "../notifications/NotificationDispatcher";

import { RequestRideUseCase } from "../app/RequestRideUseCase";

import { createApp } from "../http/HttpServer";
import { RideController } from "../http/controllers/RideController";
import { DriverController } from "../http/controllers/DriverController";
import { HealthController } from "../http/controllers/HealthController";

import { seedDemoDrivers } from "./seed";

export const VERSION = "0.2.0-week2";

export interface Container {
  app: Express;
  logger: Logger;
  config: AppConfig;
  requestRide: RequestRideUseCase;
  driverRepo: DriverRepository;
}

export function buildContainer(env: NodeJS.ProcessEnv = process.env): Container {
  const config = loadConfig(env);
  const logger = new ConsoleLogger();
  const clock = new SystemClock();
  const ids = new SequentialIdGenerator();

  // --- Infrastructure (Data Access) ---
  const rideRepo = new InMemoryRideRepository();
  const driverRepo = new InMemoryDriverRepository();
  seedDemoDrivers(driverRepo);

  // --- Domain + Application (receive interfaces, not concrete classes) ---
  const rideService = new RideService(rideRepo, clock, ids, logger);
  const matching = new MatchingEngine(driverRepo, config.matchRadiusKm);
  const farePolicy = new StandardFarePolicy(config);
  const payments = new PaymentService(new BkashGateway(), logger);
  const notifications = new NotificationDispatcher([new PushChannel(), new SmsChannel()], logger);
  const requestRide = new RequestRideUseCase(
    rideService, matching, farePolicy, payments, notifications, driverRepo, logger,
  );

  // --- Presentation ---
  const controllers = {
    ride: new RideController(requestRide),
    driver: new DriverController(driverRepo, config.matchRadiusKm),
    health: new HealthController(VERSION),
  };
  const app = createApp({ logger, controllers });

  return { app, logger, config, requestRide, driverRepo };
}
