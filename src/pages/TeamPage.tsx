/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { AddEmployee } from "../components";
import EmployeeLayout from "../layout/EmployeeLayout";
import DepartmentLayout from "../layout/DepartmentLayout";
import Service from "../api/Service";
import { useDispatch } from "react-redux";
import { showDepartment } from "../store/userSlice";

const TeamPage = () => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("manageEmployee");
  const userRole = sessionStorage.getItem("userRole");

  // ✅ Fetch ALL departments on mount
  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await Service.AllDepartments();
        dispatch(showDepartment(response?.data));
      } catch (error) {
        console.log("Error fetching departments", error);
      }
    };

    fetchDepartment();
  }, [dispatch]);

  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
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
          </div>
        </div>

        {/* ---------- TAB CONTENT ---------- */}
        <div className="flex-grow py-2 h-[85vh] overflow-y-auto">
          {activeTab === "manageEmployee" && <EmployeeLayout />}

          {activeTab === "manageDepartment" && (
            <DepartmentLayout/>
          )}

          {activeTab === "teamDashboard" && <AddEmployee />}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
