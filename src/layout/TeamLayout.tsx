import { useState } from "react";
import AddTeam from "../components/manageTeam/team/AddTeam";
import AllTeam from "../components/manageTeam/team/AllTeam";

const TeamLayout = () => {
  const [activeTab, setActiveTab] = useState("allTeam");
  const userRole = sessionStorage.getItem("userRole");
  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 flex flex-col justify-between items-start backdrop-blur-2xl bg-linear-to-t from-emerald-200/60 to-teal-600/50 border-b rounded-t-md ">
          <div className="flex w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab("allTeam")}
              className={`px-1.5 md:px-4 py-2 rounded-lg rounded-b ${
                activeTab === "allTeam"
                  ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                  : "md:text-base text-sm text-white font-semibold"
              }`}
            >
              All Team
            </button>

            {(userRole === "ADMIN" || userRole === "human-resource") && (
              <>
                <button
                  onClick={() => setActiveTab("addTeam")}
                  className={`px-1.5 md:px-4 py-2 rounded-lg rounded-b ${
                    activeTab === "addDepartment"
                      ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                      : "md:text-base text-sm text-white font-semibold"
                  }`}
                >
                  Add Team
                </button>
              </>
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
