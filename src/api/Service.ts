/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-toastify";
import type {
  DepartmentPayload,
  EditEmployeePayload,
  EmployeePayload,
  FabricatorPayload,
  TeamMemberPayload,
  TeamPayload,
  UpdateTeamRolePayload,
  CreateLineItemGroupPayload,
} from "../interface";
import api from "./api";
class Service {
  //Get Logged-In User Detail
  static async GetUserByToken() {
    try {
      const response = await api.get(`user/me`);
      console.log("Signed In User detail-", response);
      return response.data;
    } catch (error) {
      //alert(error);
      console.log("Error while fetching logged-in user Detail", error);
    }
  }

  // Update employee
  static async UpdateEmployee(id: string, employeeData: EmployeePayload) {
    try {
      const response = await api.put(`employee/${id}`, employeeData);
      console.log(response);
      return response?.data;
    } catch (error) {
      //alert(error);
      console.log("Error while updating Employee", error);
    }
  }

  //Add New Employee
  static async AddEmployee(employeeData: EmployeePayload) {
    try {
      const response = await api.post(`employee`, employeeData);
      console.log(response);
      return response?.data;
    } catch (error) {
      //alert(error);
      console.log("Error while adding New User", error);
    }
  }

  //Fetch All Employee
  static async FetchAllEmployee() {
    try {
      const response = await api.get(`employee`);
      console.log(response);
      return response.data;
    } catch (error) {
      //alert(error);
      console.log("Error fetching all Employee", error);
      console.log("Error fetching all Employee", error);
    }
  }
  //Fetch Employee by ROLE
  static async FetchEmployeeByRole(role: string) {
    try {
      const response = await api.get(`employee/role/${role}`);
      console.log(response);
      return response.data;
    } catch (error) {
      // //alert(error);
      console.log("Error fetching all Employee", error);
    }
  }

  // Fetch Employee by ID
  static async FetchEmployeeByID(id: string) {
    try {
      const response = await api.get(`employee/${id}`);
      console.log(response);
      return response.data;
    } catch (error) {
      //alert(error);
      console.log("Error fetching Employee by ID", error);
      console.log("Error fetching Employee by ID", error);
    }
  }

