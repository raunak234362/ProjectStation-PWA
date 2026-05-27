import { useState } from "react";
import AddRFI from "../components/rfi/AddRFI";
import AllRFI from "../components/rfi/AllRfi";

interface RfiLayoutProps {
  project?: any;
  rfiData?: any[];
  onSuccess?: () => void;
}

const RfiLayout = ({ project, rfiData, onSuccess }: RfiLayoutProps) => {
  const [activeTab, setActiveTab] = useState("allRFI");
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";

  const btnClass = (tab: string) =>
    `px-6 py-1.5 rounded-lg border-2 font-bold text-sm uppercase tracking-tight transition-all shadow-sm ${activeTab === tab
      ? "bg-green-50 text-black border-green-700/80 hover:bg-green-100"
      : "bg-white text-black border-black/10 hover:bg-gray-50 hover:border-black/20"
    }`;

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white">
      <div className="px-8 py-6 flex flex-row items-center justify-start gap-4">
        <button onClick={() => setActiveTab("allRFI")} className={btnClass("allRFI")}>All RFI</button>
        {userRole !== "client" && userRole !== "client_admin" && (
          <button onClick={() => setActiveTab("addRFI")} className={btnClass("addRFI")}>Add RFI</button>
        )}
      </div>
      <div className="flex-1 min-h-0 px-8 pb-8 overflow-y-auto">
        {activeTab === "allRFI" && <AllRFI rfiData={rfiData} />}
        {activeTab === "addRFI" && (
          <div>
            <AddRFI
              project={project}
              onSuccess={() => {
                onSuccess?.();
                setActiveTab("allRFI");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RfiLayout;
