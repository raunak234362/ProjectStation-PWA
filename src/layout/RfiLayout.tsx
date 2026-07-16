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

  const showAddButton =
    userRole !== "client" &&
    userRole !== "client_admin" &&
    userRole !== "client_estimator";

  const btnClass = (tab: string) =>
    `px-6 py-1.5 rounded-lg border-2 font-bold text-sm uppercase tracking-tight transition-all shadow-sm ${activeTab === tab
      ? "bg-green-50 text-black border-green-700/80 hover:bg-green-100"
      : "bg-white text-black border-black/10 hover:bg-gray-50 hover:border-black/20"
    }`;

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white project-component-container">
      {showAddButton && (
        <div className="px-8 py-6 flex flex-row items-center justify-start gap-4">
          <button onClick={() => setActiveTab("allRFI")} className={btnClass("allRFI")}>All RFI</button>
          <button onClick={() => setActiveTab("addRFI")} className={btnClass("addRFI")}>Create RFI</button>
        </div>
      )}
      <div className={`flex-1 min-h-0 px-8 pb-8 overflow-y-auto ${!showAddButton ? "pt-8" : ""}`}>
        {activeTab === "allRFI" && <AllRFI rfiData={rfiData} projectId={project?.id || project?._id} />}
        {showAddButton && activeTab === "addRFI" && (
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
