import { Logger } from "../shared/types";
import { NotificationChannel } from "./NotificationChannel";

// SRP: routing/dispatch ONLY. It selects a channel and sends; it does not know how any
// channel delivers. Channels are registered at construction, so adding one is OCP-clean.
// (A Factory that picks channels by user preference is introduced in Week 3.)
export class NotificationDispatcher {
  private readonly channels = new Map<string, NotificationChannel>();

  constructor(channels: NotificationChannel[], private readonly logger: Logger) {
    for (const c of channels) this.channels.set(c.kind, c);
  }

  async notify(kind: string, to: string, message: string): Promise<void> {
    const channel = this.channels.get(kind);
    if (!channel) throw new Error(`No notification channel registered for "${kind}"`);
    await channel.send(to, message);
    this.logger.info("notification.sent", { kind, to });
  }
}
