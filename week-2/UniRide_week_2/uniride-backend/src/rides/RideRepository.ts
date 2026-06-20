import { Ride } from "./Ride";

// I — Interface Segregation. Read and write capabilities are separate interfaces, so a
// client that only needs to read (e.g. a future "ride history" query) does not depend on
// save(). RideRepository simply composes both for stores that do everything.
export interface RideReader {
  findById(id: string): Ride | undefined;
  findByRider(riderId: string): Ride[];
}

export interface RideWriter {
  save(ride: Ride): void;
}

export interface RideRepository extends RideReader, RideWriter {}
