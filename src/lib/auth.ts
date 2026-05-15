// Auth helpers. Sign-up / sign-in / sign-out hit the NestJS backend, which
// owns the users table and sets an HttpOnly `session` cookie on `localhost`.
// Cookies have no port scope, so the cookie set by :4000 is sent on requests
// to :3000 as well — that's what lets Next.js middleware see it.

import { API_URL } from "./api";

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  created_at: string;
}

async function authFetch<T>(
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
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    body,
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `${res.status}`;
    try {
      const data = await res.json();
      if (typeof data?.message === "string") message = data.message;
      else if (Array.isArray(data?.message)) message = data.message.join(", ");
    } catch {
      // ignore non-JSON
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function signUp(input: {
  email: string;
  password: string;
  name: string;
}): Promise<{ user: User }> {
  return authFetch("/auth/sign-up", { method: "POST", json: input });
}

export function signIn(input: {
  email: string;
  password: string;
}): Promise<{ user: User }> {
  return authFetch("/auth/sign-in", { method: "POST", json: input });
}

export function signOut(): Promise<void> {
  return authFetch("/auth/sign-out", { method: "POST" });
}
