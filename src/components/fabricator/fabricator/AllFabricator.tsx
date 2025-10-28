import { useEffect, useState } from "react";
import Service from "../../../api/Service";

const AllFabricator = () => {
  const [fabricators, setFabricators] = useState([]);

  useEffect(() => {
    const fetchFabricators = async () => {
      try {
        const data = await Service.GetAllFabricators();
        setFabricators(data);
      } catch (error) {
        console.error("Failed to fetch fabricators:", error);
      }
    };

    fetchFabricators();
  }, []);

  return (
    <div></div>
  );
};

export default AllFabricator;
