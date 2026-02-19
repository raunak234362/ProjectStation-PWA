import { useState } from "react";
import AddRFQ from "../components/rfq/AddRFQ";
import AllRFQ from "../components/rfq/AllRFQ";

import { useSelector } from "react-redux";
// import GetRFQByID from "../components/rfq/GetRFQByID";

const RfqLayout = () => {
  const [activeTab, setActiveTab] = useState("allRFQ");
  const rfq = useSelector((state: any) => state.RFQInfos.RFQData) || [];

  // const stats = {
  //   total: rfq.length,
  //   inReview: rfq.filter((r: any) => r.status === "IN_REVIEW").length,
  //   completed: rfq.filter((r: any) => r.status === "COMPLETED").length,
  //   pending: rfq.filter((r: any) => r.status === "PENDING" || r.status === "SENT").length,
  // };

  return (
    <div className="w-full">
      <div className="flex flex-col w-full h-full mb-6">
        <div className="px-3 py-2 flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center md:justify-end">
            <button
              onClick={() => setActiveTab("allRFQ")}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-[1.25rem] text-sm md:text-base font-bold transition-all ${activeTab === "allRFQ"
                ? "bg-green-200 text-black border border-black shadow-sm"
                : "bg-white border border-black/10 text-black hover:bg-green-50 shadow-sm"
                }`}
            >
              All RFQ
            </button>

            <button
              onClick={() => setActiveTab("addRFQ")}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-[1.25rem] text-sm md:text-base font-bold transition-all ${activeTab === "addRFQ"
                ? "bg-green-200 text-black border border-black shadow-sm"
                : "bg-white border border-black/10 text-black hover:bg-green-50 shadow-sm"
                }`}
            >
              Create RFQ
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
