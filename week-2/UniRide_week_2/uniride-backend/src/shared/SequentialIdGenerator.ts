import { IdGenerator } from "./types";
// Deterministic ids keep the demo and tests readable. A real deployment would swap in a
// UUID/ULID generator — and nothing else would change (DIP + Liskov substitutability).
export class SequentialIdGenerator implements IdGenerator {
  private readonly counters = new Map<string, number>();
  next(prefix: string): string {
    const n = (this.counters.get(prefix) ?? 0) + 1;
    this.counters.set(prefix, n);
    return `${prefix}_${String(n).padStart(4, "0")}`;
  }
}
