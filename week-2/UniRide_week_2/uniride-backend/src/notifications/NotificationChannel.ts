// I/O — a lean interface (ISP): one method, send(). New channels (Email, WhatsApp...)
// implement it without changing the dispatcher (OCP).
export interface NotificationChannel {
  readonly kind: string;
  send(to: string, message: string): Promise<void>;
}
