import { LegalPage, legalMetadata } from "@/app/_site/legal";

export const metadata = legalMetadata("en", "terms");

export default function Page() {
  return <LegalPage lang="en" doc="terms" />;
}
