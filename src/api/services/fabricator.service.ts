import api from "../api";

class fabricatorService {
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
}

export default fabricatorService;
