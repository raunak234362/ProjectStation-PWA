import { toast } from "react-toastify";
import api from "../api";

class rfqService {
  //Add new RFQ
  static async addRFQ(formData: FormData) {
    const response = await api.post(`rfq`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }


    //Fetch all the RFQ
  static async FetchAllRFQ(
    page?: number,
    limit: number = 10,
    searchByProjectName?: string,
    status?: string
  ) {
    try {
      const response = await api.get(`rfq/all`, {
        params: {
          page,
          limit,
          searchByProjectName: searchByProjectName || undefined,
          status: status || undefined,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(" All Data fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfqs", error);
    }
  }

    static async getAllRFQ(
    page?: number,
    limit: number = 10,
    searchByProjectName?: string,
    status?: string
  ) {
    return this.FetchAllRFQ(page, limit, searchByProjectName, status);
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

    //getting Internal RFQ by ID
  static async GetInternalRFQByID(rfqId: string) {
    try {
      // NOTE: Adjust endpoint if backend is different
      const response = await api.get(`rfq/getById/${rfqId}`);
      console.log(" All internal rfq fetched by rfq ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find internal rfq", error);
      throw error;
    }
  }

  //getting CD RFQ by ID
  static async GetCDRFQByID(rfqId: string) {
    try {
      // NOTE: Adjust endpoint if backend is different
      const response = await api.get(`rfq/getById/${rfqId}`);
      console.log(" All cd rfq fetched by rfq ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find cd rfq", error);
      throw error;
    }
  }

   // Update RFQ by ID
  static async UpdateRFQById(rfqId: string, data: any, fabricatorName: string, rfqProjectName: string) {
    try {
      const response = await api.put(`rfq/update/${rfqId}?fabricatorName=${encodeURIComponent(fabricatorName)}&rfqProjectName=${encodeURIComponent(rfqProjectName)}`, data);
      console.log("RFQ updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot update rfq", error);
    }
  }

    //Delete RFQ by ID
  static async DeleteRFQById(rfqId: string) {
    const response = await api.delete(`rfq/${rfqId}`);
    console.log("RFQ deleted:", response.data);
    return response.data;
  }

    //RESPONSES
  // GET RFQ responses by ID
  static async getRFQResponses(rfqId: string) {
    try {
      const response = await api.get(`rfq/${rfqId}/responses`);
      console.log("RFQ responses fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfq responses", error);
      throw error;
    }
  }

  // GET single RFQ response by ID
  static async getRFQResponseById(id: string) {
    try {
      const response = await api.get(`rfq/responses/${id}`);
      console.log("RFQ response fetched by ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfq response", error);
      throw error;
    }
  }

   //response post request
  static async addResponse(formData: FormData, responseId: string, fabricatorName: string, rfqProjectName: string) {
    try {
      const response = await api.post(`rfq/${responseId}/responses?fabricatorName=${encodeURIComponent(fabricatorName)}&rfqProjectName=${encodeURIComponent(rfqProjectName)}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Cannot add RFQ response", error)
    }
  }


  //rfq followups:
  static async addRFQFollowups(formData: FormData, rfqId: string, fabricatorName: string, rfqProjectName: string) {
    try {
      const response = await api.post(`rfq/${rfqId}/followups?fabricatorName=${encodeURIComponent(fabricatorName)}&rfqProjectName=${encodeURIComponent(rfqProjectName)}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("RFQ followups added:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot add RFQ followups", error);
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

  //get all rfq for fabricator
  static async getAllRFQFab() {
    try {
      const response = await api.get(`rfq/fabricators/me`);
      console.log(" All RFQ fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfqs for fabricator", error);
    }
  }


  // Client Admin Pending RFQs (Received)
  static async ClientAdminPendingRFQs() {
    try {
      // Assuming existing dashboard logic uses 'received' and filters it locally.
      // We'll use a specific endpoint if available, but for now mimicking the likely pattern or reusing received if auth handles it.
      // Given the pattern, let's try `rfq/received/clientAdmin`
      const response = await api.get(`rfq/pending/clientAdmin`);
      console.log("Client Admin RFQ received:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfqs for Client Admin", error);
    }
  }


  //get All RFQ FOR Client estimator
  static async GetClientEstimatorRFQ() {

    try {
      const response = await api.get(`rfq/all/clientEstimator`);
      console.log(" All RFQ fetched by Client Estimator:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot find rfqs for Client Estimator", error);
    }
  }
   // Client Estimator DashboardData
 static async GetClientEstimatorDashboardData(){
   try {
     const response = await api.get(`dashBoardData/clientEstimator`);
      console.log(" All RFQ fetched by Client Estimator:", response.data);
      return response.data;
  } catch (error) {
    return error
  }
 }
}

export default rfqService;
