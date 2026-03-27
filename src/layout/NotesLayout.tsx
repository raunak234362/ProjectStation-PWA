import { useState } from "react";
import AllNotes from "../components/project/notes/AllNotes";
import AddNotes from "../components/project/notes/AddNotes";

interface NotesLayoutProps {
  projectId: string;
}

const NotesLayout = ({ projectId }: NotesLayoutProps) => {
  const [activeTab, setActiveTab] = useState("allNotes");

  const btnClass = (tab: string) =>
    `px-6 py-2 rounded-lg text-sm font-bold transition-all border border-black ${activeTab === tab
      ? "bg-green-200"
      : "bg-green-50 hover:bg-green-100"
    } text-black`;

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white">
      <div className="px-8 py-6 flex flex-row items-center justify-start gap-4">
        <button onClick={() => setActiveTab("allNotes")} className={btnClass("allNotes")}>All Notes</button>
        <button onClick={() => setActiveTab("addNote")} className={btnClass("addNote")}>Add Note</button>
      </div>
      <div className="flex-1 min-h-0 px-8 pb-8 overflow-y-auto">
        {activeTab === "allNotes" && <AllNotes projectId={projectId} />}
        {activeTab === "addNote" && (
          <div>
            <AddNotes
              projectId={projectId}
              onClose={() => setActiveTab("allNotes")}
              onNoteAdded={() => {
                setActiveTab("allNotes");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesLayout;
