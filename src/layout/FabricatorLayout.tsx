import { useState } from "react";
import AllFabricator from "../components/fabricator/fabricator/AllFabricator";
import AddFabricator from "../components/fabricator/fabricator/AddFabricator";

const FabricatorLayout = () => {
  const [activeTab, setActiveTab] = useState("allFabricator");

  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 py-2 backdrop-blur-2xl bg-linear-to-t from-white/60 to-white/80 border-b rounded-t-2xl flex flex-col md:flex-row items-center justify-end gap-4">
          <div className="flex flex-row gap-3 items-end justify-end">
            <button
              onClick={() => setActiveTab("allFabricator")}
              className={`px-1.5 md:px-4 py-2 rounded-lg ${
                activeTab === "allFabricator"
                  ? "md:text-base text-sm bg-green-700 text-white font-bold"
                  : "text-base md:text-base bg-white/70 backdrop-xl text-gray-700 font-semibold"
              }`}
            >
              All Fabricator
            </button>

            <button
              onClick={() => setActiveTab("addFabricator")}
              className={`px-1.5 md:px-4 py-2 rounded-lg ${
                activeTab === "addFabricator"
                  ? "md:text-base text-sm bg-green-700 text-white font-bold"
                  : "text-base md:text-base bg-white/70 backdrop-xl text-gray-700 font-semibold"
              }`}
            >
              Add Fabricator
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-white p-2 rounded-b-2xl overflow-y-auto">
        {activeTab === "allFabricator" && (
          <div>
            <AllFabricator />
          </div>
        )}
        {activeTab === "addFabricator" && (
          <div>
            <AddFabricator />
          </div>
        )}
      </div>
    </div>
  );
};

export default FabricatorLayout;
