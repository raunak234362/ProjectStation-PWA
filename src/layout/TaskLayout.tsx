import { useState } from "react";

// import { useSelector } from "react-redux";
import AllTasks from "../components/task/AllTasks";
import AddTask from "../components/task/AddTask";
import AllActiveTask from "../components/task/AllActiveTask";
// import GetRFQByID from "../components/rfq/GetRFQByID";

const TaskLayout = () => {
  const [activeTab, setActiveTab] = useState("allTask");
  //   const task = useSelector((state: any) => state.RFQInfos.RFQData);
  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 py-2 backdrop-blur-2xl bg-linear-to-t from-white/60 to-white/80 border-b rounded-t-2xl flex flex-col md:flex-row items-center justify-end gap-4">
          <div className="flex flex-row gap-3 items-end justify-end">
            <button
              onClick={() => setActiveTab("activeTask")}
              className={`px-1.5 md:px-4 py-2 rounded-lg ${
                activeTab === "activeTask"
                  ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                  : "md:text-base text-sm bg-teal-700 text-white font-semibold"
              }`}
            >
              Active Tasks
            </button>
            <button
              onClick={() => setActiveTab("allTask")}
              className={`px-1.5 md:px-4 py-2 rounded-lg ${
                activeTab === "allTask"
                  ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                  : "md:text-base text-sm bg-teal-700 text-white font-semibold"
              }`}
            >
              All Task
            </button>

            <button
              onClick={() => setActiveTab("addTask")}
              className={`px-1.5 md:px-4 py-2 rounded-lg ${
                activeTab === "addTask"
                  ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                  : "md:text-base text-sm bg-teal-700 text-white font-semibold"
              }`}
            >
              Add Task
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-white p-2 rounded-b-2xl overflow-y-auto">
        {activeTab === "activeTask" && (
          <div>
            <AllActiveTask />
          </div>
        )}
        {activeTab === "allTask" && (
          <div>
            <AllTasks />
          </div>
        )}
        {activeTab === "addTask" && (
          <div>
            <AddTask />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskLayout;
