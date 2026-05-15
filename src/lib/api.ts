// Centralized API client. Server components and client components both
// import from here so we have a single source of URL truth.
//
// Auth: in the browser, `credentials: 'include'` sends the HttpOnly session
// cookie. On the server (RSC/route handlers), fetch doesn't auto-forward
// cookies, so we read the session cookie from the incoming request and pass
// it as a Cookie header.

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4000";

async function serverCookieHeader(): Promise<string | undefined> {
  if (typeof window !== "undefined") return undefined;
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const session = store.get("session")?.value;
  return session ? `session=${session}` : undefined;
}

export async function api<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  let body = init?.body;
  if (init?.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  }
  const cookie = await serverCookieHeader();
  if (cookie) headers.cookie = cookie;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    body,
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status} ${path}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}
