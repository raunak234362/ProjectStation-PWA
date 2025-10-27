
import { useState } from "react";
import { AddEmployee, AllEmployee } from "../components";

const ManageTeamLayout = () => {
  //   console.log("RFQ Component Rendered with projectData:", projectData);
  const [activeTab, setActiveTab] = useState("allEmployee");
  const userType = sessionStorage.getItem("userType");
  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 flex flex-col justify-between items-start backdrop-blur-2xl bg-linear-to-t from-emerald-200/60 to-teal-600/50 border-b rounded-md ">
          <h1 className="text-2xl py-2 font-bold text-white">Team Detail</h1>
          <div className="flex w-full overflow-x-auto">
            {(userType === "admin" || userType === "human-resource") && (
                <button
                  onClick={() => setActiveTab("addEmployee")}
                  className={`px-1.5 md:px-4 py-2 rounded-lg rounded-b ${
                    activeTab === "addEmployee"
                      ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                      : "md:text-base text-sm text-white font-semibold"
                  }`}
                >
                  Add Employee
                </button>
              )}
            <button
              onClick={() => setActiveTab("allEmployee")}
              className={`px-1.5 md:px-4 py-2 rounded-lg rounded-b ${
                activeTab === "allEmployee"
                  ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                  : "md:text-base text-sm text-white font-semibold"
              }`}
            >
              All Employee
            </button>
            {(userType === "admin" || userType === "human-resource") && (
              <>
                <button
                  onClick={() => setActiveTab("addDepartment")}
                  className={`px-1.5 md:px-4 py-2 rounded-lg rounded-b ${
                    activeTab === "addDepartment"
                      ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                      : "md:text-base text-sm text-white font-semibold"
                  }`}
                >
                  Add Department
                </button>
                <button
                  onClick={() => setActiveTab("allDepartment")}
                  className={`px-1.5 md:px-4 py-2 rounded-lg rounded-b ${
                    activeTab === "allDepartment"
                      ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                      : "md:text-base text-sm text-white font-semibold"
                  }`}
                >
                  All Department
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab("teamDashboard")}
              className={`px-1.5 md:px-4 py-2 rounded-lg rounded-b ${
                activeTab === "teamDashboard"
                  ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                  : "md:text-base text-sm text-white font-semibold"
              }`}
            >
              Team Dashboard
            </button>
          </div>
        </div>
        <div className="flex-grow p-2 h-[85vh] overflow-y-auto">
          {activeTab === "allEmployee" && (
            <div>
              <AllEmployee />
            </div>
          )}
          {activeTab === "addDepartment" && (
            <div>
              {" "}
              {/* <AddDepartment />{" "} */}
            </div>
          )}
          {activeTab === "addEmployee" && (
            <div>
              {" "}
              <AddEmployee />{" "}
            </div>
          )}
          {activeTab === "allDepartment" && (
            <div>
              {" "}
              {/* <AllDepartment />{" "} */}
            </div>
          )}
          {activeTab === "teamDashboard" && (
            <div>
              {" "}
              {/* <TeamDashboard />{" "} */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageTeamLayout;
