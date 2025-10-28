import type { EmployeePayload, FabricatorPayload } from "../interface";
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
    } catch (error) {
      alert(error);
      console.log("Error while adding New User", error);
    }
  }

  //Add New Employee
  // static async AddFabricator(fabricatorData: FabricatorPayload) {
  //   try {
  //     const response = await api.post(`fabricator`, fabricatorData, {
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     console.log(response);
  //   } catch (error) {
  //     alert(error);
  //     console.log("Error while adding New Fabricator", error);
  //   }
  // }
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
    }
    catch(error) {
      console.error("cannot find fabricators");
      
    }
  }
}

export default Service;
