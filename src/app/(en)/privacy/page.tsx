import { LegalPage, legalMetadata } from "@/app/_site/legal";

export const metadata = legalMetadata("en", "privacy");

export default function Page() {
  return <LegalPage lang="en" doc="privacy" />;
}
