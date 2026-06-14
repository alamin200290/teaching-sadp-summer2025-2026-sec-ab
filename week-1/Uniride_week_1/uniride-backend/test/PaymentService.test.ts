import { test } from "node:test";
import assert from "node:assert/strict";
import { PaymentService } from "../src/payments/PaymentService";
import { BkashGateway } from "../src/payments/BkashGateway";
import { CardGateway } from "../src/payments/CardGateway";
import { Money } from "../src/shared/Money";
import { Logger } from "../src/shared/types";

const noopLogger: Logger = { info() {}, warn() {}, error() {} };

// OCP: the SAME PaymentService works with any provider — we never changed its code.
test("PaymentService works with bKash and Card interchangeably", async () => {
  for (const provider of [new BkashGateway(), new CardGateway()]) {
    const svc = new PaymentService(provider, noopLogger);
    const res = await svc.authorizeFare(Money.of(250), "ride_42");
    assert.equal(res.success, true);
    assert.equal(res.provider, provider.name);
    assert.ok(res.reference.includes("ride_42"));
  }
});
