import fs from "node:fs";
import path from "node:path";
import type { Lang, LegalDoc } from "@/lib/i18n";

// The legal texts, read from content/legal/ at BUILD time (the pages are prerendered, so this runs
// once per build, never per request). They are markdown on purpose: whoever edits them (or a
// lawyer's redline) touches prose, not JSX. Kept out of public/ because anything there is served
// as is, drafts and [[placeholders]] included.

const FILE: Record<LegalDoc, string> = { privacy: "privacy-policy", terms: "terms-of-use" };

export type LegalText = {
  /** the document's own `# Heading` */
  title: string;
  markdown: string;
  /** still carries [[PLACEHOLDERS]] — the page is then noindex and stays out of the sitemap */
  draft: boolean;
};

export function readLegal(doc: LegalDoc, lang: Lang): LegalText {
  const markdown = fs.readFileSync(path.join(process.cwd(), "content", "legal", `${FILE[doc]}.${lang}.md`), "utf8");
  const title = markdown.match(/^#\s+(.+)$/m)?.[1].trim() ?? doc;
  return { title, markdown, draft: markdown.includes("[[") };
}
