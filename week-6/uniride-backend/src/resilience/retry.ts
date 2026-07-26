// Retry with exponential backoff (Week 6). `sleep` is injectable so tests stay fast and deterministic.
export interface RetryOptions { attempts: number; baseDelayMs?: number; sleep?: (ms: number) => Promise<void>; }
export async function retry<T>(action: () => Promise<T>, opts: RetryOptions): Promise<T> {
  const sleep = opts.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  let lastErr: unknown;
  for (let attempt = 1; attempt <= opts.attempts; attempt++) {
    try { return await action(); }
    catch (err) { lastErr = err; if (attempt < opts.attempts) await sleep((opts.baseDelayMs ?? 10) * 2 ** (attempt - 1)); }
  }
  throw lastErr;
}
