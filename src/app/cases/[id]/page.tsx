import Link from "next/link";
import { api } from "@/lib/api";
import { UploadZone } from "./upload-zone";
import { GenerateDraftButton } from "./generate-draft-button";
import { DocumentsWatcher } from "./documents-watcher";
import {
  Badge,
  Card,
  EmptyState,
  ProgressBar,
  SectionHeader,
} from "@/components/ui";

interface DocumentRow {
  id: string;
  filename: string;
  status: string;
  page_count: number | null;
  pages_done: number | null;
  pages_total: number | null;
  mean_ocr_confidence: number | null;
  document_type: string | null;
  error: string | null;
}

interface DraftRow {
  id: string;
  version: number;
  generated_at: string;
  edited: boolean;
}

export default async function CaseDetailPage(
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const [c, documents, drafts] = await Promise.all([
    api<{ id: string; name: string }>(`/cases/${id}`),
    api<DocumentRow[]>(`/cases/${id}/documents`),
    api<DraftRow[]>(`/cases/${id}/drafts`),
  ]);

  const indexedCount = documents.filter((d) => d.status === "indexed").length;
  const canGenerate = indexedCount > 0;

  return (
    <div className="space-y-10 animate-slide-up">
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <Link
            href="/cases"
            className="rounded-sm px-1 transition-colors hover:text-ink"
          >
            Cases
          </Link>
          <ChevronRightIcon className="h-3 w-3" />
          <span className="text-ink-dim">{c.name}</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="eyebrow">Case</div>
            <h1 className="text-3xl font-semibold tracking-tight">{c.name}</h1>
            <p className="text-sm text-ink-dim">
              {documents.length} document{documents.length === 1 ? "" : "s"}
              {" · "}
              {indexedCount} indexed
              {" · "}
              {drafts.length} draft{drafts.length === 1 ? "" : "s"}
            </p>
          </div>
          <GenerateDraftButton caseId={id} disabled={!canGenerate} />
        </div>
      </header>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Source material"
          title="Documents"
          description="Upload PDFs, images, or plain text. Each file is OCR'd, structured-extracted, and indexed for retrieval."
        />
        <UploadZone caseId={id} />
        <DocumentsWatcher documents={documents} />
        {documents.length === 0 ? (
          <EmptyState
            icon={<FileIcon />}
            title="No documents yet"
            description="Drop a file above to start the pipeline."
          />
        ) : (
          <ul className="space-y-2">
            {documents.map((d) => (
              <DocumentItem key={d.id} doc={d} />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Output"
          title="Case Fact Summary drafts"
          description="Click Generate draft to fan out section-specific sub-queries and produce a grounded summary with per-sentence citations."
        />
        {drafts.length === 0 ? (
          <EmptyState
            icon={<ScrollIcon />}
            title="No drafts yet"
            description={
              canGenerate
                ? "Click Generate draft to produce the first version."
                : "Upload at least one document and wait for it to reach Indexed."
            }
          />
        ) : (
          <ul className="space-y-2">
            {drafts.map((d) => (
              <Card as="li" interactive key={d.id}>
                <Link
                  href={`/cases/${id}/drafts/${d.id}`}
                  className="flex items-center justify-between p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-base font-medium text-ink">
                      Case Fact Summary{" "}
                      <span className="text-ink-muted">v{d.version}</span>
                      {d.edited && (
                        <Badge tone="accent">edited</Badge>
                      )}
                    </div>
                    <div className="text-xs text-ink-muted">
                      Generated{" "}
                      {new Date(d.generated_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 text-ink-muted" />
                </Link>
              </Card>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DocumentItem({ doc }: { doc: DocumentRow }) {
  const progress = computeProgress(doc);
  return (
    <Card as="li" className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <FileBadge mime={doc.document_type} />
            <span className="truncate text-sm font-medium text-ink">
              {doc.filename}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
            <span>{doc.document_type ?? "Unclassified"}</span>
            <span aria-hidden>·</span>
            <span>
              {doc.page_count != null
                ? `${doc.page_count} page${doc.page_count === 1 ? "" : "s"}`
                : "page count pending"}
            </span>
          </div>
          {doc.error && (
            <div className="mt-1 rounded-md border border-rose-500/30 bg-rose-500/5 px-2.5 py-1.5 text-xs text-rose-300">
              {doc.error}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={doc.status} />
          {doc.mean_ocr_confidence !== null &&
            doc.mean_ocr_confidence >= 0 && (
              <ConfidenceBadge confidence={doc.mean_ocr_confidence} />
            )}
        </div>
      </div>
      {progress && (
        <ProgressBar
          className="mt-3"
          value={progress.value}
          label={progress.label}
        />
      )}
    </Card>
  );
}

// Maps the worker's coarse status + per-page progress into a 0..1 bar.
// Returns null when no bar should render (terminal/failed states).
function computeProgress(
  doc: DocumentRow,
): { value: number | null; label: string } | null {
  if (doc.status === "indexed" || doc.status === "failed") return null;

  if (doc.status === "pending") {
    return { value: 0.02, label: "Queued" };
  }

  if (doc.status === "ocr") {
    const done = doc.pages_done ?? 0;
    const total = doc.pages_total ?? 0;
    // OCR occupies 0..70% of the bar so extraction/indexing has visible room.
    if (total > 0) {
      const value = 0.05 + (done / total) * 0.65;
      return {
        value,
        label: `Reading page ${Math.min(done + 1, total)} of ${total}`,
      };
    }
    return { value: null, label: "Reading document…" };
  }

  if (doc.status === "extracted") {
    return { value: 0.85, label: "Extracting facts" };
  }

  return { value: null, label: doc.status };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: Parameters<typeof Badge>[0]["tone"]; label: string }> = {
    indexed: { tone: "success", label: "Indexed" },
    extracted: { tone: "info", label: "Extracting" },
    ocr: { tone: "info", label: "Reading OCR" },
    pending: { tone: "neutral", label: "Queued" },
    failed: { tone: "danger", label: "Failed" },
  };
  const cfg = map[status] ?? { tone: "neutral" as const, label: status };
  return (
    <Badge tone={cfg.tone} dot={cfg.tone !== "neutral"}>
      {cfg.label}
    </Badge>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const low = confidence < 60;
  return (
    <Badge tone={low ? "warning" : "neutral"} className="font-mono">
      OCR {confidence.toFixed(0)}%
      {low && " · low"}
    </Badge>
  );
}

function FileBadge({ mime }: { mime: string | null }) {
  return (
    <span
      className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-line bg-canvas-elevated text-ink-muted"
      aria-hidden
    >
      <FileIcon />
    </span>
  );
}

function FileIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function ScrollIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 5h9a3 3 0 0 1 3 3v8M15 19H6a3 3 0 0 1-3-3V8M9 5v14M15 5v14" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
