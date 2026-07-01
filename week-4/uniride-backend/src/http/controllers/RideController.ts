import { Request, Response, NextFunction } from "express";
import { RideBookingFacade } from "../../app/RideBookingFacade";
import { parseBookRide, rideResponse } from "../dto/RideDtos";
// Thin controller: parse -> delegate to the facade -> serialise. No orchestration here.
export class RideController {
  constructor(private readonly booking: RideBookingFacade) {}
  book = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = parseBookRide(req.body ?? {});
      const result = await this.booking.book({
        riderId: input.riderId, riderContact: input.riderContact,
        pickup: input.pickup, dropoff: input.dropoff, seats: input.seats, promoCode: input.promoCode,
      });
      res.status(201).json(rideResponse(result.ride, result.driver, result.fare, result.paymentRef));
    } catch (err) { next(err); }
  };
}
