import { NotificationChannel } from "./NotificationChannel";
export class SmsChannel implements NotificationChannel {
  readonly kind = "sms" as const;
  private readonly sent: { to: string; message: string }[] = [];
  constructor(public readonly region: string = "BD") {}
  async send(to: string, message: string): Promise<void> { this.sent.push({ to, message }); }
  outbox(): readonly { to: string; message: string }[] { return this.sent; }
}
