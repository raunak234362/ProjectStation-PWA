import React from "react";
import { Trash2 } from "lucide-react";
import DataTable from "../../ui/table";
import { formatDateTime } from "../../../utils/dateUtils";
import { truncateWords } from "../../../utils/stringUtils";

interface ProjectNoteResponsesProps {
  noteId: string;
  responses: any[];
  onShowResponseModal: (noteId: string) => void;
  onDeleteResponse: (id: string, noteId: string) => void;
  onSelectResponse: (response: any, noteId: string) => void;
}

const ProjectNoteResponses: React.FC<ProjectNoteResponsesProps> = ({
  noteId,
  responses,
  onShowResponseModal,
  onDeleteResponse,
  onSelectResponse,
}) => {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#6bbd45] rounded-full"></span>
          Responses
        </h4>
        <button
          onClick={() => onShowResponseModal(noteId)}
          className="text-[11px] font-black text-black border border-black uppercase tracking-widest hover:bg-green-200 px-4 py-1.5  rounded-lg"
        >
          + Add Response
        </button>
      </div>

      {responses && responses.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <DataTable
            columns={[
              {
                accessorKey: "content",
                header: "Message",
                cell: ({ row }: any) => {
                  const plainText = truncateWords(
                    row.original.content || "",
                    20,
                  );
                  return (
                    <div className="space-y-1">
                      <p className="truncate max-w-[300px] text-xs sm:text-sm font-medium">
                        {plainText}
                      </p>
                    </div>
                  );
                },
              },
              {
                accessorKey: "files",
                header: "Files",
                cell: ({ row }: any) => {
                  const count = row.original.files?.length ?? 0;
                  return count > 0 ? (
                    <span className="text-black font-medium text-xs">
                      {count} file(s)
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  );
                },
              },
              {
                accessorKey: "createdAt",
                header: "Date",
                cell: ({ row }: any) => (
                  <span className="text-gray-500 text-[10px] sm:text-xs">
                    {formatDateTime(row.original.createdAt)}
                  </span>
                ),
              },
              {
                id: "actions",
                header: "Actions",
                cell: ({ row }: any) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteResponse(row.original.id, noteId);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete response"
                  >
                    <Trash2 size={14} />
                  </button>
                ),
              },
            ]}
            data={responses.filter((r: any) => r && !r.parentResponseId) || []}
            detailComponent={({ row }: any) => {
              const replies =
                responses.filter(
                  (r: any) => r && r.parentResponseId === row.id,
                ) || [];
              if (replies.length === 0) return null;
              return (
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 ml-8 mb-4 space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#6bbd45] rounded-full"></span>
                    Replies ({replies.length})
                  </p>
                  <div className="space-y-3">
                    {replies.map((reply: any) => (
                      <div
                        key={reply.id}
                        className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm transition-all hover:border-[#6bbd45]/20"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold text-[#6bbd45] uppercase tracking-wider">
                            {reply.createdBy
                              ? `${reply.createdBy.firstName} ${reply.createdBy.lastName}`
                              : reply.firstName
                                ? `${reply.firstName} ${reply.lastName}`
                                : "User"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">
                              {formatDateTime(reply.createdAt)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteResponse(reply.id, noteId);
                              }}
                              className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                              title="Delete reply"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                        <div
                          className="text-xs text-gray-700 line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: reply.content,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
            onRowClick={(row) => {
              onSelectResponse(row, noteId);
            }}
            pageSizeOptions={[5, 10]}
          />
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest italic">
            No responses recorded
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectNoteResponses;
