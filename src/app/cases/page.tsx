import Link from "next/link";
import { api } from "@/lib/api";
import { CreateCaseForm } from "./create-form";
import { Card, EmptyState } from "@/components/ui";

interface Case {
  id: string;
  name: string;
  created_at: string;
}

export default async function CasesPage() {
  const cases = await api<Case[]>("/cases");
  return (
    <div className="space-y-8 animate-slide-up">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="eyebrow">Workspace</div>
          <h1 className="text-3xl font-semibold tracking-tight">Cases</h1>
          <p className="text-sm text-ink-dim max-w-prose">
            Every case is a workspace for one matter — upload documents,
            generate a grounded fact summary, and teach the model from your
            edits.
          </p>
        </div>
        <CreateCaseForm />
      </header>

      {cases.length === 0 ? (
        <EmptyState
          icon={<FolderIcon />}
          title="No cases yet"
          description="Create your first case to start uploading documents."
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <Card as="li" interactive key={c.id}>
              <Link
                href={`/cases/${c.id}`}
                className="block p-5 focus-visible:outline-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold text-ink">
                      {c.name}
                    </div>
                    <div className="mt-1 text-xs text-ink-muted">
                      Opened {new Date(c.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <ArrowIcon className="mt-1 h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}

function FolderIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
