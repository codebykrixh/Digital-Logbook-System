import { apiFetch } from '@/lib/api';
import type { AuthResult, AuthUser } from '@/types/auth';

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<AuthResult>('/auth/register', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResult>('/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    }),

  logout: () => apiFetch<null>('/auth/logout', { method: 'POST' }),

  me: () => apiFetch<{ user: AuthUser }>('/auth/me'),

  forgotPassword: (email: string) =>
    apiFetch<null>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      skipAuth: true,
    }),

  resetPassword: (token: string, password: string) =>
    apiFetch<null>('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
      skipAuth: true,
    }),

  verifyEmail: (token: string) =>
    apiFetch<null>('/auth/verify-email', {
      method: 'POST',
      body: { token },
      skipAuth: true,
    }),
};
