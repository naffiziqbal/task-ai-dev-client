"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, Card, ErrorMessage, Input } from "@/components/ui";
import { signIn } from "@/lib/auth";

export default function SignInPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    try {
      await signIn({
        email: String(data.get("email") ?? "").trim(),
        password: String(data.get("password") ?? ""),
      });
      router.replace("/cases");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <Card className="p-6 space-y-5">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-ink">
            Sign in
          </h1>
          <p className="text-sm text-ink-dim">
            Welcome back. Sign in to continue.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-dim">Email</span>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-dim">Password</span>
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            className="w-full"
          >
            Sign in
          </Button>
        </form>
        <div className="text-xs text-ink-dim">
          No account?{" "}
          <Link href="/sign-up" className="text-accent hover:underline">
            Create one
          </Link>
        </div>
      </Card>
    </div>
  );
}
