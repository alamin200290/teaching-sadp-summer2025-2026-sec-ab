import { Location } from "../shared/Location";
import { GeocodingPort } from "./GeocodingPort";
import { LegacyMapsSdk } from "./LegacyMapsSdk";
// ADAPTER (Week 4). Makes LegacyMapsSdk satisfy GeocodingPort: translates pinpoint() -> geocode()
// and the {x,y} shape -> Location(lat,lng). Callers depend on the port and never see the SDK.
export class LegacyMapsAdapter implements GeocodingPort {
  constructor(private readonly sdk: LegacyMapsSdk) {}
  geocode(label: string): Location {
    const { x, y } = this.sdk.pinpoint(label);
    return new Location(y, x, label); // y is latitude, x is longitude
  }
}
