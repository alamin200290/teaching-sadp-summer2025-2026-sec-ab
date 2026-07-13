import { test } from "node:test"; import assert from "node:assert/strict";
import { StandardSettlement, PoolSettlement } from "../src/pricing/FareSettlement";
import { Money } from "../src/shared/Money";
test("Standard settlement applies only the fixed 5% service fee", () => {
  assert.equal(new StandardSettlement().settle(Money.of(100)).toString(), "105.00 BDT");
});
test("Pool settlement runs the same skeleton but discounts 20% in the hook", () => {
  // 100 * 1.05 * 0.8 = 84
  assert.equal(new PoolSettlement().settle(Money.of(100)).toString(), "84.00 BDT");
});
