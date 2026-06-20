import { Driver } from "./Driver";
import { Location } from "../shared/Location";

// DIP: the matching module depends on THIS interface, not on a database.
// Week 1 ships an in-memory implementation; later weeks add a PostgreSQL one
// with no change to callers.
export interface DriverRepository {
  save(driver: Driver): void;
  findById(id: string): Driver | undefined;
  findAvailableNear(pickup: Location, seatsNeeded: number, radiusKm: number): Driver[];
}
