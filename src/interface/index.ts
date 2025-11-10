/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AuthInterface {
  username: string;
  password: string;
}

export type Role = "ADMIN" | "STAFF" | "DEPT_MANAGER" | string;

// Signed-in User Data Interface
export interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  phone: string;
  landline: string | null;
  altLandline: string | null;
  altPhone: string | null;
  designation: string;
  city: string;
  zipCode: string;
  state: string;
  country: string;
  address: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "EMPLOYEE" | string; // extendable
  departmentId: string;
  isActive: boolean;
  branchId?: string;
  isFirstLogin: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// Adding Employee Payload Interface
export interface EmployeePayload {
  username: string;
  password: string;
  email: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  phone: string;
  branchId?: string;
  designation: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "EMPLOYEE" | string;
  departmentId: string;
}

export interface EditEmployeePayload {
  username?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  altPhone?: string;
  designation?: string;
  role?: "ADMIN" | "STAFF" | "MANAGER" | "INTERN";
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  landline?: string;
  altLandline?: string;
}

export interface Department {
  id?: string;
  name?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  managerIds?:
    | string
    | []
    | {
        firstName?: string;
        lastName?: string;
        middleName?: string;
      };
}

export interface DepartmentPayload {
  name?: string;
  managerIds?: string[] | [];
}
export interface FabricatorPayload {
  fabName: string;
  website?: string;
  drive?: string;
  files?: File | string | "";
}
export interface FabricatorEditPayload {
  fabName: string;
  website?: string;
  drive?: string;
  files?: File | [] | "";
}

// ↓ New Branch Interface
export interface Branch {
  id?: string;
  fabricatorId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  branchId?: string;
  email: string;
  isHeadquarters: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Updated Fabricator Interface
export interface Fabricator {
  id: string;
  fabName: string;
  website: string;
  drive: string;
  files: File[] | [];
  branches: Branch[]; // ✅ Updated
  project: any[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Manager {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface TeamPayload {
  name: string;
  managerID?: string | string[] | [];
  departmentID?: string;
}

export interface Team {
  id: string;
  name: string;
  managerID: string;
  departmentID: string;
  isDeleted: boolean;
  manager: Manager;
  department: Department;
  members: any[]; // You can type this better if needed
  project: any[];
}

export interface TeamMemberPayload {
  teamId: string;
  userId: string;
}

export interface UpdateTeamRolePayload{
  userId:string;
  newRole:string
}

export interface User {
  id: string;
  f_name: string;
  l_name: string;
  role?: Role;
}

export interface Group {
  id: string;
  name: string;
}

export interface ChatItem {
  id: string;
  group: Group;
  lastMessage?: string;
  updatedAt: string;
  unread?: number;
}

export interface Message {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isTagged?: boolean;
  sender?: User;
}

export interface SocketMessage {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isTagged?: boolean;
}
