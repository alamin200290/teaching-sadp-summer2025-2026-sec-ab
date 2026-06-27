import { Request, Response, NextFunction } from "express";
import { RequestRideUseCase } from "../../app/RequestRideUseCase";
import { parseBookRide, rideResponse } from "../dto/RideDtos";
export class RideController {
  constructor(private readonly requestRide: RequestRideUseCase) {}
  book = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.requestRide.execute(parseBookRide(req.body ?? {}));
      res.status(201).json(rideResponse(result.ride, result.driver, result.fare, result.paymentRef));
    } catch (err) { next(err); }
  };
}
