"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, Card, ErrorMessage, Input } from "@/components/ui";
import { signUp } from "@/lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    try {
      await signUp({
        name: String(data.get("name") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        password: String(data.get("password") ?? ""),
      });
      router.replace("/cases");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "sign-up failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <Card className="p-6 space-y-5">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-ink">
            Create account
          </h1>
          <p className="text-sm text-ink-dim">
            We&apos;ll pick a unique username from your name.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Name">
            <Input name="name" autoComplete="name" required maxLength={80} />
          </Field>
          <Field label="Email">
            <Input
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Password" hint="At least 8 characters.">
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </Field>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            className="w-full"
          >
            Create account
          </Button>
        </form>
        <div className="text-xs text-ink-dim">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-accent hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-ink-dim">{label}</span>
      {children}
      {hint && <span className="block text-2xs text-ink-faint">{hint}</span>}
    </label>
  );
}
