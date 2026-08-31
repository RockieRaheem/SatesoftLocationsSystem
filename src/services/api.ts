import { getAccessToken } from '../supabase/browser.ts';

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  if (!token) throw new Error('Your session has expired. Please sign in again.');
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(input, { ...init, headers });
  if (response.ok) return response;
  const payload = await response.json().catch(() => null) as { message?: string } | null;
  throw new Error(payload?.message || `Request failed with status ${response.status}.`);
}
