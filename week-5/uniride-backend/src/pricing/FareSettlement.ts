import { Money } from "../shared/Money";
// TEMPLATE METHOD (Week 5). settle() fixes the order of steps; subclasses override only the hook.
export abstract class FareSettlement {
  settle(baseFare: Money): Money {
    const withFee = this.applyServiceFee(baseFare);
    const adjusted = this.applyRideAdjustment(withFee);
    return this.finalize(adjusted);
  }
  protected applyServiceFee(fare: Money): Money { return fare.multiply(1.05); } // fixed 5% platform fee
  protected abstract applyRideAdjustment(fare: Money): Money;                    // hook — the only variable step
  protected finalize(fare: Money): Money { return fare; }                        // fixed
}
export class StandardSettlement extends FareSettlement {
  protected applyRideAdjustment(fare: Money): Money { return fare; }
}
export class PoolSettlement extends FareSettlement {
  protected applyRideAdjustment(fare: Money): Money { return fare.multiply(0.8); } // 20% pool discount
}
