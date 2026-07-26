import { Location } from "../shared/Location";
// The interface OUR code wants. Application/domain depend only on this.
export interface GeocodingPort { geocode(label: string): Location; }
