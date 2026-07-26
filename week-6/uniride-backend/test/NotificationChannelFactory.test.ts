import { test } from "node:test"; import assert from "node:assert/strict";
import { DefaultNotificationChannelFactory } from "../src/notifications/NotificationChannelFactory";
import { PushChannel } from "../src/notifications/PushChannel";
import { EmailChannel } from "../src/notifications/EmailChannel";
test("Factory Method: create() returns the right channel per kind", () => {
  const f = new DefaultNotificationChannelFactory();
  assert.equal(f.create("push").kind, "push");
  assert.equal(f.create("sms").kind, "sms");
  assert.equal(f.create("email").kind, "email");
  assert.ok(f.create("email") instanceof EmailChannel);
});
test("Factory caches one instance per kind", () => {
  const f = new DefaultNotificationChannelFactory();
  assert.equal(f.create("push"), f.create("push"));
});
test("Factory honours an injected override (used for region SMS)", () => {
  const custom = new PushChannel();
  const f = new DefaultNotificationChannelFactory({ push: custom });
  assert.equal(f.create("push"), custom);
});
