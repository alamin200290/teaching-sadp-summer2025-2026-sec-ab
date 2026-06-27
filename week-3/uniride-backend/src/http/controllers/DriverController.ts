import { Request, Response, NextFunction } from "express";
import { DriverRepository } from "../../drivers/DriverRepository";
import { Location } from "../../shared/Location";
import { ValidationError } from "../../shared/errors";
import { driverResponse } from "../dto/RideDtos";
export class DriverController {
  constructor(private readonly drivers: DriverRepository, private readonly defaultRadiusKm: number) {}
  listNearby = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const lat = num(req.query.lat, "lat"), lng = num(req.query.lng, "lng");
      const seats = req.query.seats !== undefined ? num(req.query.seats, "seats") : 1;
      const radiusKm = req.query.radiusKm !== undefined ? num(req.query.radiusKm, "radiusKm") : this.defaultRadiusKm;
      const found = this.drivers.findAvailableNear(new Location(lat, lng), seats, radiusKm);
      res.json({ count: found.length, drivers: found.map(driverResponse) });
    } catch (err) { next(err); }
  };
}
function num(value: unknown, field: string): number {
  const n = Number(value); if (!Number.isFinite(n)) throw new ValidationError(`${field} must be a number`); return n;
}
