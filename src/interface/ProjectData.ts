import type { Fabricator, UserData } from "./index";

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
    fabricator?: Fabricator;
    manager?: UserData;
    rfqId?: string;
    CDQuataionID?: string;
    connectionDesignerID?: string;
    projectNumber: string;
    status: "ACTIVE" | "INACTIVE" | "DRAFT" | "ON_HOLD" | "COMPLETED";
    stage: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "IFA" | "IFC" | "CO#";
    tools: "TEKLA" | "SDS2" | "BOTH";
    connectionDesign: boolean;
    rfi?: any[];
    changeOrders?: any;
    submittals?: any[];
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
    files?: File[] | null;
    endDateChangeLog?: string[];
    projectWbs?: any[];
    projectBundles?: any[];
    workedSeconds?: number;
    totalWorkedSeconds?: number;
    isOverrun?: boolean;
}
