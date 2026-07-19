import { apiFetch } from '@/lib/api';
import type { OrgContext } from '@/types/org';

export const orgApi = {
  context: () => apiFetch<OrgContext>('/org/context'),
};
