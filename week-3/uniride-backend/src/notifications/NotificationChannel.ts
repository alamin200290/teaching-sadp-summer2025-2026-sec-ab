export type ChannelKind = "push" | "sms" | "email";
export interface NotificationChannel {
  readonly kind: ChannelKind;
  send(to: string, message: string): Promise<void>;
}
