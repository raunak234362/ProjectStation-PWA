import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  Inbox,
  Calendar,
  Trash2,
  ChevronDown,
  ChevronUp,
  Paperclip,
  X,
  FileText,
  ArrowLeftRight,
} from "lucide-react";
import { toast } from "react-toastify";
import Service from "../api/Service";
import RichTextEditor from "../components/fields/RichTextEditor";
import RenderFiles from "../components/ui/RenderFiles";
import ProjectNoteResponses from "../components/project/notes/ProjectNoteResponses";
import NoteResponseModal from "../components/project/notes/NoteResponseModal";
import NoteResponseDetailsModal from "../components/project/notes/NoteResponseDetailsModal";
import { formatDateTime } from "../utils/dateUtils";

interface WireTransfer {
  id: string;
  _id?: string;
  subject?: string;
  description?: string;
  date?: string;
  createdAt?: string;
  createdBy?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  files?: { id: string; originalName?: string; fileName?: string }[];
  invoices?: any[];
}

const WireTransferPage = () => {
  const [notes, setNotes] = useState<WireTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchWireTransfers = async () => {
    try {
      setLoading(true);
      const res = await Service.GetAllInvoiceWireTransfers();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      // Sort by date descending
      data.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      setNotes(data);
    } catch (err) {
      console.error("Error loading wire transfers:", err);
      toast.error("Failed to load wire transfers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWireTransfers();
  }, []);

  const handleExpandNote = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this wire transfer notification?")) return;
    try {
      setDeletingId(id);
      await Service.DeleteWireTransfer(id);
      toast.success("Wire transfer notification deleted successfully");
      fetchWireTransfers();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete notification");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col w-full p-4 md:p-6 space-y-8 bg-white min-h-full animate-in fade-in duration-500 overflow-y-auto">
      {/* Page Title & Actions */}
      <div className="border-b border-black/5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-widest flex items-center gap-3">
            <ArrowLeftRight className="w-7 h-7 text-[#6bbd45]" />
            Wire Transfer Notifications
          </h1>
          <p className="text-xs text-gray-500 uppercase font-semibold mt-1 tracking-wider">
            Notify and track wire transfers made against project invoices
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#6bbd45]/50 border border-black font-black text-black rounded-xl text-xs uppercase shadow-md hover:bg-[#59a83a] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
        >
          + Add Wire Transfer
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-700">
          <Loader2 className="w-8 h-8 animate-spin text-green-500 mb-2" />
          <p className="text-sm font-black text-black uppercase tracking-widest">Loading Wire Transfers...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
          <Inbox className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            No Wire Transfer Notifications Found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {notes.map((note: WireTransfer) => {
            const displayId = note.id || note._id || "";
            const displaySubject = note.subject || "Untitled Wire Transfer";
            const isExpanded = expandedId === displayId;

            return (
              <div
                key={displayId}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? "shadow-md scale-[1.01]" : "hover:border-gray-200 shadow-sm"
                  }`}
                style={{
                  borderLeftWidth: "6px",
                  borderLeftColor: isExpanded ? "#6bbd45" : "#e5e7eb",
                  borderColor: isExpanded ? "#6bbd45" : undefined,
                }}
              >
                <button
                  onClick={() => handleExpandNote(displayId)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-gray-50/50"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {note.date && (
                        <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded tracking-widest whitespace-nowrap uppercase border border-blue-200">
                          Transfer Date: {new Intl.DateTimeFormat("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(note.date))}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-black text-black truncate pr-4 uppercase tracking-tight mb-2">
                      {displaySubject}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {note.createdBy && (
                        <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                          {note.createdBy.firstName} {note.createdBy.lastName}
                        </span>
                      )}
                      {note.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Intl.DateTimeFormat("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(note.createdAt))}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(displayId);
                      }}
                      disabled={deletingId === displayId}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete notification"
                    >
                      {deletingId === displayId ? (
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

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-6 border-t border-gray-100 pt-5 bg-white">
                    {/* Content */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Wire Transfer Details
                      </p>
                      <div
                        className="text-gray-700 bg-gray-50/50 p-4 rounded-xl border border-gray-100 font-medium text-sm rich-text-content"
                        dangerouslySetInnerHTML={{
                          __html: note.description || "No details provided.",
                        }}
                      />
                    </div>

                    {/* Files */}
                    {note.files && note.files.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Receipts / Attachments
                        </p>
                        <RenderFiles
                          files={note.files}
                          table="invoiceWireTransfer"
                          parentId={displayId}
                          hideHeader
                          formatDate={formatDateTime}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddWireTransferModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchWireTransfers();
          }}
        />
      )}


    </div>
  );
};

interface AddWireTransferModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddWireTransferModal = ({ onClose, onSuccess }: AddWireTransferModalProps) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return setError("Subject is required");
    if (!description.trim()) return setError("Description is required");
    // Removed invoice requirement since it is now optional

    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("subject", subject.trim());
      formData.append("description", description.trim());
      formData.append("date", date);
      
      files.forEach((file) => formData.append("files", file));

      // Use the actual wire transfer service here
      await Service.CreateInvoiceWireTransfer(formData);
      toast.success("Wire transfer notification added successfully!");
      onSuccess();
    } catch (err: any) {
      console.error("Error adding wire transfer:", err);
      const errorMessage = err?.response?.data?.message || "Failed to submit wire transfer. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
            <FileText size={18} className="text-[#6bbd45]" />
            Add Wire Transfer Notification
          </h3>
          <button
            onClick={onClose}
            className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Form */}
        <form
          id="add-wire-transfer-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Wire Transfer for Project X"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6bbd45]/40 focus:border-[#6bbd45] transition-all font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">
                Transfer Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6bbd45]/40 focus:border-[#6bbd45] transition-all font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#6bbd45]/40 transition-all">
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Enter detailed description..."
              />
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">
              Receipt / Attachments
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-[#6bbd45] hover:text-[#6bbd45] transition-colors cursor-pointer"
            >
              <Paperclip size={14} />
              Attach files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 bg-[#6bbd45]/10 border border-[#6bbd45]/30 text-black text-xs px-3 py-1.5 rounded-lg"
                  >
                    <Paperclip size={10} />
                    <span className="max-w-[140px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="ml-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error message */}
          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-wire-transfer-form"
            disabled={submitting}
            className="px-6 py-2 rounded-xl bg-[#6bbd45]/50 text-black border border-black text-sm font-black uppercase tracking-tight hover:bg-[#59a83a] transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Save Wire Transfer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WireTransferPage;
