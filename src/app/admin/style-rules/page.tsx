import { api } from "@/lib/api";
import { StyleRulesClient } from "./style-rules-client";

interface StyleRule {
  id: string;
  pattern: string;
  replacement: string;
  rationale: string | null;
  frequency: number;
  approved: boolean;
  disabled: boolean;
  last_seen: string;
}

export default async function StyleRulesPage() {
  const [rules, guide] = await Promise.all([
    api<StyleRule[]>("/style-rules"),
    api<{ content: string }>("/style-guide"),
  ]);
  return <StyleRulesClient initialRules={rules} initialGuide={guide.content} />;
}
