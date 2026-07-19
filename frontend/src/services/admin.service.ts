import { apiFetch } from '@/lib/api';
import type { AdminUser, AdminDepartment, AdminMachine, AdminPlant } from '@/types/admin';

export const adminApi = {
  listUsers: (params: { search?: string; role?: string; status?: string } = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
    return apiFetch<AdminUser[]>(`/admin/users${qs ? `?${qs}` : ''}`);
  },
  inviteUser: (values: { firstName: string; lastName: string; email: string; role: string; departmentId?: string; jobTitle?: string }) =>
    apiFetch<AdminUser>('/admin/users/invite', { method: 'POST', body: values }),
  updateUser: (id: string, values: Partial<{ role: string; status: string; departmentId: string | null; jobTitle: string }>) =>
    apiFetch<AdminUser>(`/admin/users/${id}`, { method: 'PATCH', body: values }),
  deactivateUser: (id: string) => apiFetch<null>(`/admin/users/${id}`, { method: 'DELETE' }),

  listDepartments: () => apiFetch<AdminDepartment[]>('/admin/departments'),
  createDepartment: (values: { name: string; code: string }) =>
    apiFetch<AdminDepartment>('/admin/departments', { method: 'POST', body: values }),
  updateDepartment: (id: string, values: Partial<{ name: string; code: string }>) =>
    apiFetch<AdminDepartment>(`/admin/departments/${id}`, { method: 'PATCH', body: values }),
  removeDepartment: (id: string) => apiFetch<null>(`/admin/departments/${id}`, { method: 'DELETE' }),

  listMachines: () => apiFetch<AdminMachine[]>('/admin/machines'),
  createMachine: (values: { name: string; tag: string; type?: string; departmentId?: string }) =>
    apiFetch<AdminMachine>('/admin/machines', { method: 'POST', body: values }),
  updateMachine: (id: string, values: Partial<{ name: string; tag: string; status: string; departmentId: string | null; healthScore: number }>) =>
    apiFetch<AdminMachine>(`/admin/machines/${id}`, { method: 'PATCH', body: values }),
  removeMachine: (id: string) => apiFetch<null>(`/admin/machines/${id}`, { method: 'DELETE' }),

  listPlants: () => apiFetch<AdminPlant[]>('/admin/plants'),
  updatePlant: (id: string, values: Partial<{ name: string; location: string; isActive: boolean }>) =>
    apiFetch<AdminPlant>(`/admin/plants/${id}`, { method: 'PATCH', body: values }),
};
