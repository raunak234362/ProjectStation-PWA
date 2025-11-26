import { useEffect, useState } from "react";
import Service from "../../api/Service";

 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

const GetRFQByID = () => {

    useEffect(() => {
    async function fetchRfq() {
        if (!id) {
          setError("Invalid rfq  ID");
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError(null);
          const response = await Service.FetchEmployeeByID(id);
          setEmployee(response?.data?.user || null);
        } catch (err) {
          const msg = "Failed to load employee";
          setError(msg);
          console.error("Error fetching employee:", err);
        } finally {
          setLoading(false);
        }
      })
  }

  return <div>GetRFQByID</div>;
};

export default GetRFQByID;  