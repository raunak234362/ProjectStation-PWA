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
        <div className="px-3 py-2 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center md:justify-end w-full">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-[1.25rem] text-sm md:text-base font-bold transition-all ${activeTab === "dashboard"
                ? "bg-green-200 text-black border border-black shadow-sm"
                : "bg-white border border-black text-black hover:bg-green-50 shadow-sm"
                }`}
            >
              Estimation Home
            </button>

            <button
              onClick={() => setActiveTab("addEstimation")}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-[1.25rem] text-sm md:text-base font-bold transition-all ${activeTab === "addEstimation"
                ? "bg-green-200 text-black border border-black shadow-sm"
                : "bg-white border border-black text-black hover:bg-green-50 shadow-sm"
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
