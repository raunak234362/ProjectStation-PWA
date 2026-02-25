import { useState } from "react";
import AddRFI from "../components/rfi/AddRFI";
import AllRFI from "../components/rfi/AllRfi";

const RfiLayout = () => {
  const [activeTab, setActiveTab] = useState("addRFI");
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";

  const btnClass = (tab: string) =>
    `px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-bold transition-all border border-black ${activeTab === tab
      ? "bg-green-200 text-black shadow-medium"
      : "text-black hover:bg-green-50"
    }`;

  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 py-2 backdrop-blur-2xl bg-linear-to-t from-white/60 to-white/80 border-b rounded-t-2xl flex flex-col md:flex-row items-center justify-end gap-4">
          <div className="flex flex-row gap-3 items-end justify-end">
            <button onClick={() => setActiveTab("allRFI")} className={btnClass("allRFI")}>ALL RFI</button>
            {userRole !== "client" && userRole !== "client_admin" && (
              <button onClick={() => setActiveTab("addRFI")} className={btnClass("addRFI")}>Add RFI</button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-white p-2 rounded-b-2xl overflow-y-auto">
        {activeTab === "allRFI" && <div><AllRFI /></div>}
        {activeTab === "addRFI" && <div><AddRFI /></div>}
      </div>
    </div>
  );
};

export default RfiLayout;
