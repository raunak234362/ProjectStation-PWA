export interface AuthInterface {
  username: string;
  password: string;
}

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
export interface FabricatorPayload {
  fabName: string;
  website?: string;
  drive?: string;
  files?: File | string | "";
}