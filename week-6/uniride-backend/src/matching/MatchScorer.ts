import { Driver } from "../drivers/Driver";
import { Location } from "../shared/Location";
// STRATEGY (Week 5). Interchangeable driver-ranking algorithms. Higher score = better match.
// The MatchingEngine holds one MatchScorer and never contains an if/else over strategy kinds.
export interface MatchScorer {
  readonly name: string;
  score(driver: Driver, pickup: Location): number;
}
export class NearestScorer implements MatchScorer {
  readonly name = "nearest";
  score(d: Driver, pickup: Location): number { return -d.location.distanceKm(pickup); }
}
export class HighestRatedScorer implements MatchScorer {
  readonly name = "highest-rated";
  score(d: Driver): number { return d.rating; }
}
export class CheapestScorer implements MatchScorer {
  readonly name = "cheapest";
  score(d: Driver): number { return -d.vehicle.rateMultiplier; }
}
export function matchScorer(name: string): MatchScorer {
  switch (name) {
    case "highest-rated": return new HighestRatedScorer();
    case "cheapest": return new CheapestScorer();
    default: return new NearestScorer();
  }
}
