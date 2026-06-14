// Cross-cutting abstractions. Depending on THESE (not concrete classes) is what the
// Dependency Inversion Principle (DIP) asks for — see RideService, PaymentService, etc.

export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

/** Injecting a Clock instead of calling `new Date()` directly makes time-dependent
 *  logic deterministically testable (a maintainability / testability quality attribute). */
export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  next(prefix: string): string;
}
