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
    `px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-bold transition-all border border-black ${activeTab === tab
      ? "bg-green-200 text-black shadow-medium"
      : "text-black hover:bg-green-50"
    }`;

  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 py-2 backdrop-blur-2xl bg-linear-to-t from-white/60 to-white/80 border-b rounded-t-2xl flex flex-col md:flex-row items-center justify-end gap-4">
          <div className="flex flex-row gap-3 items-end justify-end">
            <button onClick={() => setActiveTab("allSubmittals")} className={btnClass("allSubmittals")}>ALL Submittals</button>
            {userRole !== "client" && userRole !== "client_admin" && (
              <button onClick={() => setActiveTab("addSubmittal")} className={btnClass("addSubmittal")}>Add Submittal</button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-white p-2 rounded-b-2xl overflow-y-auto">
        {activeTab === "allSubmittals" && <div><AllSubmittals submittalData={submittalData} /></div>}
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
