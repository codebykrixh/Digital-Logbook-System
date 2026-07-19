export type UserRole = 'OPERATOR' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'DEACTIVATED';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  avatarUrl: string | null;
  jobTitle: string | null;
  createdAt: string;
}

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
}
