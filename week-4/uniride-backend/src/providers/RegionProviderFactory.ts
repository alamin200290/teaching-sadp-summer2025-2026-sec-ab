import { PaymentProvider } from "../payments/PaymentProvider";
import { BkashGateway } from "../payments/BkashGateway";
import { CardGateway } from "../payments/CardGateway";
import { NotificationChannel } from "../notifications/NotificationChannel";
import { SmsChannel } from "../notifications/SmsChannel";

// ABSTRACT FACTORY (Week 3). A factory that creates a whole FAMILY of region-matched
// providers — payment + SMS — that belong together. Switching the one factory swaps the
// entire family at once, and you can never accidentally pair bKash with an intl SMS sender.
export interface RegionProviderFactory {
  readonly region: string;
  createPaymentProvider(): PaymentProvider;
  createSmsChannel(): NotificationChannel;
}

export class BangladeshProviderFactory implements RegionProviderFactory {
  readonly region = "Bangladesh";
  createPaymentProvider(): PaymentProvider { return new BkashGateway(); }
  createSmsChannel(): NotificationChannel { return new SmsChannel("BD"); }
}

export class InternationalProviderFactory implements RegionProviderFactory {
  readonly region = "International";
  createPaymentProvider(): PaymentProvider { return new CardGateway(); }
  createSmsChannel(): NotificationChannel { return new SmsChannel("INTL"); }
}

export function regionProviderFactory(region: string): RegionProviderFactory {
  return region.toUpperCase().startsWith("INT") ? new InternationalProviderFactory() : new BangladeshProviderFactory();
}
