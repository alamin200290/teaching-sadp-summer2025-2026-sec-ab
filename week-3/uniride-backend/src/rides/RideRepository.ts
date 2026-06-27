import { Ride } from "./Ride";
export interface RideReader { findById(id: string): Ride | undefined; findByRider(riderId: string): Ride[]; }
export interface RideWriter { save(ride: Ride): void; }
export interface RideRepository extends RideReader, RideWriter {}
