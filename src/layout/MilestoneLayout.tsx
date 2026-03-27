import { useState } from "react";
import AllMileStone from "../components/project/mileStone/AllMileStone";
import AddMileStone from "../components/project/mileStone/AddMileStone";

interface MilestoneLayoutProps {
  project: any;
  onUpdate: () => Promise<void>;
}

const MilestoneLayout = ({ project, onUpdate }: MilestoneLayoutProps) => {
  const [activeTab, setActiveTab] = useState("allMilestones");
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";

  const btnClass = (tab: string) =>
    `px-6 py-2 rounded-lg text-sm font-bold transition-all border border-black ${activeTab === tab
      ? "bg-green-200"
      : "bg-green-50 hover:bg-green-100"
    } text-black`;

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white">
      <div className="px-8 py-6 flex flex-row items-center justify-start gap-4">
        <button onClick={() => setActiveTab("allMilestones")} className={btnClass("allMilestones")}>All Milestones</button>
        {userRole !== "client" && userRole !== "client_admin" && (
          <button onClick={() => setActiveTab("addMilestone")} className={btnClass("addMilestone")}>Add Milestone</button>
        )}
      </div>
      <div className="flex-1 min-h-0 px-8 pb-8 overflow-y-auto">
        {activeTab === "allMilestones" && <AllMileStone project={project} onUpdate={onUpdate} />}
        {activeTab === "addMilestone" && (
          <div>
            <AddMileStone
              projectId={project.id}
              fabricatorId={project.fabricator?.id || ""}
              onClose={() => setActiveTab("allMilestones")}
              onSuccess={() => {
                onUpdate();
                setActiveTab("allMilestones");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneLayout;
