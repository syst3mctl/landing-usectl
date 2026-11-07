import { LegalPage, legalMetadata } from "@/app/_site/legal";

export const metadata = legalMetadata("ka", "terms");

export default function Page() {
  return <LegalPage lang="ka" doc="terms" />;
}
