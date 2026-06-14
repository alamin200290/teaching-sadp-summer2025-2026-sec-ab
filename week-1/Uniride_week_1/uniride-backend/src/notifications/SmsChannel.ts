import { NotificationChannel } from "./NotificationChannel";
export class SmsChannel implements NotificationChannel {
  readonly kind = "sms";
  private readonly sent: { to: string; message: string }[] = [];
  async send(to: string, message: string): Promise<void> {
    this.sent.push({ to, message }); // a real impl calls Twilio
  }
  outbox(): readonly { to: string; message: string }[] { return this.sent; }
}
