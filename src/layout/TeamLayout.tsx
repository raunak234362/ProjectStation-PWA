import { useState } from "react";
import AddTeam from "../components/manageTeam/team/AddTeam";
import AllTeam from "../components/manageTeam/team/AllTeam";

const TeamLayout = () => {
  const [activeTab, setActiveTab] = useState("allTeam");
  const userRole = sessionStorage.getItem("userRole");
  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-4 md:px-6 py-4 bg-gray-50/50 border-b border-black/5 rounded-t-2xl flex flex-col md:flex-row items-center justify-center md:justify-end gap-4 md:gap-6">
          <div className="flex flex-row gap-2 md:gap-4 items-center justify-center md:justify-end w-full md:w-auto">
            <button
              onClick={() => setActiveTab("allTeam")}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border ${activeTab === "allTeam"
                ? "bg-green-200 text-black border-black shadow-sm"
                : "text-black/60 border-black/10 hover:bg-green-50"
                }`}
            >
              All Teams
            </button>

            {(userRole === "ADMIN" || userRole === "HUMAN_RESOURCE") && (
              <button
                onClick={() => setActiveTab("addTeam")}
                className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border ${activeTab === "addTeam"
                  ? "bg-green-200 text-black border-black shadow-sm"
                  : "text-black/60 border-black/10 hover:bg-green-50"
                  }`}
              >
                Add Team
              </button>
            )}
          </div>
        </div>
        <div className="grow p-2 bg-white rounded-b-2xl">
          {activeTab === "allTeam" && (
            <div>
              <AllTeam />
            </div>
          )}
          {activeTab === "addTeam" && (
            <div>
              {" "}
              <AddTeam />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamLayout;
