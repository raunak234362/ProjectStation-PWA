import { useEffect, useState } from "react";
import { AddProject, AllProjects } from "../components";
import Service from "../api/Service";
import { useDispatch, useSelector } from "react-redux";
import { showDepartment, showTeam } from "../store/userSlice";

const ProjectLayout = () => {
  const [activeTab, setActiveTab] = useState("allProject");
const dispatch = useDispatch();
const departmentDatas = useSelector((state: any) => state?.userInfo?.departmentData);
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
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 flex flex-col justify-between items-start backdrop-blur-2xl bg-linear-to-t from-emerald-200/60 to-teal-600/50 border-b rounded-t-2xl ">
          <h1 className="text-2xl py-2 font-bold text-white">
            Project Detail
          </h1>
          <div className="flex flex-row w-full">
            <button
              onClick={() => setActiveTab("allProject")}
              className={`px-1.5 md:px-4 py-2 rounded-lg rounded-b ${
                activeTab === "allProject"
                  ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                  : "md:text-base text-sm text-white font-semibold"
              }`}
            >
              All Project
            </button>

            <button
              onClick={() => setActiveTab("addProject")}
              className={`px-1.5 md:px-4 py-2 rounded-lg rounded-b ${
                activeTab === "addProject"
                  ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                  : "md:text-base text-sm text-white font-semibold"
              }`}
            >
              Add Project
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
      </div>
    </div>
  );
};

export default ProjectLayout;
