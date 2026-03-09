import { useState } from "react";
import { AddEmployee, AllEmployee } from "../components";

const EmployeeLayout = () => {
  //   console.log("RFQ Component Rendered with projectData:", projectData);
  const [activeTab, setActiveTab] = useState("allEmployee");
  const userRole = sessionStorage.getItem("userRole");
  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-4 md:px-6 py-4 bg-gray-50/50 border-b border-black/5 rounded-t-2xl flex flex-col md:flex-row items-center justify-center md:justify-end gap-4 md:gap-6">
          <div className="flex flex-row gap-2 md:gap-4 items-center justify-center md:justify-end w-full md:w-auto">
            <button
              onClick={() => setActiveTab("allEmployee")}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border ${activeTab === "allEmployee"
                ? "bg-green-200 text-black border-black shadow-sm"
                : "text-black/60 border-black/10 hover:bg-green-50"
                }`}
            >
              All Employees
            </button>

            {(userRole === "ADMIN" || userRole === "HUMAN_RESOURCE") && (
              <button
                onClick={() => setActiveTab("addEmployee")}
                className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border ${activeTab === "addEmployee"
                  ? "bg-green-200 text-black border-black shadow-sm"
                  : "text-black/60 border-black/10 hover:bg-green-50"
                  }`}
              >
                Add Employee
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-2 bg-white rounded-b-2xl">
          {activeTab === "allEmployee" && (
            <div>
              <AllEmployee />
            </div>
          )}

          {activeTab === "addEmployee" && (
            <div>
              {" "}
              <AddEmployee />{" "}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
