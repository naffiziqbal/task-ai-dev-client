"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { Spinner, cn } from "@/components/ui";

interface UploadItem {
  name: string;
  status: "uploading" | "done" | "error";
  error?: string;
}

export function UploadZone({ caseId }: { caseId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const busy = items.some((i) => i.status === "uploading");

  async function uploadFiles(fileList: FileList | File[] | null | undefined) {
    if (!fileList) return;
    const files = Array.from(fileList);
    if (files.length === 0) return;

    // Seed UI state for each file before any network call.
    setItems((prev) => [
      ...prev,
      ...files.map<UploadItem>((f) => ({
        name: f.name,
        status: "uploading",
      })),
    ]);

    // Upload sequentially — keeps backend queue ordering predictable and
    // makes per-file errors easy to surface.
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(`${API_URL}/cases/${caseId}/documents`, {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text.slice(0, 200) || `${res.status}`);
        }
        setItems((prev) =>
          prev.map((p) =>
            p.name === file.name && p.status === "uploading"
              ? { ...p, status: "done" }
              : p,
          ),
        );
      } catch (e) {
        setItems((prev) =>
          prev.map((p) =>
            p.name === file.name && p.status === "uploading"
              ? { ...p, status: "error", error: (e as Error).message }
              : p,
          ),
        );
      }
    }

    // Refresh server data so the documents list reflects the new uploads.
    router.refresh();

    // Auto-clear successes after a moment so the zone returns to a clean state.
    setTimeout(() => {
      setItems((prev) => prev.filter((p) => p.status !== "done"));
    }, 2400);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer?.files);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        "group relative rounded-lg border border-dashed transition-all duration-200",
        dragOver
          ? "border-accent/60 bg-accent/5 ring-1 ring-accent/30"
          : "border-line hover:border-line-strong hover:bg-white/[0.015]",
      )}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex w-full items-center gap-4 px-6 py-7 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas rounded-lg"
      >
        <div
          className={cn(
            "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border transition-all",
            dragOver
              ? "border-accent/60 bg-accent/15 text-accent"
              : "border-line bg-canvas-elevated text-ink-dim group-hover:border-line-strong group-hover:text-ink",
          )}
        >
          <UploadIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-ink">
            {dragOver
              ? "Drop to upload"
              : "Drop files here, or click to browse"}
          </div>
          <div className="mt-0.5 text-xs text-ink-muted">
            PDFs, images, or plain text · automatically OCR'd, extracted, and
            indexed
          </div>
        </div>
        {busy && <Spinner size="sm" className="text-ink-dim" />}
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="application/pdf,image/*,text/plain"
        className="hidden"
        onChange={(e) => {
          uploadFiles(e.target.files);
          // reset so the same file can be re-selected if needed
          e.target.value = "";
        }}
      />

      {items.length > 0 && (
        <ul className="border-t border-line/60 px-4 py-3 space-y-1.5 text-xs">
          {items.map((item, i) => (
            <li
              key={`${item.name}-${i}`}
              className="flex items-center gap-2 animate-fade-in"
            >
              {item.status === "uploading" && (
                <Spinner size="sm" className="text-ink-muted" />
              )}
              {item.status === "done" && (
                <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
              )}
              {item.status === "error" && (
                <XIcon className="h-3.5 w-3.5 text-rose-400" />
              )}
              <span
                className={cn(
                  "truncate",
                  item.status === "error" ? "text-rose-300" : "text-ink-dim",
                )}
              >
                {item.name}
                {item.status === "error" && item.error && (
                  <span className="ml-2 text-rose-400/70">— {item.error}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
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
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  );
}
