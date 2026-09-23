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
}

export default rfqService;
