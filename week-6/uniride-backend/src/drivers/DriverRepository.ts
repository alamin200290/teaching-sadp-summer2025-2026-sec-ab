import { Driver } from "./Driver";
import { Location } from "../shared/Location";
export interface DriverRepository {
  save(driver: Driver): void;
  findById(id: string): Driver | undefined;
  findAvailableNear(pickup: Location, seatsNeeded: number, radiusKm: number): Driver[];
}
