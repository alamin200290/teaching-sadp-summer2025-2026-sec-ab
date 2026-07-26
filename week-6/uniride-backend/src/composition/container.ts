import { Express } from "express";
import { AppConfig, loadConfig } from "../shared/config";
import { Logger } from "../shared/types";
import { ConsoleLogger } from "../shared/ConsoleLogger";
import { SystemClock } from "../shared/SystemClock";
import { SequentialIdGenerator } from "../shared/SequentialIdGenerator";
import { InMemoryRideRepository } from "../rides/InMemoryRideRepository";
import { RideService } from "../rides/RideService";
import { StandardFarePolicy } from "../rides/StandardFarePolicy";
import { RideStatusPublisher } from "../rides/RideEvents";
import { EventBroker } from "../messaging/EventBroker";
import { CircuitBreaker } from "../resilience/CircuitBreaker";
import { ResilientPaymentGateway } from "../payments/ResilientPaymentGateway";
import { NotifyingObserver } from "../rides/observers/NotifyingObserver";
import { AnalyticsObserver } from "../rides/observers/AnalyticsObserver";
import { DriverRepository } from "../drivers/DriverRepository";
import { InMemoryDriverRepository } from "../drivers/InMemoryDriverRepository";
import { CachingDriverProxy } from "../drivers/CachingDriverProxy";
import { MatchingEngine } from "../matching/MatchingEngine";
import { matchScorer } from "../matching/MatchScorer";
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

export const VERSION = "0.6.0-week6";

export interface Container {
  app: Express; logger: Logger; config: AppConfig;
  booking: RideBookingFacade; geocoder: GeocodingPort; driverRepo: DriverRepository; analytics: AnalyticsObserver; broker: EventBroker;
}

export function buildContainer(env: NodeJS.ProcessEnv = process.env): Container {
  const config = loadConfig(env);
  const logger = new ConsoleLogger();
  const clock = new SystemClock();
  const ids = new SequentialIdGenerator();

  const rideRepo = new InMemoryRideRepository();
  const driverRepo: DriverRepository = new CachingDriverProxy(new InMemoryDriverRepository(), logger); // W4 Proxy
  seedDemoDrivers(driverRepo);

  const geocoder = new LegacyMapsAdapter(new LegacyMapsSdk()); // W4 Adapter

  const region = regionProviderFactory(config.region); // W3 Abstract Factory
  logger.info("region.selected", { region: region.region });

  // W3 Factory Method + W4 Decorator: push wrapped with retry then logging.
  const channelFactory = new DefaultNotificationChannelFactory({
    push: new LoggingChannel(new RetryingChannel(new PushChannel()), logger),
    sms: region.createSmsChannel(),
  });
  const notifications = new NotificationDispatcher(channelFactory, logger);

  // W5 Strategy: pick the matching scorer from config.
  const scorer = matchScorer(config.matchStrategy);
  logger.info("match.strategy", { strategy: scorer.name });

  // W6 Event-Driven: a shared broker backs ride events (W5 Observer, now real pub/sub).
  const broker = new EventBroker(logger);
  const events = new RideStatusPublisher(broker);
  events.subscribe(new NotifyingObserver(notifications));
  const analytics = new AnalyticsObserver();
  events.subscribe(analytics);

  const rideService = new RideService(rideRepo, clock, ids, logger);
  const matching = new MatchingEngine(driverRepo, config.matchRadiusKm, scorer);
  const farePolicy = new StandardFarePolicy(config);
  // W6 Circuit Breaker + retry wrap the payment gateway (Decorator preserves the interface).
  const paymentBreaker = new CircuitBreaker({ failureThreshold: config.paymentFailureThreshold, cooldownMs: config.paymentCooldownMs });
  const payments = new PaymentService(new ResilientPaymentGateway(region.createPaymentProvider(), paymentBreaker), logger);
  const requestRide = new RequestRideUseCase(rideService, matching, farePolicy, payments, events, driverRepo, logger);
  const booking = new RideBookingFacade(requestRide, geocoder); // W4 Facade

  const controllers = {
    ride: new RideController(booking),
    driver: new DriverController(driverRepo, config.matchRadiusKm),
    health: new HealthController(VERSION),
  };
  const app = createApp({ logger, controllers });
  return { app, logger, config, booking, geocoder, driverRepo, analytics, broker };
}
