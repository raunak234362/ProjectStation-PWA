import { useState } from "react";
import AddTeam from "../components/manageTeam/team/AddTeam";
import AllTeam from "../components/manageTeam/team/AllTeam";

const TeamLayout = () => {
  const [activeTab, setActiveTab] = useState("allTeam");
  const userRole = sessionStorage.getItem("userRole");
  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-black/5 rounded-t-2xl flex flex-col md:flex-row items-center justify-end gap-6">
          <div className="flex flex-row gap-4 items-center justify-end">
            <button
              onClick={() => setActiveTab("allTeam")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "allTeam"
                ? "bg-white text-black shadow-medium border border-black/5"
                : "text-black/40 hover:text-black"
                }`}
            >
              All Teams
            </button>

            {(userRole === "ADMIN" || userRole === "HUMAN_RESOURCE") && (
              <button
                onClick={() => setActiveTab("addTeam")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "addTeam"
                  ? "bg-white text-black shadow-medium border border-black/5"
                  : "text-black/40 hover:text-black"
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
