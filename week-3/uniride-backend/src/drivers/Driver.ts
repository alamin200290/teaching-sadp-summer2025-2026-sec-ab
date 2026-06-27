import { Location } from "../shared/Location";
import { Vehicle } from "./Vehicle";
export type DriverStatus = "available" | "on_trip" | "offline";
export class Driver {
  constructor(public readonly id: string, public readonly name: string, public readonly vehicle: Vehicle,
    public location: Location, public status: DriverStatus = "available") {}
}
