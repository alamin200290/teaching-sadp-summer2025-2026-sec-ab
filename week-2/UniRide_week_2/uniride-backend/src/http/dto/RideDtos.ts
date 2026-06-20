import { RequestRideInput } from "../../app/RequestRideUseCase";
import { Location } from "../../shared/Location";
import { Ride } from "../../rides/Ride";
import { Driver } from "../../drivers/Driver";
import { Money } from "../../shared/Money";
import { ValidationError } from "../../shared/errors";

export interface LatLngDto { lat: number; lng: number; label?: string }
export interface BookRideBody {
  riderId?: unknown; riderContact?: unknown; pickup?: unknown; dropoff?: unknown; seats?: unknown;
}

// Parse + validate an untrusted HTTP body into a typed application input.
// Validation belongs at the edge (presentation), so the domain only ever sees valid data.
export function parseBookRide(body: BookRideBody): RequestRideInput {
  const riderId = requireString(body.riderId, "riderId");
  const riderContact =
    typeof body.riderContact === "string" && body.riderContact.trim() ? body.riderContact : riderId;
  const pickup = parseLatLng(body.pickup, "pickup");
  const dropoff = parseLatLng(body.dropoff, "dropoff");
  const seats = body.seats ?? 1;
  if (typeof seats !== "number" || !Number.isInteger(seats) || seats < 1 || seats > 6) {
    throw new ValidationError("seats must be an integer between 1 and 6");
  }
  return { riderId, riderContact, pickup, dropoff, seats };
}

function parseLatLng(value: unknown, field: string): Location {
  if (typeof value !== "object" || value === null) throw new ValidationError(`${field} is required`);
  const v = value as Record<string, unknown>;
  const lat = v.lat, lng = v.lng;
  if (typeof lat !== "number" || lat < -90 || lat > 90) throw new ValidationError(`${field}.lat must be a valid latitude`);
  if (typeof lng !== "number" || lng < -180 || lng > 180) throw new ValidationError(`${field}.lng must be a valid longitude`);
  return new Location(lat, lng, typeof v.label === "string" ? v.label : undefined);
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new ValidationError(`${field} is required`);
  return value;
}

// "View": serialise domain objects into the response shape. The domain never knows about JSON.
export function rideResponse(ride: Ride, driver: Driver, fare: Money, paymentRef: string) {
  return {
    rideId: ride.id,
    status: ride.status,
    driver: { id: driver.id, name: driver.name, vehicle: driver.vehicle.describe() },
    distanceKm: Number(ride.pickup.distanceKm(ride.dropoff).toFixed(2)),
    fare: { amount: fare.amount, currency: fare.currency },
    paymentRef,
  };
}

export function driverResponse(driver: Driver) {
  return {
    id: driver.id,
    name: driver.name,
    vehicle: driver.vehicle.describe(),
    seats: driver.vehicle.seats,
    location: { lat: driver.location.lat, lng: driver.location.lng, label: driver.location.label },
  };
}
