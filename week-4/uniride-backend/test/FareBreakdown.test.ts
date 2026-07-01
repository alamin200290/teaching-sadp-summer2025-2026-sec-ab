import { test } from "node:test"; import assert from "node:assert/strict";
import { FareGroup, FareLineItem } from "../src/pricing/FareBreakdown";
import { Money } from "../src/shared/Money";
test("Composite totals leaves and nested groups uniformly via amount()", () => {
  const tree = new FareGroup("Trip total")
    .add(new FareLineItem("Base fare", Money.of(40)))
    .add(new FareGroup("Distance block")
      .add(new FareLineItem("Distance", Money.of(98)))
      .add(new FareLineItem("Surge", Money.of(19.6))));
  assert.equal(tree.amount().amount, 157.6);
  assert.equal(tree.items().length, 2);
});
