import { useState } from "react";
import AllProjectNotes from "../components/project/notes/AllProjectNotes";
import AddProjectNote from "../components/project/notes/AddProjectNote";

interface ProjectNotesLayoutProps {
  projectId: string;
  project?: any;
}

const ProjectNotesLayout = ({ projectId, project }: ProjectNotesLayoutProps) => {
  const [activeTab, setActiveTab] = useState("allNotes");

  const btnClass = (tab: string) =>
    `px-6 py-2 rounded-lg text-sm font-bold transition-all border border-black ${activeTab === tab
      ? "bg-green-300"
      : "bg-green-50 hover:bg-green-100"
    } text-black`;

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white">
      <div className="px-8 py-6 flex flex-row items-center justify-start gap-4">
        <button onClick={() => setActiveTab("allNotes")} className={btnClass("allNotes")}>Notes</button>
        <button onClick={() => setActiveTab("addNote")} className={btnClass("addNote")}>Create Note</button>
      </div>
      <div className="flex-1 min-h-0 px-8 pb-8 overflow-y-auto">
        {activeTab === "allNotes" && <AllProjectNotes projectId={projectId} project={project} />}
        {activeTab === "addNote" && (
          <div className="max-w-4xl mx-auto">
            <AddProjectNote
              projectId={projectId}
              project={project}
              onClose={() => setActiveTab("allNotes")}
              onSuccess={() => {
                setActiveTab("allNotes");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectNotesLayout;
