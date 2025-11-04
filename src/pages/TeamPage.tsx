/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { AddEmployee } from "../components";
import EmployeeLayout from "../layout/EmployeeLayout";
import DepartmentLayout from "../layout/DepartmentLayout";
import TeamLayout from "../layout/TeamLayout";
import Service from "../api/Service";
import { useDispatch, useSelector } from "react-redux";
import { showDepartment, showTeam } from "../store/userSlice";

const TeamPage = () => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("manageEmployee");
  const userRole = sessionStorage.getItem("userRole");

  const departmentDatas = useSelector(
    (state: any) => state?.userInfo?.departmentData
  );
  const teamDatas = useSelector((state: any) => state?.userInfo?.teamData);

  // ✅ Fetch Departments only when data is null or empty
  const fetchDepartment = async () => {
    try {
      const response = await Service.AllDepartments();
      dispatch(showDepartment(response?.data));
    } catch (error) {
      console.log("Error fetching departments", error);
    }
  };

  // ✅ Fetch Teams only when data is null or empty
  const fetchTeam = async () => {
    try {
      const response = await Service.AllTeam();
      dispatch(showTeam(response?.data));
    } catch (error) {
      console.log("Error fetching teams", error);
    }
  };

  // useEffect(() => {
  //   // ✅ Only call if no data exists
  //   if (!departmentDatas || departmentDatas.length === 0) {
  //     fetchDepartment();
  //   }

  //   if (!teamDatas || teamDatas.length === 0) {
  //     fetchTeam();
  //   }
  // }, [departmentDatas, teamDatas]);

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        {/* ---------- TOP TABS ---------- */}
        <div className="px-3 flex flex-col justify-between items-start backdrop-blur-2xl bg-linear-to-t from-emerald-200/60 to-teal-600/50 border-b rounded-md">
          <h1 className="text-2xl py-2 font-bold text-white">Team Detail</h1>

          <div className="flex w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab("teamDashboard")}
              className={`px-1.5 md:px-4 py-2 rounded-lg ${
                activeTab === "teamDashboard"
                  ? "bg-white/70 text-gray-800 font-bold"
                  : "text-white font-semibold"
              }`}
            >
              Team Dashboard
            </button>

            <button
              onClick={() => setActiveTab("manageEmployee")}
              className={`px-1.5 md:px-4 py-2 rounded-lg ${
                activeTab === "manageEmployee"
                  ? "bg-white/70 text-gray-800 font-bold"
                  : "text-white font-semibold"
              }`}
            >
              Manage Employee
            </button>

            {(userRole === "ADMIN" || userRole === "human-resource") && (
              <button
                onClick={() => setActiveTab("manageDepartment")}
                className={`px-1.5 md:px-4 py-2 rounded-lg ${
                  activeTab === "manageDepartment"
                    ? "bg-white/70 text-gray-800 font-bold"
                    : "text-white font-semibold"
                }`}
              >
                Manage Department
              </button>
            )}

            {(userRole === "ADMIN" ||
              userRole === "DEPT_MANAGER" ||
              userRole === "human-resource") && (
              <button
                onClick={() => setActiveTab("manageTeam")}
                className={`px-1.5 md:px-4 py-2 rounded-lg ${
                  activeTab === "manageTeam"
                    ? "bg-white/70 text-gray-800 font-bold"
                    : "text-white font-semibold"
                }`}
              >
                Manage Team
              </button>
            )}
          </div>
        </div>

        {/* ---------- TAB CONTENT ---------- */}
        <div className="flex-1 min-h-0 py-2 overflow-y-auto">
          {activeTab === "manageEmployee" && <EmployeeLayout />}
          {activeTab === "manageDepartment" && <DepartmentLayout />}
          {activeTab === "manageTeam" && <TeamLayout />}
          {activeTab === "teamDashboard" && <AddEmployee />}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
