import { ChannelKind, NotificationChannel } from "./NotificationChannel";
import { Logger } from "../shared/types";
// DECORATOR (Week 4). A decorator wraps a NotificationChannel and IS a NotificationChannel,
// so wrappers stack arbitrarily. The wrapped channel's kind is preserved.
export abstract class ChannelDecorator implements NotificationChannel {
  constructor(protected readonly inner: NotificationChannel) {}
  get kind(): ChannelKind { return this.inner.kind; }
  abstract send(to: string, message: string): Promise<void>;
}
// Adds structured logging around send(), then delegates.
export class LoggingChannel extends ChannelDecorator {
  constructor(inner: NotificationChannel, private readonly logger: Logger) { super(inner); }
  async send(to: string, message: string): Promise<void> {
    this.logger.info("channel.send", { kind: this.kind, to });
    await this.inner.send(to, message);
  }
}
// Retries a failing send() up to `attempts` times (transient-failure resilience).
export class RetryingChannel extends ChannelDecorator {
  constructor(inner: NotificationChannel, private readonly attempts = 3) {
    super(inner);
    if (attempts < 1) throw new Error("attempts must be >= 1");
  }
  async send(to: string, message: string): Promise<void> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.attempts; attempt++) {
      try { await this.inner.send(to, message); return; }
      catch (err) { lastError = err; }
    }
    throw lastError;
  }
}
