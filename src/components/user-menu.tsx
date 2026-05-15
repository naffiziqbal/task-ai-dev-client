"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui";
import { signOut } from "@/lib/auth";
import type { User } from "@/lib/auth";

export function UserMenu({ user }: { user: User }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onSignOut() {
    setBusy(true);
    try {
      await signOut();
    } finally {
      router.replace("/sign-in");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-end leading-tight">
        <span className="text-sm text-ink">{user.name}</span>
        <span className="text-2xs text-ink-faint">@{user.username}</span>
      </div>
      <Button variant="ghost" size="sm" loading={busy} onClick={onSignOut}>
        Sign out
      </Button>
    </div>
  );
}
