import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Service from "../../api/Service";
import type { RFIItem } from "../../interface";
import { AlertCircle, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../ui/table";
import Button from "../fields/Button";
import RenderFiles from "../ui/RenderFiles";
import RFIResponseModal from "./RFIResponseModal";
import RFIResponseDetailsModal from "./RFIResponseDetailsModal";

const Info = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <h4 className="text-sm text-gray-700">{label}</h4>
    <div className="text-gray-700 font-medium">{value}</div>
  </div>
);

interface GetRFIByIDProps {
  id: string;
  onClose?: () => void;
}

const GetRFIByID = ({ id, onClose }: GetRFIByIDProps) => {
  const [loading, setLoading] = useState(true);
  const [rfi, setRfi] = useState<RFIItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);

  //
  const fetchRfi = async () => {
    try {
      setLoading(true);
      const response = await Service.GetRFIbyId(id);
      setRfi(response.data);
    } catch (err) {
      setError("Failed to load RFI");
    } finally {
      setLoading(false);
    }
  };

  console.log(rfi);
  useEffect(() => {
    if (id) fetchRfi();
  }, [id]);
  console.log(id);

  if (loading || error || !rfi) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-green-600" />
              <span className="text-gray-700">Loading RFI details...</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-600">{error || "RFI not found"}</span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-red-50 text-black border border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-xs uppercase tracking-tight shadow-sm"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>,
      document.body
    );
  }
  const userRole = sessionStorage.getItem("userRole");

  const responseColumns: ColumnDef<any>[] = [
    {
      accessorKey: "createdByRole",
      header: "From",
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {row.original.createdByRole === "CLIENT" ? "Client" : "WBT Team"}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Message",
      cell: ({ row }) => (
        <p className="truncate max-w-[180px]">
          {row.original.reason || row.original.description}
        </p>
      ),
    },
    {
      accessorKey: "files",
      header: "Files",
      cell: ({ row }) => {
        const count = row.original.files?.length ?? 0;
        return count > 0 ? (
          <span className="text-black font-medium">{count} file(s)</span>
        ) : (
          <span className="text-gray-400">—</span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-gray-700 text-sm">
          {new Date(row.original.date).toLocaleString()}
        </span>
      ),
    },

    {
      accessorKey: "reason",
      header: "Message",
      cell: ({ row }) => (
        <div
          style={{ marginLeft: row.original.parentResponseId ? "20px" : "0px" }}
        >
          {row.original.reason}
        </div>
      ),
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-tight ${row.original.status === "OPEN"
            ? "bg-gray-100 text-black border border-gray-200"
            : "bg-gray-100 text-black border border-gray-200"
            }`}
        >
          {row.original.status}
        </span>
      ),
    },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-xl font-black text-black flex items-center gap-2 uppercase tracking-tight">
              RFI Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 sm:p-6 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: RFI Details */}
            <div className="bg-[#fafffb] border border-green-100/50 p-6 rounded-3xl shadow-sm space-y-5">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-black uppercase tracking-tight">
                  {rfi.subject}
                </h1>
                <span
                  className="px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-gray-100 text-black border border-gray-200"
                >
                  {rfi.isAproovedByAdmin ? "Approved" : "Pending"}
                </span>
              </div>

              {/* Basic Info */}
              <Info label="Project" value={rfi.project?.name || "—"} />
              <Info label="Fabricator" value={rfi?.fabricator?.fabName || "—"} />
              <Info
                label="Created At"
                value={new Date(rfi?.date).toLocaleString()}
              />

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
                <div
                  className="text-gray-700 bg-gray-50 p-3 rounded-lg border prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: rfi.description || "No description provided",
                  }}
                />
              </div>

              {/* Files */}
              <RenderFiles
                files={rfi.files}
                table="rFI"
                parentId={rfi.id}
              />
            </div>

            {/* RIGHT: Responses */}
            <div className="bg-[#fafffb] border border-green-100/50 p-6 rounded-3xl shadow-sm space-y-6">
              {/* Header + Add Response Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-black uppercase tracking-tight">Responses</h2>

                {(userRole === "CLIENT" || userRole === "CLIENT_ADMIN") && (
                  <Button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-black text-white rounded-lg font-bold uppercase tracking-tight hover:bg-black/90 transition-all border border-black shadow-md"
                  >
                    + Add Response
                  </Button>
                )}
              </div>

              {/* Table */}
              {rfi.rfiresponse?.length > 0 ? (
                <DataTable
                  columns={responseColumns}
                  data={rfi.rfiresponse}
                  pageSizeOptions={[5, 10]}
                  onRowClick={(row) => setSelectedResponse(row)}
                />
              ) : (
                <p className="text-gray-700 italic">No responses yet.</p>
              )}
            </div>

            {/* Response Modal */}
            {showModal && (
              <RFIResponseModal
                rfiId={id}
                onClose={() => setShowModal(false)}
                onSuccess={fetchRfi}
              />
            )}

            {/* Details Modal */}
            {selectedResponse && (
              <RFIResponseDetailsModal
                response={selectedResponse}
                onClose={() => setSelectedResponse(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GetRFIByID;
