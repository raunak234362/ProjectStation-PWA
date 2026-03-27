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

  const btnClass = (tab: string) =>
    `px-6 py-2 rounded-lg text-sm font-bold transition-all border border-black ${activeTab === tab
      ? "bg-green-200"
      : "bg-green-50 hover:bg-green-100"
    } text-black`;

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white">
      <div className="px-8 py-6 flex flex-row items-center justify-start gap-4">
        <button onClick={() => setActiveTab("allSubmittals")} className={btnClass("allSubmittals")}>All Submittals</button>
        {userRole !== "client" && userRole !== "client_admin" && (
          <button onClick={() => setActiveTab("addSubmittal")} className={btnClass("addSubmittal")}>Add Submittal</button>
        )}
      </div>
      <div className="flex-1 min-h-0 px-8 pb-8 overflow-y-auto">
        {activeTab === "allSubmittals" && <AllSubmittals submittalData={submittalData} />}
        {activeTab === "addSubmittal" && (
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
