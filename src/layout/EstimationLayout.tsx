import { useEffect, useState } from "react";
import { AddEstimation, AllEstimation } from "../components";
import Service from "../api/Service";

const EstimationLayout = () => {
  const [activeTab, setActiveTab] = useState("allEstimation");
  const [estmation, setEstimation] = useState<any>([]);
  const fetchAllEstimation = async () => {
    try {
      const response = await Service.AllEstimation();
      console.log(response?.data);
      setEstimation(response?.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchAllEstimation();
  }, []);

  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 py-2 backdrop-blur-2xl bg-linear-to-t from-white/60 to-white/80 border-b rounded-t-2xl flex flex-col md:flex-row items-center justify-end gap-4">
          <div className="flex flex-row gap-3 items-end justify-end">
            <button
              onClick={() => setActiveTab("allEstimation")}
              className={`px-1.5 md:px-4 py-2 rounded-lg ${
                activeTab === "allEstimation"
                  ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                  : "md:text-base text-sm bg-teal-700 text-white font-semibold"
              }`}
            >
              All Estimations
            </button>

            <button
              onClick={() => setActiveTab("addEstimation")}
              className={`px-1.5 md:px-4 py-2 rounded-lg ${
                activeTab === "addEstimation"
                  ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                  : "md:text-base text-sm bg-teal-700 text-white font-semibold"
              }`}
            >
              Add Estimation
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-white p-2 rounded-b-2xl overflow-y-auto">
        {activeTab === "allEstimation" && (
          <div>
            <AllEstimation
              estimations={estmation}
              onRefresh={fetchAllEstimation}
            />
          </div>
        )}
        {activeTab === "addEstimation" && (
          <div>
            <AddEstimation
              onSuccess={() => {
                fetchAllEstimation();
                setActiveTab("allEstimation");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EstimationLayout;
