import { LegalPage, legalMetadata } from "@/app/_site/legal";

export const metadata = legalMetadata("ka", "privacy");

export default function Page() {
  return <LegalPage lang="ka" doc="privacy" />;
}
