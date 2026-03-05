import { useState } from "react";
import { AddDepartment, AllDepartments } from "../components";

const DepartmentLayout = () => {
  const [activeTab, setActiveTab] = useState("alldepartment");
  const userRole = sessionStorage.getItem("userRole");

  const btnClass = (tab: string) =>
    `px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all border border-black ${activeTab === tab
      ? "bg-green-200 text-black shadow-medium"
      : "text-black hover:bg-green-50"
    }`;

  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-black/5 rounded-t-2xl flex flex-col md:flex-row items-center justify-end gap-6">
          <div className="flex flex-row gap-4 items-center justify-end">
            <button onClick={() => setActiveTab("alldepartment")} className={btnClass("alldepartment")}>
              All Departments
            </button>
            {(userRole === "ADMIN" || userRole === "HUMAN_RESOURCE") && (
              <button onClick={() => setActiveTab("addDepartment")} className={btnClass("addDepartment")}>
                Add Department
              </button>
            )}
          </div>
        </div>
        <div className="grow p-2 bg-white rounded-b-2xl">
          {activeTab === "alldepartment" && <div><AllDepartments /></div>}
          {activeTab === "addDepartment" && <div> <AddDepartment /></div>}
        </div>
      </div>
    </div>
  );
};

export default DepartmentLayout;
