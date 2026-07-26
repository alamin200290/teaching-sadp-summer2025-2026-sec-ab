import { NotificationChannel } from "./NotificationChannel";
// Week 3: a NEW product added without changing the dispatcher or any caller — the factory
// learns about it, nothing else does. That is the Open/Closed payoff of Factory Method.
export class EmailChannel implements NotificationChannel {
  readonly kind = "email" as const;
  private readonly sent: { to: string; message: string }[] = [];
  async send(to: string, message: string): Promise<void> { this.sent.push({ to, message }); }
  outbox(): readonly { to: string; message: string }[] { return this.sent; }
}
