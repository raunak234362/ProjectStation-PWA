import { useState } from "react";
import AddRFQ from "../components/rfq/AddRFQ";
import AllRFQ from "../components/rfq/AllRFQ";

import { useSelector } from "react-redux";
// import GetRFQByID from "../components/rfq/GetRFQByID";


const RfqLayout = () => {
  const [activeTab, setActiveTab] = useState("allRFQ");
  const rfq = useSelector((state: any) => state.RFQInfos.RFQData);
  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 flex flex-col justify-between items-start backdrop-blur-2xl bg-linear-to-t from-emerald-200/60 to-teal-600/50 border-b rounded-t-2xl ">
          <h1 className="text-2xl py-2 font-bold text-white">RFQ Detail</h1>
          <div className="flex flex-row w-full">
            <button
              onClick={() => setActiveTab("allRFQ")}
              className={`px-1.5 md:px-4 py-2 rounded-lg rounded-b ${
                activeTab === "allRFQ"
                  ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                  : "md:text-base text-sm text-white font-semibold"
              }`}
            >
              All RFQ
            </button>

            <button
              onClick={() => setActiveTab("addRFQ")}
              className={`px-1.5 md:px-4 py-2 rounded-lg rounded-b ${
                activeTab === "addRFQ"
                  ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                  : "md:text-base text-sm text-white font-semibold"
              }`}
            >
              Add RFQ
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-white p-2 rounded-b-2xl overflow-y-auto">
        {activeTab === "allRFQ" && (
          <div>
            <AllRFQ rfq={rfq}/>
          </div>
        )}
        {activeTab === "addRFQ" && (
          <div>
            <AddRFQ />
          </div>
        )}
      </div>
    </div>
  );
};

export default RfqLayout