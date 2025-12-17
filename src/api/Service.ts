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
  // Fetch Connection Designer By ID
  static async FetchConnectionQuotationByDesignerID(id: string) {
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
      const response = await api.patch(`task/EST/pause/${id}`,data, {
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
      const response = await api.post(`task/EST/end/${id}`,data, {
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
    const response = await api.put(`estimation/line-items/update/${id}`, data, {
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

// add new Line Item
static async AddLineItem(data: any) {
  try {
    const response = await api.post(`estimation/line-items/item`, data, {
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

  // Get All Projects
  static async GetAllProjects() {
    try {
      const response = await api.get(`project/projects`, {
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

  // Add WBS in Project
  static async AddWBSInProject(projectId: string) {
    try {
      const response = await api.post(`project/projects/${projectId}/wbs
`, {
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
  static async GetWBSById(id: string) {
    try {
      const response = await api.get(`project/wbs/${id}`, {
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

  // Update WBS line-item by ProjectId, wbsId and line-item ID
  static async UpdateWBSLineItem(projectId: string, wbsId: string, lineItemId: string, data: any) {
    try {
      const response = await api.put(`project/projects/${projectId}/work-break-downs/${wbsId}/line-items/${lineItemId}`, data, {
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
    const token = sessionStorage.getItem("token");
    try {
      const response = await api.post(`project/projects/${projectId}/notes`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(" Project note created", response.data);
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

  //RFI components 
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
static async addRFIResponse(formData: FormData,responseId:string) {
  const token = sessionStorage.getItem("token");

  const response = await api.post(`rfi/${responseId}/responses`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

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
//submitals route 
  static async AddSubmittal(formData: FormData) {
    const token = sessionStorage.getItem("token");
    try {
      const response = await api.post(`submittal/`, formData, {
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
  //All Submitals
  static async SubmittalSent() {
    try {
      const response = await api.get(`submittal/sent`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" Submittals sents:", response.data);
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

      console.log("  Submittal received:", response.data);
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
      console.log(" All submittal fetched by submittalID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find submittal", error);
    }
  }
static async addSubmittalResponse(formData: FormData,SubId:string) {
  const token = sessionStorage.getItem("token");

  const response = await api.post(`submittal/${SubId}/responses`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

    return response.data;
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

    //change Order 
    static async ChangeOrder(formData: FormData) {
    const token = sessionStorage.getItem("token");
    try {
      const response = await api.post(`changeOrder/`, formData, {
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
  //update Co
    static async EditCoById(id: string, data: FormData) {
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

}
export default Service;
