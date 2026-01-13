import { useEffect, useState } from "react";
import { AddEstimation, AllEstimation } from "../components";
import EstimationDashboard from "../components/estimation/EstimationDashboard";
import Service from "../api/Service";

const EstimationLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard"); // Default to dashboard
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
    // We might not need to fetch all estimations here for the dashboard if the dashboard fetches its own data,
    // but if we want to share data, we can pass it down. 
    // For now, let's keep it as is for AllEstimation tab.
    fetchAllEstimation();
  }, []);

  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 py-2 backdrop-blur-2xl bg-linear-to-t from-white/60 to-white/80 border-b rounded-t-2xl flex flex-col md:flex-row items-center justify-end gap-4">
          <div className="flex flex-row gap-3 items-end justify-end">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-1.5 md:px-4 py-2 rounded-lg ${activeTab === "dashboard"
                  ? "md:text-base text-sm bg-green-700 text-white font-bold"
                  : "text-base md:text-base bg-white/70 backdrop-xl text-gray-700 font-semibold"
                }`}
            >
              Dashboard
            </button>

            {/* <button
              onClick={() => setActiveTab("allEstimation")}
              className={`px-1.5 md:px-4 py-2 rounded-lg ${activeTab === "allEstimation"
                  ? "md:text-base text-sm bg-green-700 text-white font-bold"
                  : "text-base md:text-base bg-white/70 backdrop-xl text-gray-700 font-semibold"
                }`}
            >
              All Estimations
            </button> */}

            <button
              onClick={() => setActiveTab("addEstimation")}
              className={`px-1.5 md:px-4 py-2 rounded-lg ${activeTab === "addEstimation"
                  ? "md:text-base text-sm bg-green-700 text-white font-bold"
                  : "text-base md:text-base bg-white/70 backdrop-xl text-gray-700 font-semibold"
                }`}
            >
              Add Estimation
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-white p-2 rounded-b-2xl overflow-y-auto">
        {activeTab === "dashboard" && (
          <div className="h-full">
            <EstimationDashboard />
          </div>
        )}
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
