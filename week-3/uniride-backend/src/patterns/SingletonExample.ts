// SINGLETON (Week 3) — demonstration ONLY.
// In UniRide application code we deliberately AVOID the Singleton pattern: a global access
// point hides dependencies and hurts testability. Instead the composition root creates ONE
// AppConfig/Logger and INJECTS it (a DI-scoped single instance — same "one instance"
// benefit, none of the global-state cost). See ADR-003. This class is kept apart from the
// app's dependency graph purely to show the classic mechanics for the lecture.
export class BuildInfo {
  private static instance: BuildInfo | null = null;
  readonly startedAt: Date;
  private constructor() { this.startedAt = new Date(); }
  static getInstance(): BuildInfo {
    if (BuildInfo.instance === null) BuildInfo.instance = new BuildInfo();
    return BuildInfo.instance;
  }
}
