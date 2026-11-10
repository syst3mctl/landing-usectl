import { PricingPage, pricingMetadata } from "@/app/_site/pricing";

export const metadata = pricingMetadata("en");

export default function Page() {
  return <PricingPage lang="en" />;
}
