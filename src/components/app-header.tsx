"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./ui";
import { UserMenu } from "./user-menu";
import type { User } from "@/lib/auth";

const navItems = [
  { href: "/cases", label: "Cases" },
  { href: "/admin/style-rules", label: "Style Rules" },
];

export function AppHeader({ user }: { user: User | null }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/cases"
          className="group flex items-center gap-2.5 text-sm font-semibold tracking-wide"
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-accent/40 bg-accent/10 text-accent transition-colors group-hover:bg-accent/20"
          >
            <span className="text-[11px] font-bold tracking-tighter">PSL</span>
          </span>
          <span className="text-ink-dim group-hover:text-ink transition-colors">
            Litigation Workflow
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {user && (
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const active =
                  item.href === "/cases"
                    ? pathname === "/cases" || pathname.startsWith("/cases/")
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative rounded-md px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "text-ink"
                        : "text-ink-dim hover:text-ink hover:bg-white/[0.04]",
                    )}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-3 -bottom-[13px] h-px bg-accent" />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link
              href="/sign-in"
              className="text-sm text-ink-dim hover:text-ink transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
