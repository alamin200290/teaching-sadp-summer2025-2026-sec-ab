export class Location {
  constructor(public readonly lat: number, public readonly lng: number, public readonly label?: string) {}
  distanceKm(other: Location): number {
    const R = 6371;
    const dLat = toRad(other.lat - this.lat), dLng = toRad(other.lng - this.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(this.lat)) * Math.cos(toRad(other.lat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
function toRad(deg: number): number { return (deg * Math.PI) / 180; }
