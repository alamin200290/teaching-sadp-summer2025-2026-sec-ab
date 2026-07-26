import { Logger } from "../shared/types";
// SAGA (Week 6). Runs a sequence of local steps; if any step fails, the already-completed steps are
// compensated in reverse order — consistency across services without a distributed lock.
export interface SagaStep { name: string; action: () => Promise<void>; compensation: () => Promise<void>; }
export class SagaFailedError extends Error {
  constructor(public readonly failedStep: string, public readonly reason: unknown) {
    super(`Saga failed at step '${failedStep}': ${reason instanceof Error ? reason.message : String(reason)}`);
    this.name = "SagaFailedError";
  }
}
export class BookingSaga {
  constructor(private readonly steps: SagaStep[], private readonly logger?: Logger) {}
  async run(): Promise<void> {
    const done: SagaStep[] = [];
    for (const step of this.steps) {
      try { await step.action(); done.push(step); this.logger?.info("saga.step_ok", { step: step.name }); }
      catch (err) {
        this.logger?.warn("saga.step_failed", { step: step.name });
        for (const completed of [...done].reverse()) {
          try { await completed.compensation(); this.logger?.info("saga.compensated", { step: completed.name }); }
          catch { this.logger?.error("saga.compensation_failed", { step: completed.name }); }
        }
        throw new SagaFailedError(step.name, err);
      }
    }
  }
}
