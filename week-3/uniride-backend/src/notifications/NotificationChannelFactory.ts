import { ValidationError } from "../shared/errors";
import { ChannelKind, NotificationChannel } from "./NotificationChannel";
import { PushChannel } from "./PushChannel";
import { SmsChannel } from "./SmsChannel";
import { EmailChannel } from "./EmailChannel";

// FACTORY METHOD (Week 3). Callers ask the factory for a channel BY KIND and never write
// `new PushChannel()` themselves. Adding a channel = extending this factory; the dispatcher
// and use-cases stay untouched (Open/Closed).
export interface NotificationChannelFactory {
  create(kind: ChannelKind): NotificationChannel;
}

// Caches one instance per kind (so a channel's outbox persists across notifications) and
// lets the composition root inject a specific instance per kind — e.g. a region-specific
// SMS channel supplied by the Abstract Factory.
export class DefaultNotificationChannelFactory implements NotificationChannelFactory {
  private readonly cache = new Map<ChannelKind, NotificationChannel>();
  constructor(private readonly overrides: Partial<Record<ChannelKind, NotificationChannel>> = {}) {}

  create(kind: ChannelKind): NotificationChannel {
    const cached = this.cache.get(kind);
    if (cached) return cached;
    const channel = this.overrides[kind] ?? this.build(kind);
    this.cache.set(kind, channel);
    return channel;
  }

  private build(kind: ChannelKind): NotificationChannel {
    switch (kind) {
      case "push": return new PushChannel();
      case "sms": return new SmsChannel();
      case "email": return new EmailChannel();
      default: throw new ValidationError(`Unknown notification channel: ${String(kind)}`);
    }
  }
}
