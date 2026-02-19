import { useState } from "react";
import { cn } from "../lib/utils";
import AllFabricator from "../components/fabricator/fabricator/AllFabricator";
import AddFabricator from "../components/fabricator/fabricator/AddFabricator";
import FabricatorOverview from "../components/fabricator/fabricator/FabricatorOverview";

const FabricatorLayout = () => {
  const [activeTab, setActiveTab] = useState("allFabricator");

  return (
    <div className="w-full overflow-hidden flex flex-col h-full bg-transparent">
      <div className="px-3 py-2 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center md:justify-end w-full">
          <button
            onClick={() => setActiveTab("allFabricator")}
            className={cn(
              "flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-[1.25rem] text-sm md:text-base font-bold transition-all",
              activeTab === "allFabricator"
                ? "bg-green-200 text-black border border-black shadow-sm"
                : "bg-white border border-black text-black hover:bg-green-50 shadow-sm"
            )}
          >
            Dashboard & Fabricators
          </button>

          <button
            onClick={() => setActiveTab("addFabricator")}
            className={cn(
              "flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-[1.25rem] text-sm md:text-base font-bold transition-all",
              activeTab === "addFabricator"
                ? "bg-green-200 text-black border border-black shadow-sm"
                : "bg-white border border-black text-black hover:bg-green-50 shadow-sm"
            )}
          >
            Add Fabricator
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white p-4 rounded-3xl overflow-y-auto custom-scrollbar">
        <div className="p-2 min-h-full">
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
