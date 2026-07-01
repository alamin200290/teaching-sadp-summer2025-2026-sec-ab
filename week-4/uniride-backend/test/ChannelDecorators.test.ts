import { test } from "node:test"; import assert from "node:assert/strict";
import { LoggingChannel, RetryingChannel } from "../src/notifications/ChannelDecorators";
import { PushChannel } from "../src/notifications/PushChannel";
import { NotificationChannel } from "../src/notifications/NotificationChannel";
import { Logger } from "../src/shared/types";
const noop: Logger = { info() {}, warn() {}, error() {} };
test("Decorators preserve the channel interface and deliver to the core", async () => {
  const core = new PushChannel();
  const wrapped = new LoggingChannel(new RetryingChannel(core), noop);
  assert.equal(wrapped.kind, "push");
  await wrapped.send("rider_1", "hi");
  assert.equal(core.outbox().length, 1);
});
test("RetryingChannel retries a flaky inner until it succeeds", async () => {
  let calls = 0;
  const flaky: NotificationChannel = { kind: "push", async send() { calls++; if (calls < 3) throw new Error("transient"); } };
  await new RetryingChannel(flaky, 3).send("to", "msg");
  assert.equal(calls, 3);
});
test("RetryingChannel rethrows after exhausting attempts", async () => {
  const dead: NotificationChannel = { kind: "sms", async send() { throw new Error("down"); } };
  await assert.rejects(new RetryingChannel(dead, 2).send("to", "msg"), /down/);
});
