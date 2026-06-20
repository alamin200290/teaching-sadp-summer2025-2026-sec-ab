// L — Liskov Substitution Principle.
// Every concrete Vehicle is fully substitutable wherever a Vehicle is expected.
// None overrides a method to throw "not implemented": if a type cannot honour the
// contract, it must not extend it. (Slide: "can I pass a Car, Motorbike, or Rickshaw
// without anything breaking?")
export abstract class Vehicle {
  abstract readonly kind: string;
  abstract readonly seats: number;          // passenger capacity
  abstract readonly rateMultiplier: number; // fare multiplier relative to the base per-km rate

  describe(): string {
    return `${this.kind} (${this.seats} seat${this.seats === 1 ? "" : "s"})`;
  }
}

export class Car extends Vehicle {
  readonly kind = "Car";
  readonly seats = 4;
  readonly rateMultiplier = 1.0;
}

export class Motorbike extends Vehicle {
  readonly kind = "Motorbike";
  readonly seats = 1;
  readonly rateMultiplier = 0.6;
}

export class Rickshaw extends Vehicle {
  readonly kind = "CNG Rickshaw";
  readonly seats = 3;
  readonly rateMultiplier = 0.8;
}
