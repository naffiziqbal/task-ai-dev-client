// Server-side helper: read the session cookie from the incoming request and
// ask the backend who we are. Used by layouts/pages to gate UI on the server.
import { cookies } from "next/headers";
import { API_URL } from "./api";
import type { User } from "./auth";

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get("session")?.value;
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { cookie: `session=${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: User };
    return data.user;
  } catch {
    return null;
  }
}
