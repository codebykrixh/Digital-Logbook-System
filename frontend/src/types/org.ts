export interface OrgUser {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  jobTitle: string | null;
}

export interface OrgContext {
  plant: { id: string; name: string; code: string };
  departments: { id: string; name: string; code: string }[];
  machines: { id: string; name: string; tag: string; status: string }[];
  users: OrgUser[];
  myDepartmentId: string | null;
}
