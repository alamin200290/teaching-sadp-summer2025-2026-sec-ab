// Configuration is read once, from the environment, with safe defaults.
// Externalised config supports portability/operability and keeps pricing out of code.
export interface AppConfig {
  currency: string;
  baseFare: number;
  perKm: number;
  matchRadiusKm: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    currency: env.URIDE_CURRENCY ?? "BDT",
    baseFare: num(env.URIDE_BASE_FARE, 40),
    perKm: num(env.URIDE_PER_KM, 22),
    matchRadiusKm: num(env.URIDE_MATCH_RADIUS_KM, 5),
  };
}

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
