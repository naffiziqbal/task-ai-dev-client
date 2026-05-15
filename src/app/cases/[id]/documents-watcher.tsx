"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TERMINAL_STATUSES = new Set(["indexed", "failed"]);
const POLL_INTERVAL_MS = 2500;
// Max polling window — give up after 10 minutes to avoid infinite refresh on a
// stuck worker. The user can reload the page if they really need to keep waiting.
const POLL_MAX_MS = 10 * 60 * 1000;

interface DocumentRow {
  id: string;
  status: string;
}

export function DocumentsWatcher({ documents }: { documents: DocumentRow[] }) {
  const router = useRouter();
  const inFlight = documents.filter((d) => !TERMINAL_STATUSES.has(d.status));
  const [tickedAt, setTickedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (inFlight.length === 0) return;
    const startedAt = Date.now();
    const id = setInterval(() => {
      if (Date.now() - startedAt > POLL_MAX_MS) {
        clearInterval(id);
        return;
      }
      router.refresh();
      setTickedAt(new Date());
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
    // Re-run when the in-flight count changes (it goes to 0 when all settle).
  }, [inFlight.length, router]);

  if (inFlight.length === 0) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-md border border-line/70 bg-canvas-elevated/60 px-3 py-2 text-xs text-ink-dim animate-fade-in"
    >
      <span className="relative inline-flex h-2 w-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      <span>
        Processing {inFlight.length} document
        {inFlight.length === 1 ? "" : "s"} — page will refresh automatically
        {tickedAt && (
          <span className="ml-1 text-ink-muted">
            (last check {tickedAt.toLocaleTimeString()})
          </span>
        )}
      </span>
    </div>
  );
}
