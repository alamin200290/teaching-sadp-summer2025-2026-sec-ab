// A pretend third-party SDK with an interface we do NOT control: different method name,
// different return shape (x = longitude, y = latitude). We cannot change this class.
export interface LegacyLatLng { x: number; y: number; }
export class LegacyMapsSdk {
  pinpoint(query: string): LegacyLatLng {
    const table: Record<string, LegacyLatLng> = {
      "aiub campus": { x: 90.4253, y: 23.8203 },
      "banani": { x: 90.4193, y: 23.7806 },
      "kuratoli": { x: 90.4265, y: 23.8223 },
      "jamuna future park": { x: 90.4288, y: 23.8245 },
    };
    const hit = table[query.trim().toLowerCase()];
    if (!hit) throw new Error(`LegacyMapsSdk: unknown place '${query}'`);
    return hit;
  }
}