  //Edit Employee By ID
  static async EditEmployeeByID(id: string, data: EditEmployeePayload) {
    try {
      const response = await api.put(`employee/update/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      //alert(error);
      console.log("Error fetching Employee by ID", error);
      console.log("Error fetching Employee by ID", error);
    }
  }

  //Add Department
  static async AddDepartment(departmentData: DepartmentPayload) {
    try {
      const response = await api.post(`department`, departmentData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response?.data;
    } catch (error) {
      //alert(error);
      console.log("Error while adding New User", error);
    }
  }
  //All Departments
  static async AllDepartments() {
    try {
      const response = await api.get(`department`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      //alert(error);
      console.log("Error fetching all Employee", error);
      console.log("Error fetching all Employee", error);
    }
  }

  // Fetch Department by ID
  static async FetchDepartmentByID(id: string) {
    try {
      const response = await api.get(`department/department/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      //alert(error);
      console.log("Error fetching Employee by ID", error);
      console.log("Error fetching Employee by ID", error);
    }
  }

  //Edit Department
  static async EditDepartment(id: string, departmentData: DepartmentPayload) {
    try {
      const response = await api.put(
        `department/department/${id}`,
        departmentData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log(response);
      return response?.data;
    } catch (error) {
      //alert(error);
      console.log("Error editing Department", error);
    }
  }

  // Add team
  static async AddTeam(teamDataPayload: TeamPayload) {
    try {
      const response = await api.post(`team`, teamDataPayload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log(response?.data);
      toast.success("Successfully added Team");
    } catch (error) {
      //alert(error);
      console.log("Error adding team", error);
    }
  }

  // Fetch All Team
  static async AllTeam() {
    try {
      const response = await api.get(`team`);
      console.log(response?.data);
      return response?.data;
    } catch (error) {
      //alert(error);
      console.log("Error Fetching All Team", error);
      console.log("Error Fetching All Team", error);
    }
  }

  //Fetch team by Id
  static async GetTeamByID(id: string) {
    try {
      const response = await api.get(`team/${id}`);
      console.log(response?.data);
      return response?.data;
    } catch (error) {
      //alert(error);
      console.log("Error Fetching All Team", error);
    }
  }

  // Add Team Members
  static async AddTeamMembers(role: string, data: TeamMemberPayload) {
    try {
      const response = await api.post(`team/addMembers/${role}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response?.data);
      return response?.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Update role of Team Member
  static async UpdateTeamMemberRole(
    teamId: string,
    MemberData: UpdateTeamRolePayload,
  ) {
    try {
      const response = await api.put(`team/updateRole/${teamId}`, MemberData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response?.data);
      return response?.data;
    } catch (error) {
      console.log(error);
      console.log("Error Fetching All Team", error);
    }
  }

  // Add fabricator
  static async AddFabricator(fabricatorData: FormData | FabricatorPayload) {
    try {
      const response = await api.post(`fabricator`, fabricatorData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(" Fabricator API Response:", response);
      return response.data;
    } catch (error) {
      console.error(" Error while adding New Fabricator:", error);
      throw error;
    }
  }

  static async GetAllFabricators() {
    try {
      const response = await api.get(`fabricator/all`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      // console.log(" All Fabricators fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find fabricators", error);
    }
  }

  // Fetch Fabricator by ID
  static async GetFabricatorByID(id: string) {
    try {
      const response = await api.get(`fabricator/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" Fabricator fetched by ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find fabricators", error);
    }
  }

  // Update Fabricator by ID
  static async EditFabricatorByID(id: string, data: FormData) {
    try {
      const response = await api.put(`fabricator/update/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Fabricators Edited:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot edit fabricator", error);
    }
  }

  // Delete Fabricator by ID
  static async DeleteFabricator(id: string) {
    try {
      const response = await api.delete(`fabricator/${id}`);
      console.log("Fabricator deleted:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot delete fabricator", error);
    }
  }

  // Add branch by Fabricator ID
  static async AddBranchByFabricator(data: any) {
    try {
      const response = await api.post(`fabricator/branch`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All Fabricators fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find fabricators", error);
    }
  }

  // Add Client by Fabricator ID
  static async AddClientByFabricator(fabricatorId: string, data: any) {
    try {
      const response = await api.post(`client/${fabricatorId}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" Client added by Fabricator ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find fabricators", error);
    }
  }

  // Fetch All Clients by Fabricator ID
  static async FetchAllClientsByFabricatorID(fabricatorId: string) {
    try {
      const response = await api.get(`client/byFabricator/${fabricatorId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All Clients fetched by Fabricator ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find clients", error);
    }
  }

  // Fetch Client by ID
  static async FetchClientByID(clientID: string) {
    try {
      const response = await api.get(`client/byFabricator/${clientID}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All Clients fetched by Fabricator ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find clients", error);
    }
  }

  //Add new RFQ
  static async addRFQ(formData: FormData) {
    const response = await api.post(`rfq`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  //Fetch All RFQ
  static async getAllRFQ() {
    try {
      const response = await api.get(`rfq/all`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All RFQ fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfqs", error);
    }
  }

  //Fetch RFQ by ID
  static async FetchRFQByID(rfqId: string) {
    try {
      const response = await api.get(`rfq/${rfqId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All Data fetched by RFQ id:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfqs", error);
    }
  }

  // api for sents :
  static async RfqSent() {
    try {
      const response = await api.get(`rfq/sents`);
      console.log(" RFQ sents:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfqs", error);
    }
  }

  //api for recieved:
  static async RFQRecieved() {
    try {
      const response = await api.get(`rfq/received`);

      // console.log("  RFQ received:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfqs", error);
    }
  }
  //getting rfqbyID

  static async GetRFQbyId(rfqId: string) {
    try {
      const response = await api.get(`rfq/getById/${rfqId}`);
      console.log(" All rfq fetched by rfq ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfq", error);
    }
  }

  // Update RFQ by ID
  static async UpdateRFQById(rfqId: string, data: any) {
    try {
      const response = await api.put(`rfq/update/${rfqId}`, data);
      console.log("RFQ updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot update rfq", error);
    }
  }
  //rfq for route for adding the connection engineers

  static async getConnectionEngineerQuotation() {
    try {
      const response = await api.get(`rfq/connectionEngineers`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Connection Engineer :", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot get connection engineer", error);
    }
  }

  // Add Connection Designer Quotation Response
  static async addConnectionDesignerQuotation(formData: FormData) {
    try {
      const response = await api.post(`rfq/connectionDesignerQuota`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Connection Designer Quotation added:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot add connection designer quotation", error);
      throw error;
    }
  }

  // Get all quotations for an RFQ
  static async getQuotationsByRFQ(rfqId: string) {
    try {
      const response = await api.get(
        `connectionDesignerQuota/${rfqId}/quotations`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log("Quotations fetched for RFQ:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot get quotations", error);
    }
  }

  // Add reply to quotation response
  static async addQuotationReply(formData: FormData, quotationId: string) {
    try {
      const response = await api.post(
        `connectionDesignerQuota/${quotationId}/replies`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log("Quotation reply added:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot add quotation reply", error);
      throw error;
    }
  }

  //Delete RFQ by ID
  static async DeleteRFQById(rfqId: string) {
    const response = await api.delete(`rfq/${rfqId}`);
    console.log("RFQ deleted:", response.data);
    return response.data;
  }
  //RESPONSES
  //response post request

  static async addResponse(formData: FormData, responseId: string) {
    const response = await api.post(`rfq/${responseId}/responses`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  //Add Vendor
  static async AddVendor(data: FormData | any) {
    console.log(data);

    try {
      const response = await api.post(`vendors/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //Fetch All Vendor
  static async FetchAllVendor() {
    try {
      const response = await api.get(`vendors/all`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All vendor fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find vendor", error);
    }
  }

  //Fetch Vendor By ID
  static async FetchVendorByID(id: string) {
    try {
      const response = await api.get(`vendors/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All vendor fetched by vendor ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find vendor", error);
    }
  }

  //Update Vendor By ID
  static async UpdateVendorByID(id: string, data: any) {
    try {
      const response = await api.put(`vendors/update/${id}`, data);
      console.log("Vendor updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot update vendor", error);
    }
  }

  //Delete Vendor By ID
  static async DeleteVendorByID(id: string) {
    try {
      const response = await api.delete(`vendors/id/${id}`);
      console.log("Vendor deleted:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot delete vendor", error);
    }
  }

  //Add Connection Designer
  static async AddConnectionDesigner(data: FormData | any) {
    console.log(data);

    try {
      const response = await api.post(`connectionDesign`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Fetch All Connection Designer
  static async FetchAllConnectionDesigner() {
    try {
      const response = await api.get(`connectionDesign/all`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  // Fetch Connection Designer By ID
  static async FetchConnectionDesignerByID(id: string) {
    try {
      const response = await api.get(`connectionDesign/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  // Fetch Connection Designer By ID
  static async FetchConnectionQuotationByDesignerID(id: any) {
    try {
      const response = await api.get(`connectionDesignerQuota/designer/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // fgetch connectiondesigner All quotatioN
  static async FetchAllConnectionQuotation() {
    try {
      const response = await api.get(`rfq/connectionEngineers`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  // Update Connection Designer By ID
  static async UpdateConnectionDesignerByID(id: string, data: FormData | any) {
    try {
      const response = await api.put(`connectionDesign/update/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  // Add Estimation
  static async AddEstimation(formData: FormData) {
    try {
      const response = await api.post(`estimation/estimations`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  // Add Estimation
  static async AllEstimation() {
    try {
      const response = await api.get(`estimation/estimations`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  // Get Estimation By ID
  static async GetEstimationById(id: string) {
    try {
      const response = await api.get(`estimation/estimations/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Update Estimation By ID
  static async UpdateEstimationById(id: string, data: any) {
    try {
      const response = await api.put(`estimation/estimations/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Add Estimation Task
  static async AddEstimationTask(formData: FormData) {
    try {
      const response = await api.post(`estimation/estimation-tasks`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Estimation Task For Assignee
  static async GetEstimationTaskForAssignee() {
    try {
      const response = await api.get(`estimation/estimation-tasks/my`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Get all assigned estimation task
  static async GetAllAssignedEstimationTask() {
    try {
      const response = await api.get(`estimation/estimation-tasks/my/all`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Get Estimation Task By ID
  static async GetEstimationTaskById(id: string) {
    try {
      const response = await api.get(`estimation/estimation-tasks/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //Estimation Task Start by ID
  static async StartEstimationTaskById(id: string) {
    try {
      const response = await api.post(`task/EST/start/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //Estimation Task Pause By ID
  static async PauseEstimationTaskById(id: string, data: any) {
    try {
      const response = await api.patch(`task/EST/pause/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //Estimation Task Resume By ID
  static async ResumeEstimationTaskById(id: string) {
    try {
      const response = await api.post(`task/EST/resume/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //Estimation Task End by ID
  static async EndEstimationTaskById(id: string, data: any) {
    try {
      const response = await api.post(`task/EST/end/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Summary Estimation Task By ID
  static async SummaryEstimationTaskById(id: string) {
    try {
      const response = await api.get(`task/EST/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Line Item Group
  static async CreateLineItemGroup(data: CreateLineItemGroupPayload) {
    try {
      const response = await api.post(`estimation/line-items`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //fetch Group by ID
  static async FetchGroupById(id: string) {
    try {
      const response = await api.get(`estimation/line-items/group/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //update Group by ID
  static async UpdateGroupById(id: string, data: any) {
    try {
      const response = await api.put(`estimation/line-items/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //fetch Line item group
  static async FetchLineItemGroup(id: string) {
    try {
      const response = await api.get(`estimation/line-items/groups/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //fetch Line item group List
  static async FetchLineItemGroupList(id: string) {
    try {
      const response = await api.get(`estimation/line-items/Bygroup/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //Update Line Item By ID
  static async UpdateLineItemById(id: string, data: any) {
    try {
      const response = await api.put(
        `estimation/line-items/update/${id}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // add new Line Item
  static async AddLineItem(data: any) {
    try {
      const response = await api.post(`estimation/line-items/item`, data);
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  // Add Group
  static async AddGroup(data: any) {
    try {
      const response = await api.post(`chat/group/`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" Group added", response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Add Project
  static async AddProject(formData: FormData) {
    try {
      const response = await api.post(`project/projects`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Get All Projects
  static async GetAllProjects() {
    try {
      const response = await api.get(`project/projects`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      // console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Get Project By ID
  static async GetProjectById(id: string) {
    try {
      const response = await api.get(`project/projects/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Get Project Overall Dashboard
  static async GetProjectOverallDashboard(id: string, stage: string) {
    try {
      const response = await api.get(`project/${id}/dashboard/${stage}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Edit Project By ID
  static async EditProjectById(id: string, data: any) {
    try {
      const response = await api.put(`project/projects/${id}`, data);
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Add Project Milestone
  static async AddProjectMilestone(data: any) {
    try {
      const response = await api.post(`mileStone/`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Get Project Milestone By ID
  static async GetProjectMilestoneById(id: string) {
    try {
      const response = await api.get(`mileStone/project/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //Get mileston by ID
  static async GetMilestoneById(id: string) {
    try {
      const response = await api.get(`mileStone/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //Fetch WBS-Template
  static async GetWBSTemplate() {
    try {
      const response = await api.get(`project/wbs/bundles`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // fetch bundle by ProjectID
  static async GetBundleByProjectId(projectId: string) {
    try {
      const response = await api.get(`project/projects/${projectId}/bundles`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //fetch the line item from the wbsID
  static async GetWBSLineItem(wbsId: string) {
    try {
      const response = await api.get(
        `project/project-wbs/${wbsId}/line-items`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // patch the LineItem
  static async UpdateLineItem(id: string, data: any) {
    try {
      const response = await api.patch(`project/line-items/${id}/`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //Add WBS Template
  static async AddWBSTemplate(data: any) {
    try {
      const response = await api.post(`project/wbs-templates`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //add wbs from wbs template by project id
  static async AddWBSFromTemplate(projectId: string, wbsData: any) {
    try {
      const response = await api.post(
        `project/projects/${projectId}/wbs/expand`,
        wbsData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Add WBS in Project
  static async AddWBSInProject(projectId: string) {
    try {
      const response = await api.post(
        `project/projects/${projectId}/wbs
`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Get WBS By Project ID
  static async GetWBSByProjectId(projectId: string) {
    try {
      const response = await api.get(`project/projects/${projectId}/wbs`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Get WBS By ID
  static async GetWBSLineItemById(
    projectId: string,
    id: string,
    stage: string,
  ) {
    try {
      const response = await api.get(
        `project/projects/${projectId}/stages/${stage}/wbs/${id}/line-items`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Update WBS line-item by ProjectId, wbsId and line-item ID
  static async UpdateWBSLineItem(
    projectId: string,
    lineItemId: string,
    data: any,
  ) {
    try {
      const response = await api.patch(
        `project/projects/${projectId}/line-items/${lineItemId}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Fetch All Chats
  static async AllChats() {
    try {
      const response = await api.get(`chat/recent`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All Fabricators fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find fabricators", error);
    }
  }

  // Add Group Members
  static async AddGroupMembers(data: any) {
    try {
      const response = await api.post(`chat/group/members`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" Group members added", response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Fetch Group Members
  static async GetGroupMembers(groupId: string) {
    try {
      const response = await api.get(`chat/group/${groupId}/members`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" Group members fetched", response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Delete Group Member
  static async DeleteGroupMember(groupId: string, memberId: string) {
    try {
      const response = await api.delete(
        `chat/group/${groupId}/member/${memberId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log(" Group member deleted", response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Get Project Notes
  static async GetProjectNotes(projectId: string) {
    try {
      const response = await api.get(`project/projects/${projectId}/notes`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" Project notes fetched", response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Create Project Note
  static async CreateProjectNote(projectId: string, data: FormData) {
    try {
      const response = await api.post(
        `project/projects/${projectId}/notes`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log(" Project note created", response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Delete Group------------------------------------------------
  static async DeleteGroup(groupId: string) {
    try {
      const response = await api.delete(`chat/group/${groupId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Group deleted", response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Fetch Chats by Group ID
  static async ChatByGroupID(groupId: string, lastId?: string | undefined) {
    console.log(lastId);

    try {
      // lastId is optional so handle it properly
      // const url = lastId
      //   ? `chat/group/${groupId}/history/${lastId}`
      //   : `chat/group/${groupId}/history`;
      const url = `chat/group/${groupId}/history/${lastId}`;

      const response = await api.get(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Chats by Group ID fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("Cannot find chats by group ID", error);
      throw error;
    }
  }

  //RFI components
  //Add new RFI----------------------------------------------------
  static async addRFI(formData: FormData) {
    const response = await api.post(`rfi`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  //pending RFIs
  static async pendingRFIs() {
    try {
      const response = await api.get(`rfi/pendingRFIs`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("pending RFIs:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find pending RFIs", error);
    }
  }

  static async RfiSent() {
    try {
      const response = await api.get(`rfi/sents`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" RFI sents:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfIs", error);
    }
  }

  static async RfiRecieved() {
    try {
      const response = await api.get(`rfi/received`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("  RFI received:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfi's", error);
    }
  }
  static async GetRFIbyId(rfiId: string) {
    try {
      const response = await api.get(`rfi/getById/${rfiId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All rfi fetched by rfi ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfi", error);
    }
  }
  static async EditRFIByID(id: string, data: FormData) {
    try {
      const response = await api.put(`rfi/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("RFI Edited:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find RFI", error);
    }
  }
  //RFI responses
  static async addRFIResponse(formData: FormData, responseId: string) {
    const response = await api.post(`rfi/${responseId}/responses`, formData);

    return response.data;
  }

  static async GetRFIResponsebyId(rfiId: string) {
    try {
      const response = await api.get(`rfi/responses/${rfiId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All rfq fetched by rfq ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfq", error);
    }
  }
  //submitals route ----------------------------------------------
  static async AddSubmittal(formData: FormData) {
    try {
      const response = await api.post(`submittal/`, formData);
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //pending submittals
  static async PendingSubmittal() {
    try {
      const response = await api.get(`submittal/pendingSubmittal`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("cannot find submittals", error);
    }
  }

  //All Submitals
  static async SubmittalSent() {
    try {
      const response = await api.get(`submittal/sent`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("cannot find submittals", error);
    }
  }

  static async SubmittalRecieved() {
    try {
      const response = await api.get(`submittal/received`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("cannot find submittal's", error);
    }
  }
  static async GetSubmittalbyId(Id: string) {
    try {
      const response = await api.get(`submittal/${Id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("cannot find submittal", error);
    }
  }
  //submittal responses
  static async addSubmittalResponse(formData: FormData) {
    try {
      const response = await api.post(`submittal/responses`, formData);
      return response.data;
    } catch (error) {
      console.error("cannot add submittal response", error);
    }
  }
  static async GetSubmittalResponsebyId(subId: string) {
    try {
      const response = await api.get(`submittal/responses/${subId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All submittals fetched by sub ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find sub", error);
    }
  }

  //change Order ---------------------------------------------
  static async ChangeOrder(formData: FormData) {
    try {
      const response = await api.post(`changeOrder/`, formData);
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // pending Co
  static async PendingCo() {
    try {
      const response = await api.get(`changeOrder/pendingCOs`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" Pending Co:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find Co", error);
    }
  }

  static async GetChangeOrder(projectId: string) {
    try {
      const response = await api.get(`changeOrder/project/${projectId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All Co fetched by projectID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find CO", error);
    }
  }

  // Get change order by iD
  static async GetChangeOrderById(id: string) {
    try {
      const response = await api.get(`changeOrder/byId/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All Co fetched by ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find CO", error);
    }
  }

  //update Co
  static async EditCoById(id: string, data: FormData) {
    try {
      const response = await api.put(`changeOrder/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("co Edited:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find CO", error);
    }
  }
  //response routes
  static async addCOResponse(formData: FormData, responseId: string) {
    const response = await api.post(
      `changeOrder/${responseId}/responses`,
      formData,
    );

    return response.data;
  }

  // Change Order Table Methods
  static async GetAllCOTableRows(coId: string) {
    try {
      const response = await api.get(`changeOrder/${coId}/table`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching CO table rows:", error);
    }
  }

  static async addCOTable(data: any, coId: string) {
    try {
      const response = await api.post(`changeOrder/${coId}/table`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error saving CO table:", error);
      throw error;
    }
  }

  //Add Task
  static async AddTask(data: any) {
    console.log(data);
    try {
      const response = await api.post(`task/`, data);
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // update task by ID
  static async UpdateTaskById(id: string, data: any) {
    try {
      const response = await api.put(`task/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //Get All Task
  static async GetAllTask() {
    try {
      const response = await api.get(`task/getAllTasks`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All Task fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find Task", error);
    }
  }
  //Get All Task
  static async GetMyTask() {
    try {
      const response = await api.get(`task/user/tasks`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All Task fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find Task", error);
    }
  }

  //non-completed-tasks
  static async GetNonCompletedTasks() {
    try {
      const response = await api.get(`task/user/non-completed-tasks`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All Task fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find Task", error);
    }
  }

  //Get Task by ID
  static async GetTaskById(id: string) {
    try {
      const response = await api.get(`task/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All Task fetched by ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find Task", error);
    }
  }

  //Task Start
  static async TaskStart(id: string) {
    try {
      const response = await api.post(
        `task/start/${id}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log(" Task started by ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot start Task", error);
    }
  }

  //Task Resume
  static async TaskResume(id: string) {
    try {
      const response = await api.post(
        `task/resume/${id}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log(" Task resumed by ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot resume Task", error);
    }
  }

  //Task Pause
  static async TaskPause(id: string, data: any) {
    try {
      const response = await api.patch(`task/pause/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" Task paused by ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot pause Task", error);
    }
  }

  //Task End
  static async TaskEnd(id: string, data: any) {
    try {
      const response = await api.post(`task/end/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" Task ended by ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot end Task", error);
    }
  }

  // Get User Stats
  static async getUsersStats(userId: string) {
    try {
      const response = await api.get(`task/user/stats/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for user ${userId}:`, error);
      throw error;
    }
  }

  // Add Bank Account
  static async AddBankAccount(data: any) {
    try {
      const response = await api.post(`invoice/account`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Bank account added:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error adding bank account:", error);
      throw error;
    }
  }

  // Add Invoice
  static async AddInvoice(data: any) {
    try {
      const response = await api.post(`invoice/create`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Invoice added:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error adding invoice:", error);
      throw error;
    }
  }

  // Get Invoice
  static async GetInvoiceById(id: string) {
    try {
      const response = await api.get(`invoice/byId/${id}`);
      console.log("Invoice fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching invoice:", error);
      throw error;
    }
  }

  // all Invoice
  static async GetAllInvoice() {
    try {
      const response = await api.get(`invoice/AllInvoices`);
      console.log("Invoice fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching invoice:", error);
      throw error;
    }
  }

  //get bank accounts
  static async GetBankAccounts() {
    try {
      const response = await api.get(`invoice/accounts/all`);
      // console.log("Bank accounts fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      throw error;
    }
  }

  //get bank account by ID
  static async GetBankAccountById(id: string) {
    try {
      const response = await api.get(`invoice/account/${id}`);
      console.log("Bank account fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching bank account:", error);
      throw error;
    }
  }

  //Dashboard Data
  static async GetDashboardData() {
    try {
      const response = await api.get(`dashBoardData/`);
      console.log("Dashboard data fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }

  // upcomping submittal
  static async GetPendingSubmittal() {
    try {
      const response = await api.get(`mileStone/pendingSubmittals`);
      console.log("Upcoming submittal fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching upcoming submittal:", error);
      throw error;
    }
  }

  //upcoming rfi
  static async ClientAdminPendingSubmittals() {
    try {
      const response = await api.get(`mileStone/pendingSubmittals/clientAdmin`);
      console.log("Upcoming RFI fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching upcoming RFI:", error);
      throw error;
    }
  }

  // Create Share Link
  static async createShareLink(
    table: string,
    parentId: string | undefined,
    fileId: string | undefined,
  ) {
    try {
      const response = await api.post(`share/${table}/${parentId}/${fileId}`);
      return response.data;
    } catch (error) {
      console.error("Error creating share link:", error);
      throw error;
    }
  }

  // ===========================================================
  // DESIGN DRAWINGS SERVICES
  // ===========================================================

  // Create new Design Drawing
  static async CreateDesignDrawing(data: FormData) {
    try {
      const response = await api.post(`design-drawings`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating design drawing:", error);
      throw error;
    }
  }

  // Update stage / description of a Design Drawing
  static async UpdateDesignDrawing(id: string, data: FormData) {
    try {
      const response = await api.put(`design-drawings/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating design drawing:", error);
      throw error;
    }
  }

  // Get all Design Drawings (Admin)
  static async GetAllDesignDrawings() {
    try {
      const response = await api.get(`design-drawings`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all design drawings:", error);
      throw error;
    }
  }

  // Get Design Drawings by Project ID
  static async GetDesignDrawingsByProjectId(projectId: string) {
    try {
      const response = await api.get(`design-drawings/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching design drawings by project ID:", error);
      throw error;
    }
  }

  // Get a single Design Drawing by ID
  static async GetDesignDrawingById(id: string) {
    try {
      const response = await api.get(`design-drawings/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching design drawing by ID:", error);
      throw error;
    }
  }

  // Delete a Design Drawing
  static async DeleteDesignDrawing(id: string) {
    try {
      const response = await api.delete(`design-drawings/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting design drawing:", error);
      throw error;
    }
  }

  // Get file metadata (from Design Drawing)
  static async GetDesignDrawingFileMetadata(designId: string, fileId: string) {
    try {
      const response = await api.get(
        `design-drawings/${designId}/files/${fileId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching design drawing file metadata:", error);
      throw error;
    }
  }

  // Stream file (from Design Drawing)
  static async ViewDesignDrawingFile(designId: string, fileId: string) {
    try {
      const response = await api.get(
        `design-drawings/viewFile/${designId}/${fileId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error viewing design drawing file:", error);
      throw error;
    }
  }
  // Get Analytics Score
  static async GetAnalyticsScore(data?: any) {
    try {
      const response = await api.get(`analytics/score`, { params: data });
      return response.data;
    } catch (error) {
      console.error("Error fetching analytics score:", error);
      throw error;
    }
  }
  //client dashboard data routes.
  static async DashboardData() {
    try {
      const response = await api.get(`dashBoardData/clientAdmin`);
      console.log("Client Dashboard Data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }
  // INVOICE DASHBOARD DATA
  static async InvoiceDashboardData() {
    try {
      const response = await api.get(`invoice/pending/fabricator`);
      console.log("Invoice Dashboard Data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching invoice dashboard data:", error);
      throw error;
    }
  }
  //dashboard milestone
  static async DashboardMilestone() {
    try {
      const response = await api.get(`milestone/pendingSubmittals/clientAdmin`);
      console.log("Dashboard Milestone Data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard milestone:", error);
      throw error;
    }
  }
  static async Notifications() {
    try {
      const response = await api.get(`notifications`);
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  static async MarkNotificationAsRead(id: string) {
    try {
      const response = await api.patch(`notifications/read/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // ==================== MEETINGS API ====================

  // Create a new meeting
  static async CreateMeeting(data: any) {
    try {
      const response = await api.post(`meetings`, data);
      console.log("Meeting created:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating meeting:", error);
      throw error;
    }
  }

  // Record attendance for a meeting
  static async RecordAttendance(data: any) {
    try {
      const response = await api.post(`meetings/attendance`, data);
      console.log("Attendance recorded:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error recording attendance:", error);
      throw error;
    }
  }

  // Get attendance history
  static async GetAttendanceHistory() {
    try {
      const response = await api.get(`meetings/attendance/history`);
      console.log("Attendance history:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      throw error;
    }
  }

  // Add participants to a meeting
  static async AddMeetingParticipants(data: any) {
    try {
      const response = await api.post(`meetings/participants`, data);
      console.log("Participants added:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error adding participants:", error);
      throw error;
    }
  }

  // Delete a participant from a meeting
  static async DeleteMeetingParticipant(attendeeId: string) {
    try {
      const response = await api.delete(`meetings/participants/${attendeeId}`);
      console.log("Participant deleted:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting participant:", error);
      throw error;
    }
  }

  // Update a participant in a meeting
  static async UpdateMeetingParticipant(attendeeId: string, data: any) {
    try {
      const response = await api.put(
        `meetings/participants/${attendeeId}`,
        data,
      );
      console.log("Participant updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating participant:", error);
      throw error;
    }
  }

  // Get meeting status count
  static async GetMeetingStatusCount() {
    try {
      const response = await api.get(`meetings/status/count`);
      console.log("Meeting status count:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching meeting status count:", error);
      throw error;
    }
  }

  // Get current user's meetings
  static async GetMyMeetings() {
    try {
      const response = await api.get(`meetings/user/me`);
      console.log("My meetings:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching my meetings:", error);
      throw error;
    }
  }

  // Get current user's past meetings
  static async GetMyPastMeetings() {
    try {
      const response = await api.get(`meetings/user/me/past`);
      console.log("My past meetings:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching my past meetings:", error);
      throw error;
    }
  }

  // Get current user's upcoming meetings
  static async GetMyUpcomingMeetings() {
    try {
      const response = await api.get(`meetings/user/me/upcoming`);
      console.log("My upcoming meetings:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching my upcoming meetings:", error);
      throw error;
    }
  }

  // View a file from a meeting
  static async ViewMeetingFile(meetingId: string, fileId: string) {
    try {
      const response = await api.get(
        `meetings/viewFile/${meetingId}/${fileId}`,
      );
      console.log("Meeting file:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error viewing meeting file:", error);
      throw error;
    }
  }

  // Delete a meeting by ID
  static async DeleteMeeting(id: string) {
    try {
      const response = await api.delete(`meetings/${id}`);
      console.log("Meeting deleted:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting meeting:", error);
      throw error;
    }
  }

  // Get a meeting by ID
  static async GetMeetingById(id: string) {
    try {
      const response = await api.get(`meetings/${id}`);
      console.log("Meeting details:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching meeting by ID:", error);
      throw error;
    }
  }

  // Update a meeting by ID
  static async UpdateMeeting(id: string, data: any) {
    try {
      const response = await api.put(`meetings/${id}`, data);
      console.log("Meeting updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating meeting:", error);
      throw error;
    }
  }

  // Update meeting status
  static async UpdateMeetingStatus(id: string, data: any) {
    try {
      const response = await api.patch(`meetings/${id}/status`, data);
      console.log("Meeting status updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating meeting status:", error);
      throw error;
    }
  }

  // Get meeting summary
  static async GetMeetingSummary(id: string) {
    try {
      const response = await api.get(`meetings/${id}/summary`);
      console.log("Meeting summary:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching meeting summary:", error);
      throw error;
    }
  }

  // Get attendance for a specific meeting
  static async GetMeetingAttendance(meetingId: string) {
    try {
      const response = await api.get(`meetings/${meetingId}/attendance`);
      console.log("Meeting attendance:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching meeting attendance:", error);
      throw error;
    }
  }

  // Get a specific file from a meeting
  static async GetMeetingFileById(meetingId: string, fileId: string) {
    try {
      const response = await api.get(`meetings/${meetingId}/files/${fileId}`);
      console.log("Meeting file:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching meeting file:", error);
      throw error;
    }
  }

  // Update RSVP for a meeting
  static async UpdateMeetingRSVP(meetingId: string, data: any) {
    try {
      const response = await api.patch(`meetings/${meetingId}/rsvp`, data);
      console.log("RSVP updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating RSVP:", error);
      throw error;
    }
  }
}
export default Service;
