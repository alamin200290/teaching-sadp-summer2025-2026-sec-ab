import { Logger } from "./types";
export class ConsoleLogger implements Logger {
  info(m: string, meta?: Record<string, unknown>): void { this.write("info", m, meta); }
  warn(m: string, meta?: Record<string, unknown>): void { this.write("warn", m, meta); }
  error(m: string, meta?: Record<string, unknown>): void { this.write("error", m, meta); }
  private write(level: string, message: string, meta?: Record<string, unknown>): void {
    console.log(JSON.stringify({ level, message, ...(meta ?? {}), ts: new Date().toISOString() }));
  }
}
