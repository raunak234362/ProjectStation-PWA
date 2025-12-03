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
} from "../interface";
import api from "./api";
const token = sessionStorage.getItem("token");
class Service {
  //Get Logged-In User Detail
  static async GetUserByToken() {
    try {
      const response = await api.get(`user/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Signed In User detail-", response);
      return response.data;
    } catch (error) {
      //alert(error);
      console.log("Error while fetching logged-in user Detail", error);
    }
  }

  //Add New Employee
  static async AddEmployee(employeeData: EmployeePayload) {
    try {
      const response = await api.post(`employee`, employeeData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
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
      const response = await api.get(`employee`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
  //Fetch Employee by ROLE
  static async FetchEmployeeByRole(role: string) {
    try {
      const response = await api.get(`employee/role/${role}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
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
      const response = await api.get(`employee/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    MemberData: UpdateTeamRolePayload
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
      console.log(" All Fabricators fetched:", response.data);
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
      console.error("cannot find fabricators", error);
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
    const token = sessionStorage.getItem("token");

    const response = await api.post(`rfq`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }
  //Fetch all the RFQ
  static async FetchAllRFQ(rfqId: string) {
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
      const response = await api.get(`rfq/sents`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" RFQ sents:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfqs", error);
    }
  }

  //api for recieved:
  static async RFQRecieved() {
    try {
      const response = await api.get(`rfq/received`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("  RFQ received:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfqs", error);
    }
  }
  //getting rfqbyID

  static async GetRFQbyId(rfqId: string) {
      try {
        const response = await api.get(`rfq/getById/${rfqId}`, {
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
  
  // Update RFQ by ID
  static async UpdateRFQById(rfqId: string, data: any) {
    try {
      const response = await api.put(`rfq/update/${rfqId}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("RFQ updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot update rfq", error);
    }
  } 
    //RESPONSES
  //response post request 

static async addResponse(formData: FormData,responseId:string) {
  const token = sessionStorage.getItem("token");

  const response = await api.post(`rfq/${responseId}/responses`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

    return response.data;
  }

  //Add Connection Designer
  static async AddConnectionDesigner(data: any) {
    console.log(data);

    try {
      const response = await api.post(`connectionDesign`, data, {
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
  // Update Connection Designer By ID
  static async UpdateConnectionDesignerByID(id: string, data: any) {
    try {
      const response = await api.put(`connectionDesign/update/${id}`, data, {
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
    const token = sessionStorage.getItem("token");
    try {
      const response = await api.post(`project/projects`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
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
      const response = await api.delete(`chat/group/${groupId}/member/${memberId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Group member deleted", response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // Delete Group
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
 //Add new RFI
 static async addRFI(formData: FormData) {
  const token = sessionStorage.getItem("token");

  const response = await api.post(`rfi`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

}

export default Service;
