import { useAuthStore, getAccessToken } from '@/store/auth-store';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

export class ApiClientError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Skip attaching the bearer token (used by refresh itself). */
  skipAuth?: boolean;
  /** Internal: prevents infinite refresh loops. */
  _retry?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

/** Attempt a silent token refresh using the httpOnly cookie. Deduped. */
async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) return false;
        const json = (await res.json()) as ApiEnvelope<{
          user: import('@/types/auth').AuthUser;
          accessToken: string;
        }>;
        useAuthStore.getState().setAuth(json.data.user, json.data.accessToken);
        return true;
      } catch {
        return false;
      } finally {
        // Allow subsequent refreshes after this cycle resolves.
        setTimeout(() => (refreshPromise = null), 0);
      }
    })();
  }
  return refreshPromise;
}

/**
 * Typed fetch wrapper. Attaches the bearer token, sends cookies, and on a 401
 * transparently refreshes the session once before retrying the request.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiEnvelope<T>> {
  const { body, skipAuth, _retry, headers, ...rest } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const finalHeaders: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: 'include',
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !skipAuth && !_retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, _retry: true });
    }
    useAuthStore.getState().clear();
  }

  const json = await res.json().catch(() => ({
    success: false,
    message: 'Unexpected server response',
  }));

  if (!res.ok || json.success === false) {
    throw new ApiClientError(
      res.status,
      json.message ?? 'Request failed',
      json.errors
    );
  }

  return json as ApiEnvelope<T>;
}
