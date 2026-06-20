import { NotificationChannel } from "./NotificationChannel";
export class PushChannel implements NotificationChannel {
  readonly kind = "push";
  private readonly sent: { to: string; message: string }[] = [];
  async send(to: string, message: string): Promise<void> {
    this.sent.push({ to, message }); // a real impl calls Firebase FCM (see Week 10/IoT)
  }
  outbox(): readonly { to: string; message: string }[] { return this.sent; }
}
