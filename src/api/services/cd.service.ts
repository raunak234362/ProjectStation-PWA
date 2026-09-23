import api from "../api";

class connectionDesignerService {
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
      const response = await api.post(`connectionDesignerQuota/`, formData, {
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

  static async GetConnectionDesignerQuotaByID(id: string) {
    try {
      const response = await api.get(`connectionDesignerQuota/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log(response)
      return response.data
    } catch (error) {
      console.log(error)
    }
  }

  //GetAllConnectionDesignerQuata
  static async GetAllConnectionDesignerQuata() {
    try {
      const response = await api.get(`connectionDesignerQuota/all`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("All Connection Designer Quata fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot get all connection designer quata", error);
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

  // Add CD Quota Response
  static async addCDQuotaResponse(data: FormData | any) {
    try {
      const isFormData = data instanceof FormData;
      const response = await api.post(`CDQuotaResponse`, data, {
        headers: {
          "Content-Type": isFormData ? "multipart/form-data" : "application/json",
        },
      });
      console.log("CD Quota Response added:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot add CD Quota Response", error);
      throw error;
    }
  }

  // Get all CD Quota Responses
  static async getAllCDQuotaResponses() {
    try {
      const response = await api.get(`CDQuotaResponse/all`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("All CD Quota Responses fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot get all CD Quota Responses", error);
    }
  }

  // Get CD Quota Response by ID
  static async getCDQuotaResponseById(id: string) {
    try {
      const response = await api.get(`CDQuotaResponse/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("CD Quota Response by ID fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot get CD Quota Response by ID", error);
    }
  }

  // Update CD Quota Response
  static async updateCDQuotaResponse(id: string, data: FormData | any) {
    try {
      const isFormData = data instanceof FormData;
      const response = await api.put(`CDQuotaResponse/${id}`, data, {
        headers: {
          "Content-Type": isFormData ? "multipart/form-data" : "application/json",
        },
      });
      console.log("CD Quota Response updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot update CD Quota Response", error);
      throw error;
    }
  }

  // Delete CD Quota Response
  static async deleteCDQuotaResponse(id: string) {
    try {
      const response = await api.delete(`CDQuotaResponse/${id}`);
      console.log("CD Quota Response deleted:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot delete CD Quota Response", error);
    }
  }

  // Get CD Quota Responses by Quota ID
  static async getCDQuotaResponsesByQuotaId(quotaId: string) {
    try {
      const response = await api.get(`CDQuotaResponse/quota/${quotaId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("CD Quota Responses by Quota ID fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("cannot get CD Quota Responses by Quota ID", error);
    }
  }

  
}

export default connectionDesignerService;
