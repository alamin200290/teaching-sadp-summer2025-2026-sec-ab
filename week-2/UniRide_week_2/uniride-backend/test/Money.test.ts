import { test } from "node:test";
import assert from "node:assert/strict";
import { Money } from "../src/shared/Money";

test("Money rounds to 2 decimals and rejects negatives", () => {
  assert.equal(Money.of(40.005).amount, 40.01);
  assert.throws(() => Money.of(-1), /non-negative/);
});

test("Money.multiply and add keep currency", () => {
  assert.equal(Money.of(100).multiply(1.5).toString(), "150.00 BDT");
  assert.throws(() => Money.of(10, "BDT").add(Money.of(5, "USD")), /Currency mismatch/);
});
