"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, API_URL } from "@/lib/api";
import type { Citation, DraftSection } from "@/api-types";
import { Badge, Button, Spinner, cn } from "@/components/ui";

interface DraftRow {
  id: string;
  case_id: string;
  version: number;
  sections: DraftSection[];
  citations: Citation[];
  edited: boolean;
  generated_at: string;
}

export function DraftEditor({ draft }: { draft: DraftRow }) {
  const router = useRouter();
  const [sections, setSections] = useState<DraftSection[]>(draft.sections);
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState<Citation | null>(null);
  const [missing, setMissing] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const sourceRef = useRef<HTMLDivElement | null>(null);

  // Build a chunkId → Citation lookup across every section AND the
  // top-level citations array (the section-scoped arrays sometimes miss
  // tokens the operator copy-pasted from another section).
  const citationsByChunk = useMemo(() => {
    const map = new Map<string, Citation>();
    for (const c of draft.citations ?? []) map.set(c.chunkId, c);
    for (const s of sections) for (const c of s.citations) map.set(c.chunkId, c);
    return map;
  }, [sections, draft.citations]);

  // Open a citation. Scrolls the source panel into view on narrow viewports
  // where the aside drops below the editor.
  function openCitation(chunkId: string) {
    const c = citationsByChunk.get(chunkId);
    if (c) {
      setFocused(c);
      setMissing(null);
      // Defer until the SourceViewer mounts so the scroll target exists.
      requestAnimationFrame(() => {
        sourceRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } else {
      setMissing(chunkId);
      setFocused(null);
    }
  }

  async function save() {
    setBusy(true);
    try {
      await api(`/drafts/${draft.id}`, {
        method: "PATCH",
        json: { sections: sections.map((s) => ({ key: s.key, text: s.text })) },
      });
      setDirty(false);
      setSavedAt(new Date());
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function updateSection(key: string, text: string) {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, text } : s)),
    );
    setDirty(true);
  }

  // Keyboard shortcut: Cmd/Ctrl + S to save.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (dirty && !busy) save();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="animate-slide-up">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <Link
            href="/cases"
            className="rounded-sm px-1 transition-colors hover:text-ink"
          >
            Cases
          </Link>
          <ChevronRightIcon className="h-3 w-3" />
          <Link
            href={`/cases/${draft.case_id}`}
            className="rounded-sm px-1 transition-colors hover:text-ink"
          >
            Case
          </Link>
          <ChevronRightIcon className="h-3 w-3" />
          <span className="text-ink-dim">Draft v{draft.version}</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="eyebrow">Output</div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Case Fact Summary
            </h1>
            <p className="text-sm text-ink-dim">
              v{draft.version} · generated{" "}
              {new Date(draft.generated_at).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              {draft.edited && (
                <Badge tone="accent" className="ml-2">
                  edited
                </Badge>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SaveStatus dirty={dirty} busy={busy} savedAt={savedAt} />
            <Button
              variant="primary"
              size="md"
              loading={busy}
              disabled={!dirty}
              onClick={save}
              leadingIcon={!busy && <SaveIcon />}
              title="⌘+S"
            >
              {busy ? "Saving" : "Save edits"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[14rem_minmax(0,1fr)_minmax(0,26rem)]">
        <SectionNav sections={sections} />

        <div className="min-w-0 space-y-6">
          {sections.map((s) => (
            <SectionBlock
              key={s.key}
              section={s}
              onChange={(text) => updateSection(s.key, text)}
              onCitationClick={openCitation}
              focusedChunkId={focused?.chunkId}
            />
          ))}
        </div>

        <aside
          ref={sourceRef}
          className="min-w-0 scroll-mt-20 lg:sticky lg:top-20 lg:self-start"
        >
          <div className="rounded-lg border border-line bg-canvas-raised/80 shadow-card">
            <div className="flex items-center justify-between border-b border-line/60 px-4 py-2.5">
              <div className="eyebrow">Source</div>
              {(focused || missing) && (
                <button
                  type="button"
                  onClick={() => {
                    setFocused(null);
                    setMissing(null);
                  }}
                  className="text-ink-muted transition-colors hover:text-ink"
                  aria-label="Clear source viewer"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="p-4">
              {focused ? (
                <SourceViewer citation={focused} />
              ) : missing ? (
                <div className="space-y-2 text-xs text-amber-200 animate-fade-in">
                  <div className="font-medium">Citation not resolvable</div>
                  <div className="text-ink-dim">
                    The token <code className="font-mono text-amber-200/90">[c:{missing}]</code>{" "}
                    isn't in this draft's citation index. This happens when an
                    operator types or pastes a citation token by hand, or when
                    a draft was edited and re-saved without re-running
                    generation.
                  </div>
                  <div className="text-ink-muted">
                    Regenerate the draft to refresh the citation index.
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-faint">
                    <ChipIcon />
                  </div>
                  <div className="text-xs text-ink-dim">
                    Click any citation chip on the left
                  </div>
                  <div className="text-2xs text-ink-muted mt-1">
                    The source page and cited span appear here.
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionNav({ sections }: { sections: DraftSection[] }) {
  return (
    <nav className="space-y-2 lg:sticky lg:top-20 lg:self-start">
      <div className="eyebrow px-2">Sections</div>
      <ul className="space-y-1 text-sm">
        {sections.map((s) => (
          <li key={s.key}>
            <a
              href={`#section-${s.key}`}
              className="group flex items-center justify-between rounded-md px-2 py-1.5 text-ink-dim transition-colors hover:bg-white/[0.04] hover:text-ink"
            >
              <span className="truncate">{s.label}</span>
              {s.insufficientEvidence && (
                <span className="relative flex">
                  <span
                    tabIndex={0}
                    aria-label="Insufficient evidence"
                    className="peer h-1.5 w-1.5 rounded-full bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
                  />
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute right-full top-1/2 z-50 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-2xs font-medium text-amber-200 opacity-0 shadow-card backdrop-blur-sm transition-opacity duration-150 peer-hover:opacity-100 peer-focus-visible:opacity-100"
                  >
                    Insufficient evidence
                  </span>
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SaveStatus({
  dirty,
  busy,
  savedAt,
}: {
  dirty: boolean;
  busy: boolean;
  savedAt: Date | null;
}) {
  if (busy) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-ink-muted">
        <Spinner size="sm" />
        Saving
      </span>
    );
  }
  if (dirty) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-300">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
        Unsaved changes
      </span>
    );
  }
  if (savedAt) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-300/80">
        <CheckIcon className="h-3 w-3" />
        Saved
      </span>
    );
  }
  return null;
}

function SectionBlock({
  section,
  onChange,
  onCitationClick,
  focusedChunkId,
}: {
  section: DraftSection;
  onChange: (text: string) => void;
  onCitationClick: (chunkId: string) => void;
  focusedChunkId?: string;
}) {
  return (
    <section
      id={`section-${section.key}`}
      className="scroll-mt-24 space-y-2"
    >
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{section.label}</h2>
        {section.insufficientEvidence && (
          <Badge tone="warning">Insufficient evidence</Badge>
        )}
      </header>

      <CitationAwareTextarea
        text={section.text}
        onChange={onChange}
        onCitationClick={onCitationClick}
        focusedChunkId={focusedChunkId}
      />
    </section>
  );
}

function CitationAwareTextarea({
  text,
  onChange,
  onCitationClick,
  focusedChunkId,
}: {
  text: string;
  onChange: (text: string) => void;
  onCitationClick: (chunkId: string) => void;
  focusedChunkId?: string;
}) {
  // Pattern matching the citation tokens emitted by the drafter, e.g. [c:abc123].
  const tokens = text.split(/(\[c:[a-f0-9-]+\])/g);

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        className="editable-section w-full min-h-[8rem] resize-y outline-none bg-transparent"
        spellCheck={false}
      />
      <div className="rounded-md border border-line/70 bg-white/[0.015] px-3 py-2 font-serif text-sm leading-relaxed text-ink-dim">
        {tokens.map((t, i) => {
          const m = t.match(/^\[c:([a-f0-9-]+)\]$/);
          if (m) {
            const focused = m[1] === focusedChunkId;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onCitationClick(m[1])}
                className={cn(
                  "citation-chip",
                  focused && "ring-2 ring-accent/40",
                )}
                title="View source"
              >
                cite
              </button>
            );
          }
          return <span key={i}>{t}</span>;
        })}
      </div>
    </div>
  );
}

function SourceViewer({ citation }: { citation: Citation }) {
  const [data, setData] = useState<{
    page: { text: string | null; ocr_confidence: number | null };
    imageUrl: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchKeyRef = useRef<string | null>(null);

  // Fire when citation changes. Using useEffect (not useMemo, which was a
  // latent bug — useMemo for side effects skips dev-time strict-mode reruns).
  useEffect(() => {
    const key = `${citation.documentId}::${citation.pageNumber}::${citation.chunkId}`;
    if (fetchKeyRef.current === key) return;
    fetchKeyRef.current = key;
    setData(null);
    setError(null);
    let cancelled = false;
    fetch(
      `${API_URL}/documents/${citation.documentId}/pages/${citation.pageNumber}`,
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, [citation.chunkId, citation.documentId, citation.pageNumber]);

  if (error) {
    return (
      <div className="text-xs text-rose-300">Failed to load source: {error}</div>
    );
  }
  if (!data) {
    return (
      <div className="space-y-2">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-2 w-full" />
        <div className="skeleton h-2 w-5/6" />
      </div>
    );
  }

  const snippet = data.page.text
    ? highlightSpan(data.page.text, citation.charStart, citation.charEnd)
    : null;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink-dim">Page {citation.pageNumber}</span>
        {data.page.ocr_confidence !== null &&
          data.page.ocr_confidence >= 0 && (
            <Badge
              tone={data.page.ocr_confidence < 60 ? "warning" : "neutral"}
              className="font-mono"
            >
              OCR {data.page.ocr_confidence.toFixed(0)}%
            </Badge>
          )}
      </div>
      {data.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.imageUrl}
          alt={`Page ${citation.pageNumber}`}
          className="w-full rounded-md border border-line"
        />
      )}
      {snippet && (
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-line/70 bg-canvas-inset px-3 py-2.5 font-mono text-xs leading-relaxed text-ink-dim">
          {snippet}
        </pre>
      )}
    </div>
  );
}

function highlightSpan(text: string, start: number, end: number) {
  const pre = text.slice(Math.max(0, start - 200), start);
  const cited = text.slice(start, end);
  const post = text.slice(end, Math.min(text.length, end + 200));
  return `…${pre}❰❰${cited}❱❱${post}…`;
}

function SaveIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
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
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  );
}

function ChipIcon() {
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
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 2v4M16 2v4M2 8h4M2 16h4M22 8h-4M22 16h-4M8 22v-4M16 22v-4" />
    </svg>
  );
}
