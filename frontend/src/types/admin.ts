export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  jobTitle: string | null;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  department: { id: string; name: string } | null;
}

export interface AdminDepartment {
  id: string;
  name: string;
  code: string;
  _count: { users: number; machines: number };
}

export interface AdminMachine {
  id: string;
  name: string;
  tag: string;
  type: string | null;
  status: string;
  healthScore: number;
  department: { name: string } | null;
  departmentId: string | null;
}

export interface AdminPlant {
  id: string;
  name: string;
  code: string;
  location: string | null;
  isActive: boolean;
}
