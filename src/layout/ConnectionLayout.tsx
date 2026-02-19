import { useState } from "react";
import { AddConnectionDesigner } from "../components";
import CDdashboard from "../components/connectionDesigner/CDdashboard";

const ConnectionLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const userRole = sessionStorage.getItem("userRole");
  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 py-2 backdrop-blur-2xl bg-linear-to-t from-white/60 to-white/80 rounded-t-md flex flex-wrap items-center justify-center md:justify-end gap-3">

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-sm text-sm sm:font-semibold transition-all border border-black ${activeTab === "dashboard"
                ? "bg-green-200 text-black shadow-md hover:bg-[#5aa33a]"
                : "bg-green-50 text-black hover:bg-green-100 shadow-sm"
              }`}
          >
            Connection Designer Home
          </button>

          {(userRole === "ADMIN" || userRole === "DEPUTY_MANAGER" || userRole === "OPERATION_EXECUTIVE") && (
            <button
              onClick={() => setActiveTab("AddConnectionDesigner")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-sm text-sm sm:font-semibold transition-all border border-black ${activeTab === "AddConnectionDesigner"
                  ? "bg-[#6bbd45] text-black shadow-md hover:bg-[#5aa33a]"
                  : "bg-green-50 text-black hover:bg-green-100 shadow-sm"
                }`}
            >
              Add Connection Designer
            </button>
          )}
        </div>
        <div className="grow p-2 bg-white rounded-b-md">
          {activeTab === "dashboard" && (
            <div className="h-full">
              <CDdashboard />
            </div>
          )}
          {activeTab === "AddConnectionDesigner" && (
            <div>
              {" "}
              <AddConnectionDesigner />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionLayout;
