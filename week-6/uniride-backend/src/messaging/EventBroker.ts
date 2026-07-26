import { Logger } from "../shared/types";
// EVENT-DRIVEN ARCHITECTURE (Week 6). A generic in-process broker: producers publish to a topic and
// any number of subscribers react. One failing subscriber is isolated — it never breaks the others.
export type EventHandler<T = unknown> = (payload: T) => Promise<void> | void;
export class EventBroker {
  private readonly topics = new Map<string, EventHandler[]>();
  constructor(private readonly logger?: Logger) {}
  subscribe<T>(topic: string, handler: EventHandler<T>): void {
    const list = this.topics.get(topic) ?? [];
    list.push(handler as EventHandler);
    this.topics.set(topic, list);
  }
  async publish<T>(topic: string, payload: T): Promise<void> {
    const handlers = this.topics.get(topic) ?? [];
    await Promise.all(handlers.map(async (h) => {
      try { await h(payload); }
      catch (err) { this.logger?.error("event.handler_failed", { topic, error: err instanceof Error ? err.message : String(err) }); }
    }));
  }
  subscriberCount(topic: string): number { return (this.topics.get(topic) ?? []).length; }
}
