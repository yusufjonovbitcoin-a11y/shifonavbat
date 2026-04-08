/** API bazaviy URL: Vercel + alohida backend uchun `VITE_API_BASE_URL` */
const base =
  (import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL?.replace(
    /\/$/,
    ""
  ) ?? "";

export function apiUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const AUTH_STORAGE_KEY = "shifokorlda_token";

export function getAuthToken(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(AUTH_STORAGE_KEY);
}

export function setAuthToken(token: string | null): void {
  if (typeof sessionStorage === "undefined") return;
  if (token) sessionStorage.setItem(AUTH_STORAGE_KEY, token);
  else sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function authJsonHeaders(): HeadersInit {
  const t = getAuthToken();
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}
