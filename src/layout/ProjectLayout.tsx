import { useEffect, useState } from "react";
import { AddProject, AllProjects, ProjectDashboard } from "../components";
import Service from "../api/Service";
import { useDispatch, useSelector } from "react-redux";
import { showDepartment, showTeam } from "../store/userSlice";

const ProjectLayout = () => {
  const [activeTab, setActiveTab] = useState("projectDashboard");
  const dispatch = useDispatch();
  const departmentDatas = useSelector(
    (state: any) => state?.userInfo?.departmentData
  );
  const teamDatas = useSelector((state: any) => state?.userInfo?.teamData);
  const projects = useSelector(
    (state: any) => state?.projectInfo?.projectData || []
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
        <div className=" px-3 py-2 backdrop-blur-2xl bg-linear-to-t from-white/60 to-white/80 rounded-t-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-2xl animate-in font-medium text-indigo-600 uppercase tracking-wider">
                Total -
              </span>
              <span className="text-2xl animate-in font-bold text-indigo-700">
                {stats.total}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg border border-green-100">
              <span className="text-2xl animate-in font-medium text-green-600 uppercase tracking-wider">
                Active -
              </span>
              <span className="text-2xl animate-in font-bold text-green-700">
                {stats.active}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-2xl animate-in font-medium text-blue-600 uppercase tracking-wider">
                Completed -
              </span>
              <span className="text-2xl animate-in font-bold text-blue-700">
                {stats.completed}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-lg border border-orange-100">
              <span className="text-2xl animate-in font-medium text-orange-600 uppercase tracking-wider">
                On Hold -
              </span>
              <span className="text-2xl animate-in font-bold text-orange-700">
                {stats.onHold}
              </span>
            </div>
          </div>
          <div className="flex flex-row gap-4 items-center justify-end">
            <button
              onClick={() => setActiveTab("projectDashboard")}
              className={`flex items-center gap-2 px-6 py-3 rounded-[1.25rem] font-semibold transition-all ${activeTab === "projectDashboard"
                  ? "bg-green-500 text-white shadow-[0_8px_20px_-4px_rgba(34,197,94,0.4)] hover:bg-green-600 hover:shadow-[0_12px_24px_-4px_rgba(34,197,94,0.5)]"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-green-600 shadow-sm"
                }`}
            >
              Project Dashboard
            </button>
            {/* <button
              onClick={() => setActiveTab("allProject")}
              className={`flex items-center gap-2 px-6 py-3 rounded-[1.25rem] font-semibold transition-all ${
                activeTab === "allProject"
                  ? "bg-green-500 text-white shadow-[0_8px_20px_-4px_rgba(34,197,94,0.4)] hover:bg-green-600 hover:shadow-[0_12px_24px_-4px_rgba(34,197,94,0.5)]"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-green-600 shadow-sm"
              }`}
            >
              All Project
            </button> */}

            <button
              onClick={() => setActiveTab("addProject")}
              className={`flex items-center gap-2 px-6 py-3 rounded-[1.25rem] font-semibold transition-all ${activeTab === "addProject"
                  ? "bg-green-500 text-white shadow-[0_8px_20px_-4px_rgba(34,197,94,0.4)] hover:bg-green-600 hover:shadow-[0_12px_24px_-4px_rgba(34,197,94,0.5)]"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-green-600 shadow-sm"
                }`}
            >
              Add New Project
            </button>
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
