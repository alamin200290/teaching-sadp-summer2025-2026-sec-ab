import { Request, Response, NextFunction } from "express";
import { RequestRideUseCase } from "../../app/RequestRideUseCase";
import { parseBookRide, rideResponse } from "../dto/RideDtos";

// PRESENTATION layer (the "C" in MVC). A controller does exactly three things:
//   1. parse/validate the HTTP request,
//   2. delegate to the application use-case (the "Model"),
//   3. serialise the result (the "View").
// No business logic lives here. That is the thin-controller rule — the opposite of the
// "Fat Controller" anti-pattern from the lecture.
export class RideController {
  constructor(private readonly requestRide: RequestRideUseCase) {}

  book = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = parseBookRide(req.body ?? {});
      const result = await this.requestRide.execute(input);
      res.status(201).json(rideResponse(result.ride, result.driver, result.fare, result.paymentRef));
    } catch (err) {
      next(err); // hand off to the centralised error middleware
    }
  };
}
