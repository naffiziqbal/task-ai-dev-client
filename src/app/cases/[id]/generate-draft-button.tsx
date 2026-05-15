"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button, ErrorMessage } from "@/components/ui";

export function GenerateDraftButton({
  caseId,
  disabled,
}: {
  caseId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const draft = await api<{ id: string }>(`/cases/${caseId}/drafts`, {
        method: "POST",
      });
      router.push(`/cases/${caseId}/drafts/${draft.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        variant="primary"
        size="md"
        loading={busy}
        disabled={disabled}
        title={disabled ? "Index at least one document first" : undefined}
        onClick={run}
        leadingIcon={!busy && <SparkleIcon />}
      >
        {busy ? "Generating" : "Generate draft"}
      </Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}

function SparkleIcon() {
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
      <path d="M12 3l1.6 4.6 4.6 1.6-4.6 1.6L12 15.4l-1.6-4.6L5.8 9.2l4.6-1.6L12 3Z" />
      <path d="M19 14l.8 2.2 2.2.8-2.2.8L19 20l-.8-2.2-2.2-.8 2.2-.8L19 14Z" />
    </svg>
  );
}
