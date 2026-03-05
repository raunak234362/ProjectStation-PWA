import { useState } from "react";
import AllTasks from "../components/task/AllTasks";
import AddTask from "../components/task/AddTask";
import AllActiveTask from "../components/task/AllActiveTask";

const TaskLayout = () => {
  const [activeTab, setActiveTab] = useState("allTask");

  const btnClass = (tab: string) =>
    `flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-bold transition-all border border-black ${activeTab === tab
      ? "bg-green-200 text-black shadow-medium"
      : "text-black hover:bg-green-50"
    }`;

  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 py-2 backdrop-blur-2xl bg-linear-to-t from-white/60 to-white/80 rounded-t-2xl flex flex-wrap items-center justify-center md:justify-end gap-3">
          <button onClick={() => setActiveTab("allTask")} className={btnClass("allTask")}>All Task</button>
          <button onClick={() => setActiveTab("addTask")} className={btnClass("addTask")}>Add Task</button>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-white p-2 rounded-b-2xl overflow-y-auto">
        {activeTab === "activeTask" && <div><AllActiveTask /></div>}
        {activeTab === "allTask" && <div><AllTasks /></div>}
        {activeTab === "addTask" && <div><AddTask /></div>}
      </div>
    </div>
  );
};

export default TaskLayout;
