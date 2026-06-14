import { Logger } from "./types";

// Structured (JSON) logging — the foundation Week 9 builds on for observability.
export class ConsoleLogger implements Logger {
  info(message: string, meta?: Record<string, unknown>): void { this.write("info", message, meta); }
  warn(message: string, meta?: Record<string, unknown>): void { this.write("warn", message, meta); }
  error(message: string, meta?: Record<string, unknown>): void { this.write("error", message, meta); }

  private write(level: string, message: string, meta?: Record<string, unknown>): void {
    console.log(JSON.stringify({ level, message, ...(meta ?? {}), ts: new Date().toISOString() }));
  }
}
