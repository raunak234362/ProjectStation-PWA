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

export interface Fabricator {
  id: string;
  fabName: string;
  website: string;
  drive: string;
  files: {
    id: string;
    path: string;
    originalName: string;
  }[];
  branches: any[];
  project: any[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
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
