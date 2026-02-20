import { useState } from "react";
import { AddEmployee, AllEmployee } from "../components";

const EmployeeLayout = () => {
  //   console.log("RFQ Component Rendered with projectData:", projectData);
  const [activeTab, setActiveTab] = useState("allEmployee");
  const userRole = sessionStorage.getItem("userRole");
  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-black/5 rounded-t-2xl flex flex-col md:flex-row items-center justify-end gap-6">
          <div className="flex flex-row gap-4 items-center justify-end">
            <button
              onClick={() => setActiveTab("allEmployee")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "allEmployee"
                ? "bg-white text-black shadow-medium border border-black/5"
                : "text-black/40 hover:text-black"
                }`}
            >
              All Employees
            </button>

            {(userRole === "ADMIN" || userRole === "HUMAN_RESOURCE") && (
              <button
                onClick={() => setActiveTab("addEmployee")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "addEmployee"
                  ? "bg-white text-black shadow-medium border border-black/5"
                  : "text-black/40 hover:text-black"
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
