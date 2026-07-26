import { NotificationChannel } from "./NotificationChannel";
export class PushChannel implements NotificationChannel {
  readonly kind = "push" as const;
  private readonly sent: { to: string; message: string }[] = [];
  async send(to: string, message: string): Promise<void> { this.sent.push({ to, message }); }
  outbox(): readonly { to: string; message: string }[] { return this.sent; }
}
