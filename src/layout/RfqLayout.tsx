import { useState } from "react";
import AddRFQ from "../components/rfq/AddRFQ";
import AllRFQ from "../components/rfq/AllRFQ";

import { useSelector } from "react-redux";
// import GetRFQByID from "../components/rfq/GetRFQByID";

const RfqLayout = () => {
  const [activeTab, setActiveTab] = useState("allRFQ");
  const rfq = useSelector((state: any) => state.RFQInfos.RFQData);
  return (
    <div className="w-full">
      <div className="flex flex-col w-full h-full mb-6">
        <div className="px-6 py-4 backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60 border border-white/50 dark:border-slate-800/50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">RFQ Management</h2>
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Manage and track all request for quotations</p>
          </div>
          <div className="flex flex-row gap-4 items-center w-full md:w-auto">
            <button
              onClick={() => setActiveTab("allRFQ")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === "allRFQ"
                ? "bg-green-500 text-white shadow-lg shadow-green-100 dark:shadow-none hover:bg-green-600 scale-[1.02]"
                : "bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-green-600 shadow-sm"
                }`}
            >
              All RFQ
            </button>

            <button
              onClick={() => setActiveTab("addRFQ")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === "addRFQ"
                ? "bg-green-500 text-white shadow-lg shadow-green-100 dark:shadow-none hover:bg-green-600 scale-[1.02]"
                : "bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-green-600 shadow-sm"
                }`}
            >
              Add RFQ
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
