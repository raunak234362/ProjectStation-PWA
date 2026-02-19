import { useState } from "react";
import CDdashboard from "../components/connectionDesigner/CDdashboard";
import AddVendor from "../components/vendor/designer/AddVendor";

const ConnectionLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  //removed unused userRole
  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 py-2 backdrop-blur-2xl bg-linear-to-t from-white/60 to-white/80 rounded-t-2xl flex flex-wrap items-center justify-center md:justify-end gap-3">

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-[1.25rem] text-sm sm:font-semibold transition-all border border-black ${activeTab === "dashboard"
              ? "bg-[#6bbd45] text-black shadow-md hover:bg-[#5aa33a]"
              : "bg-green-50 text-black hover:bg-green-100 shadow-sm"
              }`}
          >
            Vendor Home
          </button>

          <button
            onClick={() => setActiveTab("AddConnectionDesigner")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-[1.25rem] text-sm sm:font-semibold transition-all border border-black ${activeTab === "AddConnectionDesigner"
              ? "bg-[#6bbd45] text-black shadow-md hover:bg-[#5aa33a]"
              : "bg-green-50 text-black hover:bg-green-100 shadow-sm"
              }`}
          >
            Add Vendor
          </button>
        </div>
        <div className="grow p-2 bg-white rounded-b-2xl">
          {activeTab === "dashboard" && (
            <div className="h-full">
              <CDdashboard />
            </div>
          )}
          {activeTab === "AddConnectionDesigner" && (
            <div>
              {" "}
              <AddVendor />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionLayout;
