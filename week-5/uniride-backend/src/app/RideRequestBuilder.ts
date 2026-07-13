import { Location } from "../shared/Location";
import { ValidationError } from "../shared/errors";
import { RequestRideInput } from "./RequestRideUseCase";

// BUILDER (Week 3). Assembles a RequestRideInput step by step with a fluent API, so callers
// configure only the parts they need instead of passing a long positional argument list
// (the "telescoping constructor" problem). build() validates required parts at the end.
export class RideRequestBuilder {
  private _riderId?: string;
  private _contact?: string;
  private _pickup?: Location;
  private _dropoff?: Location;
  private _seats = 1;
  private _promoCode?: string;
  private _scheduledAt?: Date;
  private _notes?: string;

  forRider(riderId: string, contact?: string): this { this._riderId = riderId; this._contact = contact; return this; }
  from(pickup: Location): this { this._pickup = pickup; return this; }
  to(dropoff: Location): this { this._dropoff = dropoff; return this; }
  seats(n: number): this {
    if (!Number.isInteger(n) || n < 1 || n > 6) throw new ValidationError("seats must be an integer between 1 and 6");
    this._seats = n; return this;
  }
  withPromoCode(code: string): this { this._promoCode = code; return this; }
  scheduledAt(when: Date): this { this._scheduledAt = when; return this; }
  withNotes(notes: string): this { this._notes = notes; return this; }

  build(): RequestRideInput {
    if (!this._riderId) throw new ValidationError("riderId is required");
    if (!this._pickup) throw new ValidationError("pickup is required");
    if (!this._dropoff) throw new ValidationError("dropoff is required");
    return {
      riderId: this._riderId,
      riderContact: this._contact ?? this._riderId,
      pickup: this._pickup,
      dropoff: this._dropoff,
      seats: this._seats,
      promoCode: this._promoCode,
      scheduledAt: this._scheduledAt,
      notes: this._notes,
    };
  }
}
