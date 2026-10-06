import type { CreateLineItemGroupPayload } from "../../interface";
import api from "../api";

class EstimationService {
    // Fetch All Estimation
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

}

export default EstimationService
