// Types the client consumes from the backend's draft API.
// Kept here as a local copy — the backend is a separate codebase and we don't
// share modules with it.

export type CaseFactSection =
  | "parties"
  | "procedural_posture"
  | "factual_background"
  | "key_documents"
  | "disputed_facts"
  | "open_questions";

export interface Citation {
  token: string;
  chunkId: string;
  documentId: string;
  pageNumber: number;
  charStart: number;
  charEnd: number;
}

export interface DraftSection {
  key: CaseFactSection;
  label: string;
  text: string;
  citations: Citation[];
  insufficientEvidence: boolean;
}
