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
import { CachingDriverProxy } from "../drivers/CachingDriverProxy";
import { MatchingEngine } from "../matching/MatchingEngine";
import { PaymentService } from "../payments/PaymentService";
import { NotificationDispatcher } from "../notifications/NotificationDispatcher";
import { DefaultNotificationChannelFactory } from "../notifications/NotificationChannelFactory";
import { PushChannel } from "../notifications/PushChannel";
import { LoggingChannel, RetryingChannel } from "../notifications/ChannelDecorators";
import { regionProviderFactory } from "../providers/RegionProviderFactory";
import { LegacyMapsSdk } from "../geocoding/LegacyMapsSdk";
import { LegacyMapsAdapter } from "../geocoding/LegacyMapsAdapter";
import { GeocodingPort } from "../geocoding/GeocodingPort";
import { RequestRideUseCase } from "../app/RequestRideUseCase";
import { RideBookingFacade } from "../app/RideBookingFacade";
import { createApp } from "../http/HttpServer";
import { RideController } from "../http/controllers/RideController";
import { DriverController } from "../http/controllers/DriverController";
import { HealthController } from "../http/controllers/HealthController";
import { seedDemoDrivers } from "./seed";

export const VERSION = "0.4.0-week4";

export interface Container {
  app: Express; logger: Logger; config: AppConfig;
  booking: RideBookingFacade; geocoder: GeocodingPort; driverRepo: DriverRepository;
}

export function buildContainer(env: NodeJS.ProcessEnv = process.env): Container {
  const config = loadConfig(env);
  const logger = new ConsoleLogger();
  const clock = new SystemClock();
  const ids = new SequentialIdGenerator();

  // Infrastructure — Week 4 PROXY wraps the real repo with a cache (same interface).
  const rideRepo = new InMemoryRideRepository();
  const driverRepo: DriverRepository = new CachingDriverProxy(new InMemoryDriverRepository(), logger);
  seedDemoDrivers(driverRepo);

  // Week 4 ADAPTER — a legacy SDK made to satisfy our GeocodingPort.
  const geocoder = new LegacyMapsAdapter(new LegacyMapsSdk());

  // Week 3 Abstract Factory — region-matched {payment, sms} family.
  const region = regionProviderFactory(config.region);
  logger.info("region.selected", { region: region.region });

  // Week 3 Factory Method + Week 4 DECORATOR — push channel wrapped with retry then logging.
  const channelFactory = new DefaultNotificationChannelFactory({
    push: new LoggingChannel(new RetryingChannel(new PushChannel()), logger),
    sms: region.createSmsChannel(),
  });

  // Domain + Application
  const rideService = new RideService(rideRepo, clock, ids, logger);
  const matching = new MatchingEngine(driverRepo, config.matchRadiusKm);
  const farePolicy = new StandardFarePolicy(config);
  const payments = new PaymentService(region.createPaymentProvider(), logger);
  const notifications = new NotificationDispatcher(channelFactory, logger);
  const requestRide = new RequestRideUseCase(rideService, matching, farePolicy, payments, notifications, driverRepo, logger);

  // Week 4 FACADE — one door over geocoding + builder + use-case.
  const booking = new RideBookingFacade(requestRide, geocoder);

  // Presentation
  const controllers = {
    ride: new RideController(booking),
    driver: new DriverController(driverRepo, config.matchRadiusKm),
    health: new HealthController(VERSION),
  };
  const app = createApp({ logger, controllers });
  return { app, logger, config, booking, geocoder, driverRepo };
}
