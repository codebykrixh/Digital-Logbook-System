'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authApi } from '@/services/auth.service';
import { apiFetch } from '@/lib/api';

/**
 * Client-side auth guard. Attempts a silent refresh (via the httpOnly cookie)
 * when no user is loaded, then either hydrates the store or redirects to login.
 * Returns `{ ready }` so the page can render a loader until resolved.
 */
export function useRequireAuth() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [ready, setReady] = useState(!!user);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (user) {
        setReady(true);
        return;
      }
      try {
        // A 401 here triggers a refresh attempt inside apiFetch.
        const { data } = await apiFetch<{
          user: import('@/types/auth').AuthUser;
        }>('/auth/me');
        if (!cancelled) {
          setUser(data.user);
          setReady(true);
        }
      } catch {
        if (!cancelled) router.replace('/login?redirect=/dashboard');
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ready, user };
}

/** Sign out: revoke the session server-side and clear local state. */
export function useLogout() {
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);
  return async () => {
    try {
      await authApi.logout();
    } finally {
      clear();
      router.push('/login');
    }
  };
}
