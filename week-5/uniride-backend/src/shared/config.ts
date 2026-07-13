export interface AppConfig {
  currency: string; baseFare: number; perKm: number; matchRadiusKm: number; region: string; matchStrategy: string;
}
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    currency: env.URIDE_CURRENCY ?? "BDT",
    baseFare: num(env.URIDE_BASE_FARE, 40),
    perKm: num(env.URIDE_PER_KM, 22),
    matchRadiusKm: num(env.URIDE_MATCH_RADIUS_KM, 5),
    region: env.URIDE_REGION ?? "BD",
    matchStrategy: env.URIDE_MATCH_STRATEGY ?? "nearest",
  };
}
function num(value: string | undefined, fallback: number): number {
  const n = Number(value); return Number.isFinite(n) ? n : fallback;
}
