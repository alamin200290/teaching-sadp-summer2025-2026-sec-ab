import { Money } from "../shared/Money";
import { Logger } from "../shared/types";
import { PaymentProvider, PaymentResult } from "./PaymentProvider";
export class PaymentService {
  constructor(private readonly provider: PaymentProvider, private readonly logger: Logger) {}
  async authorizeFare(amount: Money, rideId: string): Promise<PaymentResult> {
    const result = await this.provider.charge(amount, rideId);
    this.logger.info("payment.charged", { rideId, provider: this.provider.name, success: result.success, reference: result.reference });
    return result;
  }
}
