import { useState } from "react";
import AddRFQ from "../components/rfq/AddRFQ";
import AllRFQ from "../components/rfq/AllRFQ";

import { useSelector } from "react-redux";
// import GetRFQByID from "../components/rfq/GetRFQByID";

const RfqLayout = () => {
  const [activeTab, setActiveTab] = useState("allRFQ");
  const rfq = useSelector((state: any) => state.RFQInfos.RFQData) || [];
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";

  return (
    <div className="w-full project-component-container">
      <div className="flex flex-col w-full h-full mb-6">
        <div className="px-3 py-2 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center md:justify-end">
            {userRole !== "connection_designer_engineer" && userRole !== "connection_designer_admin" && (
              <button
                onClick={() => setActiveTab("addRFQ")}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-tight transition-all border-2 ${activeTab === "addRFQ"
                  ? "bg-green-50 text-black border-green-700/80 shadow-sm"
                  : "bg-gray-100 text-black border-black/10 hover:border-black/20"
                  }`}
              >
                Create RFQ
              </button>
            )}
            <button
              onClick={() => setActiveTab("allRFQ")}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-tight transition-all border-2 ${activeTab === "allRFQ"
                ? "bg-green-50 text-black border-green-700/80 shadow-sm"
                : "bg-gray-100 text-black border-black/10 hover:border-black/20"
                }`}
            >
              All RFQ
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {activeTab === "allRFQ" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AllRFQ rfq={rfq} />
          </div>
        )}
        {activeTab === "addRFQ" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AddRFQ onSuccess={() => setActiveTab("allRFQ")} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RfqLayout;
