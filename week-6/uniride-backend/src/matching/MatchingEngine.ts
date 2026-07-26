import { Driver } from "../drivers/Driver";
import { DriverRepository } from "../drivers/DriverRepository";
import { Location } from "../shared/Location";
import { MatchScorer } from "./MatchScorer";
// Week 5: the engine ranks candidates with an injected MatchScorer (Strategy) and picks the best.
export class MatchingEngine {
  constructor(private readonly drivers: DriverRepository, private readonly radiusKm: number, private readonly scorer: MatchScorer) {}
  findBestDriver(pickup: Location, seatsNeeded: number): Driver | null {
    const candidates = this.drivers.findAvailableNear(pickup, seatsNeeded, this.radiusKm);
    if (candidates.length === 0) return null;
    return candidates.reduce((best, d) => (this.scorer.score(d, pickup) > this.scorer.score(best, pickup) ? d : best));
  }
}
