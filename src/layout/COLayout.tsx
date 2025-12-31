import { useState } from "react";
import AllCO from "../components/co/AllCO";
import AddCO from "../components/co/AddCO";

const COLayout = () => {
  const [activeTab, setActiveTab] = useState("allCO");

  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 flex flex-col justify-between items-start backdrop-blur-2xl bg-linear-to-t from-emerald-200/60 to-teal-600/50 border-b rounded-t-2xl ">
          <h1 className="text-2xl py-2 font-bold text-white">Change Orders</h1>
          <div className="flex flex-row w-full">
            <button
              onClick={() => setActiveTab("allCO")}
              className={`px-1.5 md:px-4 py-2 rounded-lg rounded-b ${
                activeTab === "allCO"
                  ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                  : "md:text-base text-sm text-white font-semibold"
              }`}
            >
              ALL CO
            </button>

            <button
              onClick={() => setActiveTab("addCO")}
              className={`px-1.5 md:px-4 py-2 rounded-lg rounded-b ${
                activeTab === "addCO"
                  ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                  : "md:text-base text-sm text-white font-semibold"
              }`}
            >
              Add CO
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-white p-2 rounded-b-2xl overflow-y-auto">
        {activeTab === "allCO" && (
          <div>
            <AllCO />
          </div>
        )}
        {activeTab === "addCO" && (
          <div>
            <AddCO onSuccess={() => setActiveTab("allCO")} />
          </div>
        )}
      </div>
    </div>
  );
};

export default COLayout;
