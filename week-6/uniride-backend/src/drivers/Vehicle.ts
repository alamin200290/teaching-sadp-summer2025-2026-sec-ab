export abstract class Vehicle {
  abstract readonly kind: string;
  abstract readonly seats: number;
  abstract readonly rateMultiplier: number;
  describe(): string { return `${this.kind} (${this.seats} seat${this.seats === 1 ? "" : "s"})`; }
}
export class Car extends Vehicle { readonly kind = "Car"; readonly seats = 4; readonly rateMultiplier = 1.0; }
export class Motorbike extends Vehicle { readonly kind = "Motorbike"; readonly seats = 1; readonly rateMultiplier = 0.6; }
export class Rickshaw extends Vehicle { readonly kind = "CNG Rickshaw"; readonly seats = 3; readonly rateMultiplier = 0.8; }
