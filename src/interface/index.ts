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
  createdAt: string;
  updatedAt: string;
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
  branches: Branch[];
  project: any[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  pointOfContact?: FabricatorClient[];
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
  members: any[];
  project: any[];
}

export interface TeamMemberPayload {
  teamId: string;
  userId: string;
}

export interface UpdateTeamRolePayload {
  userId: string;
  newRole: string
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
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

//rfq interfaces

export interface FabricatorRef {
  fabName?: string;
}

export interface UserRef {
  email?: string;
  fabricator?: FabricatorRef | null;
}
export interface RfqResponse {
  id: string;
  rfqId: string;
  userId: string;
  parentResponseId: string | null;
  description: string;
  files?: { id: string; originalName: string; url?: string }[];
  link?: string | null;
  createdAt: string;
  status: string;
  wbtStatus?: string;
}



export interface RFQItem {
  id: string;
  projectName: string;
  projectNumber?: string;
  subject: string;
  description?: string;
  senderId?: string;
  recipientId?: string;
  salesPersonId?: string;
  status?: string;
  tools: "TEKLA" | "SDS2" | "BOTH" | "NO_PREFERENCE" | "OTHER";
  createdAt: string | Date;
  sender?: UserRef | null;
  recepients?: UserRef | null;
  bidPrice?: string;
  estimationDate: string;
  connectionDesign: boolean;
  miscDesign: boolean;
  customerDesign: boolean;
  detailingMain: boolean;
  detailingMisc: boolean;
  files?: File[] | string[];
  responses?: RfqResponse[];
}


export interface RFQpayload {
  projectNumber: string;
  projectName: string;
  bidPrice: string | null | " ";
  fabricatorId: string | null | " ";
  senderId: string | " ";
  recipientId: string;
  salesPersonId: string | null | " ";
  subject: string;
  description: string;
  status: boolean
  tools: string;
  wbtStatus: boolean |  any;
  estimationDate: Date | any;
  connectionDesign: boolean;
  customerDesign: boolean;
  detailingMain: boolean;
  detailingMisc: boolean;
  miscDesign: boolean;
  createdById: string;
  files?: File[] | string[];


}
//trail response
export interface RfqResponsePayload {
  rfqId: string;
  userId: string;
  parentResponseId: string | null;
  description: string;
  files?: File[] | string[];
  link?: string | null;
}



export interface Staff {
  id: string;
  f_name: string;
  m_name?: string;
  l_name: string;
  is_sales?: boolean;
  is_superuser?: boolean;
  fabricatorId?: string;
}
export interface FabricatorClient {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}
export interface SelectOption {
  label: string;
  value: string | number;
}

export interface ConnectionDesignerForm {
  connectionDesignerName: string;
  website?: string;
  drive?: string;
  contactInfo?: string;
  email?: string;
  headquater: {
    country: string;
    states: string[];
    city?: string;
  };
}

export interface ConnectionDesigner {
  id: string;
  name: string;
  contactInfo?: string;
  websiteLink?: string;
  CDEngineers?:[]
  email?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  state: string[];
  files?: { id: string; originalName: string }[];
}

export interface EstimationTaskPayload {
  assignedById: string;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  notes?: string;
  reviewNotes?: string;
  estimationId: string;
  assignedToId: string;
  reviewedById?: string;
  files?: any[] | null;
}

// src/interface/estimation.ts

export interface EstimationPayload {
  estimationNumber: string;
  fabricatorName?: string;
  projectName: string;
  description?: string;
  estimateDate: string | Date;   // because React Hook Form passes string from input
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "APPROVED"; // based on your EstimationStatus enum
  assignedById?: string;
  finalHours?: number;
  finalWeeks?: number;
  finalPrice?: number;
  files?: File[] | null;
  rfqId?: string;
  fabricatorId: string;
  tools?: string;
  startDate?: string | Date;
}

export interface AddProjectPayload {
  projectNumber: string;
  name: string;
  description: string;
  fabricatorID: string;
  departmentID: string;
  managerID: string;
  teamID?: string;
  rfqId?: string;
  CDQuataionID?: string;
  connectionDesignerID?: string;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  stage: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "IFA";
  tools: "TEKLA" | "SDS2" | "BOTH";
  connectionDesign: boolean;
  miscDesign: boolean;
  customerDesign: boolean;
  detailingMain: boolean;
  detailingMisc: boolean;
  startDate: string;          
  endDate: string;
  approvalDate: string;
  fabricationDate: string;
  estimatedHours?: number;
  detailCheckingHours?: number;
  detailingHours?: number;
  executionCheckingHours?: number;
  executionHours?: number;
  modelCheckingHours?: number;
  modelingHours?: number;
  mailReminder: boolean;
  submissionMailReminder: boolean;
  files?: File[] | null; // supports direct File objects or a typed File interface
  endDateChangeLog?: string[];
}

// Project Data
export interface ProjectData {
  id: string;
  name: string;
  description: string;
  fabricatorID: string;
  department: {
    id: string;
    name: string;
  };
  managerID: string;
  team?: {
    id: string;
    name: string;
  };
  fabricator?: Fabricator
  manager?: UserData
  rfqId?: string;
  CDQuataionID?: string;
  connectionDesignerID?: string;
  projectNumber: string;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  stage: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "IFA";
  tools: "TEKLA" | "SDS2" | "BOTH";
  connectionDesign: boolean;
  rfi?:any[];
  submittal?:any[];
  miscDesign: boolean;
  customerDesign: boolean;
  detailingMain: boolean;
  detailingMisc: boolean;
  startDate: string;          
  endDate: string;
  approvalDate: string;
  fabricationDate: string;
  estimatedHours?: number;
  detailCheckingHours?: number;
  detailingHours?: number;
  executionCheckingHours?: number;
  executionHours?: number;
  modelCheckingHours?: number;
  modelingHours?: number;
  mailReminder: boolean;
  submissionMailReminder: boolean;
  files?: File[] | null; // supports direct File objects or a typed File interface
  endDateChangeLog?: string[];
}

export interface RFIPayload {
  fabricator_id: string;
  project_id: string;
  recepient_id: string;
  sender_id: string;
  status: boolean;
  subject: string;
  description: string;
  isAproovedByAdmin: string;
  files: File[] | string;

}
export interface RFIResponseFile {
  id: string;
  originalName: string;
  path?: string;   }

export interface RFIResponse {
  id: string;
  rfiId: string;
  userId: string;
  parentResponseId: string | null;
  description: string;
  files?: RFIResponseFile[];
  link?: string | null;
  status?: string;
  createdAt: string;
  childResponses?: RFIResponse[];
}

export interface RFIItem {
  id: string;
  subject: string;
  description?: string;
  senderId?: string;
  sender?: any
  recepient_id?: string;
  recepients?: {
    email?: string;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;} | null;
  fabricator_id?: string;
  fabricator?: { fabName?: string; } | null;
  project_id?: string;
  project?: {name?: string;} | null;
  status?: boolean | string;
  isAproovedByAdmin?: "PENDING" | "APPROVED" | "REJECTED" | string
  createdAt: string | Date;
  updatedAt?: string | Date;
  files: RFIResponseFile[] | string[];
  responses: RFIResponse[];
  date: string;
}
export interface RFIResponseSchema
{
files?: File[] | string[];
// responseState:boolean|null;
wbtStatus?:boolean;
reason:string;
rfiId:string;
parentResponseId:string|null;
}


export interface LineItem {
  id: string;
  description: string;
  unitTime?: number;
  CheckUnitTime?: number;
  checkHr?: number;
  execHr?: number;
  updatedAt?: string;
  QtyNo?: number;
}

export interface WBSData {
  id: string;
  name: string;
  type: string;
  stage: string;
  projectId: string;
  templateKey: string;
  totalCheckHr: number;
  checkHrWithRework: number;
  totalExecHr: number;
  execHrWithRework: number;
  totalQtyNo: number;
  createdAt: string;
  updatedAt: string;
  LineItems?: LineItem[];
}

export interface ProjectNote {
  id: string;
  content: string;
  stage: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  files?: {
    id: string;
    originalName: string;
    path: string;
  }[];
}

export interface CreateProjectNotePayload {
  content: string;
  stage: string;
  projectId: string;
  files?: File[];
}
