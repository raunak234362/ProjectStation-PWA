import { useState } from "react";
import { cn } from "../lib/utils";
import AllFabricator from "../components/fabricator/fabricator/AllFabricator";
import AddFabricator from "../components/fabricator/fabricator/AddFabricator";
import FabricatorOverview from "../components/fabricator/fabricator/FabricatorOverview";

const FabricatorLayout = () => {
  const [activeTab, setActiveTab] = useState("allFabricator");

  return (
    <div className="w-full overflow-hidden flex flex-col h-full bg-transparent">
      <div className="px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-row gap-3 items-center bg-white/50 p-1.5 rounded-md shadow-soft border border-white/50 backdrop-blur-md">
          <button
            onClick={() => setActiveTab("allFabricator")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300",
              activeTab === "allFabricator"
                ? "bg-[#6bbd45] text-white shadow-highlight"
                : "text-slate-500 dark:text-white hover:text-slate-800 hover:bg-green-100"
            )}
          >
            Dashboard & Fabricators
          </button>

          <button
            onClick={() => setActiveTab("addFabricator")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-sm transition-all duration-300",
              activeTab === "addFabricator"
                ? "bg-[#6bbd45] text-white shadow-highlight"
                : "text-slate-500 dark:text-white hover:text-slate-800 hover:bg-green-100"
            )}
          >
            Add Fabricator
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white p-4 rounded-md overflow-y-auto custom-scrollbar border border-white/40 backdrop-blur-[2px]">
        <div className="bg-green-100 rounded-md shadow-soft p-2 min-h-full">
          {activeTab === "allFabricator" && (
            <div className="space-y-8">
              <FabricatorOverview />

              <div className="pt-4 border-t border-green-200/50">
                <AllFabricator />
              </div>
            </div>
          )}
          {activeTab === "addFabricator" && (
            <div className="h-full">
              <AddFabricator />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FabricatorLayout;
