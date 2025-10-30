import type {
  DepartmentPayload,
  EditEmployeePayload,
  EmployeePayload,
  FabricatorPayload,
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
      alert(error);
      console.log("Error while fetching logged-in user Detail", error);
    }
  }

  //Add New Employee
  static async AddEmployee(employeeData: EmployeePayload) {
    try {
      const response = await api.post(`employee`, employeeData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response?.data;
    } catch (error) {
      alert(error);
      console.log("Error while adding New User", error);
    }
  }

  //Fetch All Employee
  static async FetchAllEmployee() {
    try {
      const response = await api.get(`employee`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      alert(error);
      console.log("Error fetching all Employee");
    }
  }

  //Fetch Employee by ROLE
  static async FetchEmployeeByRole(role: string) {
    try {
      const response = await api.get(`employee/role/${role}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      alert(error);
      console.log("Error fetching all Employee");
    }
  }

  // Fetch Employee by ID
  static async FetchEmployeeByID(id: string) {
    try {
      const response = await api.get(`employee/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      alert(error);
      console.log("Error fetching Employee by ID");
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
      alert(error);
      console.log("Error fetching Employee by ID");
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
      alert(error);
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
      alert(error);
      console.log("Error fetching all Employee");
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
      alert(error);
      console.log("Error fetching Employee by ID");
    }
  }

  static async AddFabricator(fabricatorData: FormData | FabricatorPayload) {
    try {
      let headers = {};

      // If we're sending FormData (for file uploads)
      if (fabricatorData instanceof FormData) {
        headers = { "Content-Type": "multipart/form-data" };
      } else {
        headers = { "Content-Type": "application/json" };
      }

      const response = await api.post(`fabricator`, fabricatorData, {
        headers,
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
      const response = await api.get(`fabricator`, {
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

  // Fetch All Chats
  static async AllChats() {
    try {
      const response = await api.get(`chat`, {
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

  // Fetch Chats by Group ID
  static async ChatByGroupID(groupId: string, lastId?: string) {
    try {
      const params: Record<string, string> = { groupId };
      if (lastId) {
        params.lastId = lastId;
      }
      const response = await api.get(`chat`, {
        params,
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
}

export default Service;
