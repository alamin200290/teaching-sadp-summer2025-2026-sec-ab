import { Driver } from "./Driver";
import { DriverRepository } from "./DriverRepository";
import { Location } from "../shared/Location";
import { Logger } from "../shared/types";
// PROXY (Week 4). Same interface as the real DriverRepository, so callers (MatchingEngine,
// DriverController) cannot tell the difference. It caches findAvailableNear results keyed by a
// rounded query; any save() invalidates the cache so availability never goes stale.
export class CachingDriverProxy implements DriverRepository {
  private readonly cache = new Map<string, Driver[]>();
  private hits = 0;
  private misses = 0;
  constructor(private readonly real: DriverRepository, private readonly logger?: Logger) {}
  save(driver: Driver): void { this.real.save(driver); this.cache.clear(); }
  findById(id: string): Driver | undefined { return this.real.findById(id); }
  findAvailableNear(pickup: Location, seatsNeeded: number, radiusKm: number): Driver[] {
    const key = `${pickup.lat.toFixed(3)},${pickup.lng.toFixed(3)}|${seatsNeeded}|${radiusKm}`;
    const cached = this.cache.get(key);
    if (cached) { this.hits++; this.logger?.info("driver_cache.hit", { key }); return cached; }
    this.misses++;
    const result = this.real.findAvailableNear(pickup, seatsNeeded, radiusKm);
    this.cache.set(key, result);
    this.logger?.info("driver_cache.miss", { key });
    return result;
  }
  stats(): { hits: number; misses: number } { return { hits: this.hits, misses: this.misses }; }
}
