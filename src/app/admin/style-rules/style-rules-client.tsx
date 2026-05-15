"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  SectionHeader,
  Toggle,
} from "@/components/ui";

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

export function StyleRulesClient({
  initialRules,
  initialGuide,
}: {
  initialRules: StyleRule[];
  initialGuide: string;
}) {
  const [rules, setRules] = useState(initialRules);
  const [guide, setGuide] = useState(initialGuide);
  const [busy, setBusy] = useState(false);

  async function patch(
    id: string,
    body: { approved?: boolean; disabled?: boolean },
  ) {
    setRules((r) => r.map((x) => (x.id === id ? { ...x, ...body } : x)));
    await api(`/style-rules/${id}`, { method: "PATCH", json: body });
  }

  async function synthesize() {
    setBusy(true);
    try {
      const res = await api<{ content: string }>("/style-guide/synthesize", {
        method: "POST",
      });
      setGuide(res.content);
    } finally {
      setBusy(false);
    }
  }

  const approvedCount = rules.filter((r) => r.approved && !r.disabled).length;
  const candidateCount = rules.filter((r) => !r.approved && !r.disabled).length;

  return (
    <div className="space-y-10 animate-slide-up">
      <header className="space-y-3">
        <div className="eyebrow">Learning loop</div>
        <h1 className="text-3xl font-semibold tracking-tight">Style Rules</h1>
        <p className="max-w-2xl text-sm text-ink-dim">
          When you save an edit on a draft, the model classifies each changed
          sentence and proposes <em>(pattern → replacement)</em> rules from
          style/terminology edits. Approve a rule to fold it into the active
          style guide that conditions future drafts.
        </p>
      </header>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Active"
          title="Style guide"
          description={`Synthesized from ${approvedCount} approved rule${
            approvedCount === 1 ? "" : "s"
          }. Re-synthesizes automatically after every 3 newly-approved rules.`}
          trailing={
            <Button
              variant="secondary"
              size="sm"
              loading={busy}
              onClick={synthesize}
              leadingIcon={!busy && <RefreshIcon />}
            >
              {busy ? "Synthesizing" : "Re-synthesize"}
            </Button>
          }
        />
        <Card className="p-5">
          {guide ? (
            <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-ink-dim">
              {guide}
            </pre>
          ) : (
            <div className="text-sm text-ink-muted italic">
              No active style guide yet. Approve rules below and click
              Re-synthesize.
            </div>
          )}
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Pending review"
          title="Candidate rules"
          description={
            candidateCount > 0
              ? `${candidateCount} awaiting your decision.`
              : "Everything has been triaged."
          }
        />
        {rules.length === 0 ? (
          <EmptyState
            icon={<ListIcon />}
            title="No candidate rules yet"
            description="They'll appear here once you save edits on a draft that swap a term or rephrase for style."
          />
        ) : (
          <ul className="space-y-2">
            {rules.map((r) => (
              <RuleRow
                key={r.id}
                rule={r}
                onToggleApproved={(v) => patch(r.id, { approved: v })}
                onToggleDisabled={(v) => patch(r.id, { disabled: v })}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function RuleRow({
  rule,
  onToggleApproved,
  onToggleDisabled,
}: {
  rule: StyleRule;
  onToggleApproved: (v: boolean) => void;
  onToggleDisabled: (v: boolean) => void;
}) {
  return (
    <Card as="li" className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
            <code className="rounded-md bg-rose-500/10 px-2 py-0.5 text-rose-200 border border-rose-500/20">
              {rule.pattern}
            </code>
            <span className="text-ink-muted">→</span>
            <code className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-200 border border-emerald-500/20">
              {rule.replacement}
            </code>
          </div>
          {rule.rationale && (
            <div className="text-xs text-ink-dim">{rule.rationale}</div>
          )}
          <div className="flex items-center gap-3 text-2xs text-ink-muted">
            <span>
              Seen <span className="text-ink-dim">{rule.frequency}×</span>
            </span>
            <span aria-hidden>·</span>
            <span>
              Last{" "}
              {new Date(rule.last_seen).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
            {rule.disabled && <Badge tone="danger">Disabled</Badge>}
            {rule.approved && !rule.disabled && (
              <Badge tone="success">Approved</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2.5 text-2xs text-ink-muted">
          <label className="flex items-center gap-2">
            <span>Approve</span>
            <Toggle
              checked={rule.approved}
              onChange={onToggleApproved}
              label="Approve rule"
            />
          </label>
          <label className="flex items-center gap-2">
            <span>Disable</span>
            <Toggle
              checked={rule.disabled}
              onChange={onToggleDisabled}
              label="Disable rule"
            />
          </label>
        </div>
      </div>
    </Card>
  );
}

function RefreshIcon() {
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
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5" />
    </svg>
  );
}

function ListIcon() {
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
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
