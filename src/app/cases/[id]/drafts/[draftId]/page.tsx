import { api } from "@/lib/api";
import { DraftEditor } from "./draft-editor";
import type { DraftSection, Citation } from "@/api-types";

interface DraftRow {
  id: string;
  case_id: string;
  version: number;
  sections: DraftSection[];
  citations: Citation[];
  edited: boolean;
  generated_at: string;
}

export default async function DraftPage(
  props: { params: Promise<{ id: string; draftId: string }> },
) {
  const { draftId } = await props.params;
  const draft = await api<DraftRow>(`/drafts/${draftId}`);
  return <DraftEditor draft={draft} />;
}
