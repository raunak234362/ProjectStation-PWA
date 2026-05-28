import { useState } from "react";
import AllSubmittals from "../components/submittals/AllSubmittals";
import AddSubmittal from "../components/submittals/AddSubmittals";

interface SubmittalLayoutProps {
  project: any;
  submittalData: any[];
  onSuccess: () => void;
}

const SubmittalLayout = ({ project, submittalData, onSuccess }: SubmittalLayoutProps) => {
  const [activeTab, setActiveTab] = useState("allSubmittals");
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";

  const showAddButton =
    userRole !== "client" &&
    userRole !== "client_admin" &&
    userRole !== "client_estimator" &&
    userRole !== "connection_designer_engineer" &&
    userRole !== "connection_designer_admin";

  const btnClass = (tab: string) =>
    `px-6 py-1.5 rounded-lg border-2 font-bold text-sm uppercase tracking-tight transition-all shadow-sm ${activeTab === tab
      ? "bg-green-50 text-black border-green-700/80 hover:bg-green-100"
      : "bg-white text-black border-black/10 hover:bg-gray-50 hover:border-black/20"
    }`;

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white project-component-container">
      {showAddButton && (
        <div className="px-8 py-6 flex flex-row items-center justify-start gap-4">
          <button onClick={() => setActiveTab("allSubmittals")} className={btnClass("allSubmittals")}>All Submittals</button>
          <button onClick={() => setActiveTab("addSubmittal")} className={btnClass("addSubmittal")}>Add Submittal</button>
        </div>
      )}
      <div className={`flex-1 min-h-0 px-8 pb-8 overflow-y-auto ${!showAddButton ? "pt-8" : ""}`}>
        {activeTab === "allSubmittals" && <AllSubmittals submittalData={submittalData} />}
        {showAddButton && activeTab === "addSubmittal" && (
          <div>
            <AddSubmittal
              project={project}
              onSuccess={() => {
                onSuccess();
                setActiveTab("allSubmittals");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmittalLayout;
