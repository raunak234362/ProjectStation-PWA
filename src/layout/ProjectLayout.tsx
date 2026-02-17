import { useEffect, useState } from "react";
import { AddProject, AllProjects, ProjectDashboard } from "../components";
import Service from "../api/Service";
import { useDispatch, useSelector } from "react-redux";
import { showDepartment, showTeam } from "../store/userSlice";

const ProjectLayout = () => {
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";
  const [activeTab, setActiveTab] = useState(
    userRole === "connection_designer_engineer" || userRole === "estimation_head" || userRole === "client_admin" || userRole === "client"
      ? "allProject"
      : "projectDashboard",
  );
  const dispatch = useDispatch();
  const departmentDatas = useSelector(
    (state: any) => state?.userInfo?.departmentData,
  );
  const teamDatas = useSelector((state: any) => state?.userInfo?.teamData);
  const projects = useSelector(
    (state: any) => state?.projectInfo?.projectData || [],
  );

  const stats = {
    total: projects.length,
    active: projects.filter((p: any) => p.status === "ACTIVE").length,
    completed: projects.filter((p: any) => p.status === "COMPLETED").length,
    onHold: projects.filter((p: any) => p.status === "ON_HOLD").length,
  };
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
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 py-2 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4">
            <div className="flex items-center gap-2 px-2 md:px-3 py-1 bg-gray-50 rounded-lg border border-black">
              <span className="text-sm md:text-xl animate-in font-black text-black uppercase tracking-wider">
                Total -
              </span>
              <span className="text-sm md:text-xl animate-in font-black text-black">
                {stats.total}
              </span>
            </div>
            <div className="flex items-center gap-2 px-2 md:px-3 py-1 bg-gray-50 rounded-lg border border-black">
              <span className="text-sm md:text-xl animate-in font-black text-black uppercase tracking-wider">
                Active -
              </span>
              <span className="text-sm md:text-xl animate-in font-black text-black">
                {stats.active}
              </span>
            </div>
            <div className="flex items-center gap-2 px-2 md:px-3 py-1 bg-gray-50 rounded-lg border border-black">
              <span className="text-sm md:text-xl animate-in font-black text-black uppercase tracking-wider">
                Completed -
              </span>
              <span className="text-sm md:text-xl animate-in font-black text-black">
                {stats.completed}
              </span>
            </div>
            <div className="flex items-center gap-2 px-2 md:px-3 py-1 bg-gray-50 rounded-lg border border-black">
              <span className="text-sm md:text-xl animate-in font-black text-black uppercase tracking-wider">
                On Hold -
              </span>
              <span className="text-sm md:text-xl animate-in font-black text-black">
                {stats.onHold}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center md:justify-end">
            {[
              "admin",
              "project_manager_officer",
              "operation_executive",
              "project_manager",
              "deputy_manager",
            ].includes(
              sessionStorage.getItem("userRole")?.toLowerCase() || "",
            ) && (
                <button
                  onClick={() => setActiveTab("projectDashboard")}
                  className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-[1.25rem] text-sm md:text-base font-bold transition-all ${activeTab === "projectDashboard"
                    ? "bg-green-50 text-black border border-black shadow-sm"
                    : "bg-white border border-black text-black hover:bg-green-50 shadow-sm"
                    }`}
                >
                  Project Home
                </button>
              )}

            {["connection_designer_engineer", "estimation_head"].includes(
              sessionStorage.getItem("userRole")?.toLowerCase() || "",
            ) && (
                <button
                  onClick={() => setActiveTab("allProject")}
                  className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-[1.25rem] text-sm md:text-base font-bold transition-all ${activeTab === "allProject"
                    ? "bg-green-50 text-black border border-black shadow-sm"
                    : "bg-white border border-black text-black hover:bg-green-50 shadow-sm"
                    }`}
                >
                  All Projects
                </button>
              )}

            {[
              "admin",
              "project_manager_officer",
              "operation_executive",
              "estimation_head",
              "project_manager",
              "deputy_manager",
            ].includes(
              sessionStorage.getItem("userRole")?.toLowerCase() || "",
            ) && (
                <button
                  onClick={() => setActiveTab("addProject")}
                  className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-[1.25rem] text-sm md:text-base font-bold transition-all ${activeTab === "addProject"
                    ? "bg-green-50 text-black border border-black shadow-sm"
                    : "bg-white border border-black text-black hover:bg-green-50 shadow-sm"
                    }`}
                >
                  Add New Project
                </button>
              )}
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-white p-2 rounded-b-2xl overflow-y-auto">
        {activeTab === "allProject" && (
          <div>
            <AllProjects />
          </div>
        )}
        {activeTab === "addProject" && (
          <div>
            <AddProject />
          </div>
        )}
        {activeTab === "projectDashboard" && (
          <div>
            <ProjectDashboard />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectLayout;
