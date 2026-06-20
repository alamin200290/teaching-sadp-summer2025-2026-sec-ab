import { Router } from "express";
import { RideController } from "./controllers/RideController";
import { DriverController } from "./controllers/DriverController";
import { HealthController } from "./controllers/HealthController";

export interface Controllers {
  ride: RideController;
  driver: DriverController;
  health: HealthController;
}

export function buildRouter(c: Controllers): Router {
  const r = Router();
  r.get("/health", c.health.get);
  r.post("/rides", c.ride.book);
  r.get("/drivers", c.driver.listNearby);
  return r;
}
