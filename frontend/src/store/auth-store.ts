'use client';

import { create } from 'zustand';
import type { AuthUser } from '@/types/auth';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  /** True until the initial silent refresh completes, so guards can wait. */
  isHydrating: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  setToken: (accessToken: string) => void;
  clear: () => void;
  setHydrating: (v: boolean) => void;
}

/**
 * In-memory auth store. The access token is intentionally NOT persisted to
 * localStorage — it lives only in memory and is re-obtained from the httpOnly
 * refresh cookie on reload, which is safer against XSS token theft.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrating: true,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  setUser: (user) => set({ user }),
  setToken: (accessToken) => set({ accessToken }),
  clear: () => set({ user: null, accessToken: null }),
  setHydrating: (isHydrating) => set({ isHydrating }),
}));

/** Non-reactive getter for use inside the API client. */
export const getAccessToken = () => useAuthStore.getState().accessToken;
