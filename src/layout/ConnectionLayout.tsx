import { useState } from "react";
import { AddConnectionDesigner } from "../components";
import CDdashboard from "../components/connectionDesigner/CDdashboard";

const ConnectionLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const userRole = sessionStorage.getItem("userRole");

  const btnClass = (tab: string) =>
    `flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-bold transition-all border border-black ${activeTab === tab
      ? "bg-green-200 text-black shadow-medium"
      : "text-black hover:bg-green-50"
    }`;

  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 py-2 backdrop-blur-2xl bg-linear-to-t from-white/60 to-white/80 rounded-t-md flex flex-wrap items-center justify-center md:justify-end gap-3">
          <button onClick={() => setActiveTab("dashboard")} className={btnClass("dashboard")}>
            Connection Designer Home
          </button>
          {(userRole === "ADMIN" || userRole === "DEPUTY_MANAGER" || userRole === "OPERATION_EXECUTIVE") && (
            <button onClick={() => setActiveTab("AddConnectionDesigner")} className={btnClass("AddConnectionDesigner")}>
              Add Connection Designer
            </button>
          )}
        </div>
        <div className="grow p-2 bg-white rounded-b-md">
          {activeTab === "dashboard" && <div className="h-full"><CDdashboard /></div>}
          {activeTab === "AddConnectionDesigner" && <div> <AddConnectionDesigner /></div>}
        </div>
      </div>
    </div>
  );
};

export default ConnectionLayout;
