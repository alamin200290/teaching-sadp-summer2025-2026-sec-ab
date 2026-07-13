import { test } from "node:test"; import assert from "node:assert/strict";
import { regionProviderFactory } from "../src/providers/RegionProviderFactory";
test("Abstract Factory: Bangladesh family pairs bKash + BD sms", () => {
  const f = regionProviderFactory("BD");
  assert.equal(f.createPaymentProvider().name, "bKash");
  assert.equal(f.createSmsChannel().kind, "sms");
});
test("Abstract Factory: International family pairs Card + intl sms", () => {
  const f = regionProviderFactory("INTL");
  assert.equal(f.region, "International");
  assert.equal(f.createPaymentProvider().name, "Card");
});
