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
  const [filterTab, setFilterTab] = useState("all");
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      let combined: any[] = [];
      try {
        const res = await Service.FetchAllEmployee();
        const d = res?.data?.employees || res?.employees || res || [];
        combined = [...combined, ...(Array.isArray(d) ? d : [])];
      } catch (e) {
        console.error("Error fetching internal employees:", e);
      }

      const cdId = project?.connectionDesignerID || project?.connectionDesigner?.id || project?.connectionDesigner;
      if (cdId) {
        try {
          const res = await Service.FetchConnectionDesignerByID(cdId.id || cdId);
          const cde = res?.data?.CDEngineers || res?.CDEngineers || [];
          combined = [...combined, ...(Array.isArray(cde) ? cde : [])];
        } catch (e) {
          console.error("Error fetching CD engineers:", e);
        }
      }

      const fabId = project?.fabricatorID || project?.fabricator?.id || project?.fabricator;
      if (fabId) {
        try {
          const res = await Service.FetchAllClientsByFabricatorID(fabId.id || fabId);
          const c = res?.data?.data || res?.data || res || [];
          combined = [...combined, ...(Array.isArray(c) ? c : [])];
        } catch (e) {
          console.error("Error fetching clients:", e);
        }
      }

      // Remove duplicates by ID
      const uniqueUsers: any[] = [];
      const seen = new Set();
      for (const u of combined) {
        const uid = u.id || u._id;
        if (!uid || !seen.has(uid)) {
          if (uid) seen.add(uid);
          uniqueUsers.push(u);
        }
      }
      setAllUsers(uniqueUsers);
    };
    fetchAll();
  }, [project]);

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

  const currentUserId = sessionStorage.getItem("userId") || "";

  const getUserRole = (u: any) => {
    if (!u) return "";
    if (typeof u === "string") {
      const found = allUsers.find((user: any) => (user.id || user._id) === u);
      return found ? String(found.role || "") : "";
    }
    if (u.role) return String(u.role);
    const id = u.id || u._id;
    if (id) {
      const found = allUsers.find((user: any) => (user.id || user._id) === id);
      return found ? String(found.role || "") : "";
    }
    return "";
  };

  const isCDRole = (roleStr?: string) => {
    const r = (roleStr || "").toLowerCase();
    return r === "connection_designer" || r === "connection_designer_admin" || r === "connection_designer_engineer" || r.includes("connection_designer");
  };

  const filteredNotes = notes.filter((note) => {
    const hasFullAccess = [
      "admin",
      "project_manager",
      "deputy_manager",
      "project_manager_officer",
      "operation_executive",
      "estimation_head",
      "client_admin",
      "client",
      "connection_designer_engineer",
      "connection_designer_admin",
      "dept_manager",
    ].includes(userRole);

    if (hasFullAccess) return true;

    if (note.createdBy?.id === currentUserId) return true;

    return true;
  });

  const cdFilteredNotes = filteredNotes.filter((note) => {
    const creatorRole = getUserRole(note.createdBy);
    const creatorIsCD = isCDRole(creatorRole);

    const rawTaggedList = [...(note.taggedUsers || []), ...(note.taggedUserIds || [])];
    const hasCDTagged = rawTaggedList.some(u => isCDRole(getUserRole(u)));

    const isCDNote = creatorIsCD || hasCDTagged;

    return filterTab === "cd" ? isCDNote : !isCDNote;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
        <div className="flex gap-6">
          <button
            onClick={() => setFilterTab("all")}
            className={`py-2 px-1 text-sm font-bold tracking-normal border-b-2 transition-colors cursor-pointer ${
              filterTab === "all"
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setFilterTab("cd")}
            className={`py-2 px-1 text-sm font-bold tracking-normal border-b-2 transition-colors cursor-pointer ${
              filterTab === "cd"
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            CD Notes
          </button>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-1.5 bg-green-50 text-black border-2 border-green-700/80 rounded-none hover:bg-green-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm inline-flex items-center justify-center cursor-pointer"
        >
          + Add New Note
        </button>
      </div>

      {cdFilteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Inbox className="w-12 h-12 mb-4 text-gray-200" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            No Project Notes Found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cdFilteredNotes.map((note: Note) => (
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
