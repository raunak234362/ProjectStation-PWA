import { useState } from "react";
import AddRFQ from "../components/rfq/AddRFQ";
import AllRFQ from "../components/rfq/AllRFQ";

import { useSelector } from "react-redux";
// import GetRFQByID from "../components/rfq/GetRFQByID";

const RfqLayout = () => {
  const [activeTab, setActiveTab] = useState("allRFQ");
  const rfq = useSelector((state: any) => state.RFQInfos.RFQData);
  console.log(rfq);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full h-full mb-6">
        <div className="mx-2 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-row gap-4 items-center w-full md:w-auto">
            <button
              onClick={() => setActiveTab("allRFQ")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm  uppercase tracking-widest transition-all ${activeTab === "allRFQ"
                ? "bg-green-50 text-black border border-black shadow-sm transition-all"
                : "bg-white border border-black text-black hover:bg-green-50 transition-all font-bold"
                }`}
            >
              All RFQ
            </button>

            <button
              onClick={() => setActiveTab("addRFQ")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm  uppercase tracking-widest transition-all ${activeTab === "addRFQ"
                ? "bg-green-50 text-black border border-black shadow-sm transition-all"
                : "bg-white border border-black text-black hover:bg-green-50 transition-all font-bold"
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
