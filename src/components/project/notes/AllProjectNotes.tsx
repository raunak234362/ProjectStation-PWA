import { useEffect, useState } from "react";
import {
    Loader2,
    Plus,
    FileText,
    Calendar,
    User,
    ChevronDown,
    ChevronUp,
    Trash2,
    Paperclip,
} from "lucide-react";
import Service from "../../../api/Service";
import AddProjectNote from "./AddProjectNote";
import { openFileSecurely } from "../../../utils/openFileSecurely";

interface Note {
    id: string;
    title: string;
    content: string;
    visibility?: string;
    createdAt?: string;
    createdBy?: { firstName?: string; lastName?: string };
    files?: { id: string; originalName?: string; fileName?: string }[];
}

const AllProjectNotes = ({ projectId }: { projectId: string }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            // Fetch all notes then filter by projectId (API returns all, we filter)
            const res = await Service.GetTeamMeetingNotesAll();
            const all = res?.data ?? res ?? [];
            const arr = Array.isArray(all) ? all : [];
            setNotes(arr.filter((n: any) => !projectId || n.projectId === projectId));
        } catch (err) {
            console.error("Error fetching project notes:", err);
            setNotes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) fetchNotes();
    }, [projectId]);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this note?")) return;
        try {
            setDeletingId(id);
            await Service.DeleteTeamMeetingNotes(id);
            setNotes((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error("Error deleting note:", err);
        } finally {
            setDeletingId(null);
        }
    };


    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
                    <FileText size={18} className="text-[#6bbd45]" />
                    Team Meeting Notes
                </h3>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-black border border-[#6bbd45] rounded-lg hover:bg-green-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
                >
                    <Plus size={14} />
                    Add Note
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#6bbd45]" />
                </div>
            ) : notes.length === 0 ? (
                <div className="text-center py-14 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No project notes yet.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-2 text-[#6bbd45] font-bold hover:underline text-sm"
                    >
                        Create the first note
                    </button>
                </div>
            ) : (
                <div className="grid gap-3">
                    {notes.map((note) => {
                        const isExpanded = expandedId === note.id;
                        const creatorName = [
                            note.createdBy?.firstName,
                            note.createdBy?.lastName,
                        ]
                            .filter(Boolean)
                            .join(" ");

                        return (
                            <div
                                key={note.id}
                                className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden border-l-[4px] border-l-[#6bbd45]"
                            >
                                {/* Note Header */}
                                <button
                                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                                    onClick={() =>
                                        setExpandedId(isExpanded ? null : note.id)
                                    }
                                >
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <span className="font-black text-black text-sm uppercase tracking-tight truncate">
                                            {note.title}
                                        </span>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            {creatorName && (
                                                <span className="flex items-center gap-1">
                                                    <User size={10} />
                                                    {creatorName}
                                                </span>
                                            )}
                                            {note.createdAt && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    {new Date(note.createdAt).toLocaleString()}
                                                </span>
                                            )}

                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(note.id);
                                            }}
                                            disabled={deletingId === note.id}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete note"
                                        >
                                            {deletingId === note.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={14} />
                                            )}
                                        </button>
                                        {isExpanded ? (
                                            <ChevronUp size={16} className="text-gray-400" />
                                        ) : (
                                            <ChevronDown size={16} className="text-gray-400" />
                                        )}
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                                        {/* Content */}
                                        <div
                                            className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100"
                                            dangerouslySetInnerHTML={{
                                                __html: note.content || "No content.",
                                            }}
                                        />

                                        {/* Files */}
                                        {note.files && note.files.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    Attachments
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {note.files.map((file) => (
                                                        <button
                                                            key={file.id}
                                                            onClick={() =>
                                                                openFileSecurely(
                                                                    "team-meeting-notes",
                                                                    note.id,
                                                                    file.id,
                                                                )
                                                            }
                                                            className="flex items-center gap-1.5 text-xs bg-[#6bbd45]/10 text-black border border-[#6bbd45]/30 px-3 py-1.5 rounded-lg hover:bg-[#6bbd45]/20 transition-colors font-medium"
                                                        >
                                                            <Paperclip size={11} />
                                                            {file.originalName || file.fileName || file.id}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Note Modal */}
            {showAddModal && (
                <AddProjectNote
                    projectId={projectId}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchNotes();
                    }}
                />
            )}
        </div>
    );
};

export default AllProjectNotes;
