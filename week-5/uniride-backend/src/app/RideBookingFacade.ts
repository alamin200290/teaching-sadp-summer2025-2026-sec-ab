import { Location } from "../shared/Location";
import { RequestRideUseCase, RequestRideOutput } from "./RequestRideUseCase";
import { RideRequestBuilder } from "./RideRequestBuilder";
import { GeocodingPort } from "../geocoding/GeocodingPort";

export interface BookingCommand {
  riderId: string; riderContact?: string;
  pickup: Location | string; dropoff: Location | string; // strings are geocoded
  seats?: number; promoCode?: string;
}
// FACADE (Week 4). One door over the booking subsystem (geocoding + builder + use-case). The
// controller calls book() and stays thin; it never touches the collaborators directly.
export class RideBookingFacade {
  constructor(private readonly requestRide: RequestRideUseCase, private readonly geocoder: GeocodingPort) {}
  async book(command: BookingCommand): Promise<RequestRideOutput> {
    const builder = new RideRequestBuilder()
      .forRider(command.riderId, command.riderContact)
      .from(this.resolve(command.pickup))
      .to(this.resolve(command.dropoff))
      .seats(command.seats ?? 1);
    if (command.promoCode) builder.withPromoCode(command.promoCode);
    return this.requestRide.execute(builder.build());
  }
  private resolve(place: Location | string): Location {
    return typeof place === "string" ? this.geocoder.geocode(place) : place;
  }
}
