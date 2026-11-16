import { AgentsPage, agentsMetadata } from "@/app/_site/agents";

export const metadata = agentsMetadata("en");

export default function Page() {
  return <AgentsPage lang="en" />;
}
