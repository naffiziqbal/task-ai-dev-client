"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button, Input, ErrorMessage } from "@/components/ui";

export function CreateCaseForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy]);

  function close() {
    setOpen(false);
    setName("");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      const c = await api<{ id: string }>("/cases", {
        method: "POST",
        json: { name: trimmed },
      });
      setOpen(false);
      setName("");
      router.refresh();
      router.push(`/cases/${c.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[create-case]", err);
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        New case
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create new case"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !busy && close()}
          />
          <form
            onSubmit={submit}
            className="relative w-full max-w-md rounded-lg border border-line bg-canvas-elevated p-5 shadow-xl"
          >
            <h2 className="text-sm font-medium text-ink">New case</h2>
            <p className="mt-1 text-xs text-ink-dim">
              Give the case a short, recognizable name.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Zane v. Hardman"
                aria-label="New case name"
                invalid={Boolean(error)}
                disabled={busy}
              />
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={close}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={busy}
                disabled={!name.trim()}
              >
                {busy ? "Creating" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
