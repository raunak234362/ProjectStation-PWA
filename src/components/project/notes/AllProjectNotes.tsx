import { useEffect, useState } from "react";
import { Loader2, Inbox } from "lucide-react";
import Service from "../../../api/Service";
import { toast } from "react-toastify";
import AddProjectNote from "./AddProjectNote";
import NoteResponseModal from "./NoteResponseModal";
import NoteResponseDetailsModal from "./NoteResponseDetailsModal";
import ProjectNoteItem from "./ProjectNoteItem";

interface Note {
  id: string;
  title?: string;
  content: string;
  visibility?: string;
  createdAt?: string;
  createdBy?: {
    id: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
  files?: { id: string; originalName?: string; fileName?: string }[];
  responses?: any[];
  serialNo?: string;
  priority?: string | number;
  flags?: string[];
  taggedUsers?: any[];
  taggedUserIds?: any[];
  colorCode?: string;
}

const AllProjectNotes = ({
  projectId,
  project,
}: {
  projectId: string;
  project?: any;
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showResponseModal, setShowResponseModal] = useState<string | null>(
    null,
  );
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await Service.GetTeamMeetingNotesByProjectId(projectId);
      const all = res?.data ?? res ?? [];
      const arr = Array.isArray(all) ? all : [];
      setNotes(arr);
    } catch (err) {
      console.error("Error fetching project notes:", err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [projectId]);

  const fetchResponsesForNote = async (noteId: string) => {
    try {
      const res = await Service.Getallrepliesforanote(noteId);
      const responses = res?.data ?? res ?? [];
      setNotes((prev: Note[]) =>
        prev.map((n: Note) => (n.id === noteId ? { ...n, responses } : n)),
      );
    } catch (err) {
      console.error("Error fetching responses for note:", err, noteId);
    }
  };

  const handleExpandNote = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      fetchResponsesForNote(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      setDeletingId(id);
      await Service.DeleteTeamMeetingNotes(id);
      toast.success("Note deleted successfully");
      fetchNotes();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete note");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteResponse = async (id: string, noteId: string) => {
    if (!window.confirm("Are you sure you want to delete this response?"))
      return;
    try {
      await Service.DeleteTeamMeetingResponse(id);
      toast.success("Response deleted successfully");
      fetchResponsesForNote(noteId);
    } catch (err) {
      console.error("Delete response failed:", err);
      toast.error("Failed to delete response");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-700">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        Loading Project Notes...
      </div>
    );
  }

  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";
  const isAuthorized = [
    "admin",
    "project_manager",
    "deputy_manager",
    "client",
    "client_admin",
    "project_manager_officer",
    "operation_executive",
    "estimation_head",
    "connection_designer_engineer",
    "connection_designer_admin",
  ].includes(userRole);

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-[#6bbd45] rounded-full shrink-0"></span>
          Project Notes
        </h3>
        {/* <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-200 border border-black font-semibold text-black rounded-xl text-[10px] uppercase shadow-xl hover:bg-green-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          + Add New Note
        </button> */}
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Inbox className="w-12 h-12 mb-4 text-gray-200" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            No Project Notes Found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notes.map((note: Note) => (
            <ProjectNoteItem
              key={note.id}
              note={note}
              isExpanded={expandedId === note.id}
              onExpand={handleExpandNote}
              onDelete={handleDelete}
              onDeleteResponse={handleDeleteResponse}
              onShowResponseModal={(id) => setShowResponseModal(id)}
              onSelectResponse={(resp, noteId) => {
                setSelectedResponse(resp);
                setActiveNoteId(noteId);
              }}
              deletingId={deletingId}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <AddProjectNote
              projectId={projectId}
              project={project}
              onClose={() => setShowAddModal(false)}
              onSuccess={() => {
                setShowAddModal(false);
                fetchNotes();
              }}
            />
          </div>
        </div>
      )}

      {showResponseModal && (
        <NoteResponseModal
          noteId={showResponseModal}
          onClose={() => setShowResponseModal(null)}
          onSuccess={() => {
            fetchResponsesForNote(showResponseModal);
          }}
        />
      )}

      {selectedResponse && activeNoteId && (
        <NoteResponseDetailsModal
          noteId={activeNoteId}
          response={selectedResponse}
          onClose={() => {
            setSelectedResponse(null);
            setActiveNoteId(null);
          }}
          onSuccess={() => {
            fetchResponsesForNote(activeNoteId);
          }}
        />
      )}
    </div>
  );
};

export default AllProjectNotes;
