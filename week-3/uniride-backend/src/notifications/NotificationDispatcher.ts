import { Logger } from "../shared/types";
import { ChannelKind } from "./NotificationChannel";
import { NotificationChannelFactory } from "./NotificationChannelFactory";

// SRP: routing/dispatch only. Week 3 change: instead of being handed a hard-coded list of
// channels, the dispatcher asks a FACTORY for the channel it needs. It no longer knows how
// any channel is constructed.
export class NotificationDispatcher {
  constructor(private readonly factory: NotificationChannelFactory, private readonly logger: Logger) {}
  async notify(kind: ChannelKind, to: string, message: string): Promise<void> {
    const channel = this.factory.create(kind);
    await channel.send(to, message);
    this.logger.info("notification.sent", { kind, to });
  }
}
