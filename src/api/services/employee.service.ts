import type { EditEmployeePayload, EmployeePayload } from "../../interface";
import api from "../api";

class employeeService {
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
}

export default employeeService;
