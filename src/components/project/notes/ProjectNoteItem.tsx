import React from "react";
import {
  Loader2,
  Calendar,
  Trash2,
  ChevronDown,
  ChevronUp,
  Flag,
  AlertCircle,
} from "lucide-react";
import RenderFiles from "../../ui/RenderFiles";
import ProjectNoteResponses from "./ProjectNoteResponses";
import { formatDateTime } from "../../../utils/dateUtils";
import { truncateWords } from "../../../utils/stringUtils";

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

interface ProjectNoteItemProps {
  note: Note;
  isExpanded: boolean;
  onExpand: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteResponse: (id: string, noteId: string) => void;
  onShowResponseModal: (noteId: string) => void;
  onSelectResponse: (response: any, noteId: string) => void;
  deletingId: string | null;
}

const ProjectNoteItem: React.FC<ProjectNoteItemProps> = ({
  note,
  isExpanded,
  onExpand,
  onDelete,
  onDeleteResponse,
  onShowResponseModal,
  onSelectResponse,
  deletingId,
}) => {
  const getPriorityBadge = (priority?: string | number) => {
    const p = Number(priority);
    switch (p) {
      case 4:
        return (
          <span className="bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-red-100 flex items-center gap-1">
            <AlertCircle size={8} />
            Critical
          </span>
        );
      case 3:
        return (
          <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-orange-100">
            Urgent
          </span>
        );
      case 2:
        return (
          <span className="bg-yellow-50 text-yellow-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-yellow-100">
            High
          </span>
        );
      case 1:
        return (
          <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-blue-100">
            Medium
          </span>
        );
      case 0:
        return (
          <span className="bg-gray-50 text-gray-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-gray-100">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
        isExpanded
          ? "shadow-md scale-[1.01]"
          : "hover:border-gray-200 shadow-sm"
      }`}
      style={{
        borderLeftWidth: note.colorCode ? "6px" : "1px",
        borderLeftColor: note.colorCode || (isExpanded ? "#6bbd45" : "#f3f4f6"),
        borderColor: isExpanded ? "#6bbd45" : undefined,
      }}
    >
      <button
        onClick={() => onExpand(note.id)}
        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-gray-50/50"
      >
        <div className="flex-1 min-w-0 pr-4">
        
          <div className="flex flex-wrap gap-1.5 mb-2">
            {note.flags &&
              note.flags.length > 0 &&
              note.flags.map((flag, idx) => (
                <span
                  key={idx}
                  className="text-[8px] font-black bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded tracking-widest whitespace-nowrap uppercase border border-gray-200 flex items-center gap-1"
                >
                  <Flag size={8} className="text-[#6bbd45]" />
                  {flag}
                </span>
              ))}
               {getPriorityBadge(note.priority)}
            {(() => {
              const rawList = [
                ...(note.taggedUsers || []),
                ...(note.taggedUserIds || []),
              ];
              const seenIds = new Set();
              const uniqueList = [];
              for (const u of rawList) {
                const curId =
                  u.id ||
                  u._id ||
                  (typeof u === "string" ? u : JSON.stringify(u));
                if (!seenIds.has(curId)) {
                  seenIds.add(curId);
                  uniqueList.push(u);
                }
              }
              return uniqueList.map((u, idx) => {
                const name =
                  typeof u === "string"
                    ? u
                    : `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
                      u.username;
                if (!name) return null;
                return (
                  <span
                    key={u.id || u._id || idx}
                    className="text-[9px] font-black bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded tracking-widest whitespace-nowrap uppercase border border-purple-200"
                  >
                    @{name}
                  </span>
                );
              });
            })()}
          </div>
          <div className="text-sm font-black text-black truncate pr-4 uppercase tracking-tight mb-2">
            {note.title ||
              truncateWords(
                note.content?.replace(/<[^>]*>?/gm, "") || "Untitled Note",
                10,
              )}
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
              onDelete(note.id);
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

      {isExpanded && (
        <div className="px-5 pb-5 space-y-6 border-t border-gray-100 pt-5 bg-white">
          {/* Content */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Observation / Discussion
            </p>
            {note.title && (
              <h4 className="text-sm font-black text-black uppercase tracking-tight">
                {note.title}
              </h4>
            )}
            <div
              className="text-gray-700 bg-gray-50/50 p-4 rounded-xl border border-gray-100 font-medium text-sm rich-text-content"
              dangerouslySetInnerHTML={{
                __html: note.content || "No content.",
              }}
            />
          </div>

          {/* Files */}
          {note.files && note.files.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Attached Intelligence
              </p>
              <RenderFiles
                files={note.files}
                table="teamMeetingNotes"
                parentId={note.id}
                hideHeader
                formatDate={formatDateTime}
              />
            </div>
          )}

          {/* Responses Section */}
          <ProjectNoteResponses
            noteId={note.id}
            responses={note.responses || []}
            onShowResponseModal={onShowResponseModal}
            onDeleteResponse={onDeleteResponse}
            onSelectResponse={onSelectResponse}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectNoteItem;
