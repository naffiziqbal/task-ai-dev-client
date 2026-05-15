import "./globals.css";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { getCurrentUser } from "@/lib/auth-server";

export const metadata = {
  title: "Pearson Specter Litt — Litigation Workflow",
  description: "Grounded case fact summaries from messy legal documents",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <AppHeader user={user} />
        <main className="mx-auto max-w-6xl px-6 pb-24 pt-8 animate-fade-in">
          {children}
        </main>
      </body>
    </html>
  );
}
