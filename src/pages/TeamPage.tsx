/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { TeamDashboard } from "../components";
import EmployeeLayout from "../layout/EmployeeLayout";
import DepartmentLayout from "../layout/DepartmentLayout";
import TeamLayout from "../layout/TeamLayout";
import Service from "../api/Service";
import { useDispatch, useSelector } from "react-redux";
import { showDepartment, showTeam } from "../store/userSlice";

const TeamPage = () => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("teamDashboard");
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

  useEffect(() => {
    // ✅ Only call if no data exists
    if (!departmentDatas || departmentDatas.length === 0) {
      fetchDepartment();
    }

    if (!teamDatas || teamDatas.length === 0) {
      fetchTeam();
    }
  }, [dispatch]);

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        {/* ---------- TOP TABS ---------- */}
        <div className="px-10 py-6 bg-white border-b border-black/5 flex flex-wrap items-center justify-start gap-3">
          <button
            onClick={() => setActiveTab("teamDashboard")}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${activeTab === "teamDashboard"
              ? "bg-black text-white border-black shadow-medium scale-[1.02]"
              : "bg-white border-black/5 text-black/40 hover:text-black hover:bg-gray-50 hover:border-black/10"
              }`}
          >
            Team Dashboard
          </button>

          <button
            onClick={() => setActiveTab("manageEmployee")}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${activeTab === "manageEmployee"
              ? "bg-black text-white border-black shadow-medium scale-[1.02]"
              : "bg-white border-black/5 text-black/40 hover:text-black hover:bg-gray-50 hover:border-black/10"
              }`}
          >
            Manage Employee
          </button>

          {(userRole === "ADMIN" || userRole === "HUMAN_RESOURCE") && (
            <button
              onClick={() => setActiveTab("manageDepartment")}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${activeTab === "manageDepartment"
                ? "bg-black text-white border-black shadow-medium scale-[1.02]"
                : "bg-white border-black/5 text-black/40 hover:text-black hover:bg-gray-50 hover:border-black/10"
                }`}
            >
              Manage Department
            </button>
          )}

          {(userRole === "ADMIN" ||
            userRole === "DEPT_MANAGER" ||
            userRole === "HUMAN_RESOURCE") && (
              <button
                onClick={() => setActiveTab("manageTeam")}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${activeTab === "manageTeam"
                  ? "bg-black text-white border-black shadow-medium scale-[1.02]"
                  : "bg-white border-black/5 text-black/40 hover:text-black hover:bg-gray-50 hover:border-black/10"
                  }`}
              >
                Manage Team
              </button>
            )}
        </div>

        {/* ---------- TAB CONTENT ---------- */}
        <div className="flex-1 min-h-0 py-2 overflow-y-auto">
          {activeTab === "manageEmployee" && <EmployeeLayout />}
          {activeTab === "manageDepartment" && <DepartmentLayout />}
          {activeTab === "manageTeam" && <TeamLayout />}
          {activeTab === "teamDashboard" && <TeamDashboard />}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
