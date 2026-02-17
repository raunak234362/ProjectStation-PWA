import React, { useEffect, useState } from "react";
import Service from "../../api/Service";
import { createPortal } from "react-dom";
import { Loader2, AlertCircle } from "lucide-react";
import RenderFiles from "../ui/RenderFiles";
import Button from "../fields/Button";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import SubmittalResponseModal from "./SubmittalResponseModal";
import SubmittalResponseDetailsModal from "./SubmittalResponseDetailsModal";

const Info = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="mb-2">
    <h4 className="text-sm text-gray-700">{label}</h4>
    <div className="font-medium text-gray-700">{value}</div>
  </div>
);

const GetSubmittalByID = ({ id, onClose }: { id: string, onClose?: () => void }) => {
  const [loading, setLoading] = useState(true);
  const [submittal, setSubmittal] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const userRole = sessionStorage.getItem("userRole")?.toUpperCase();
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await Service.GetSubmittalbyId(id);
      setSubmittal(res.data);
    } catch {
      setError("Failed to load submittal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading || !submittal || error) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-green-600" />
              <span className="text-gray-700">Loading submittal details...</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-600">{error || "Submittal not found"}</span>
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

  const responseColumns: ColumnDef<any>[] = [
    {
      accessorKey: "description",
      header: "Message",
      cell: ({ row }) => (
        <div
          className="prose prose-sm max-w-none"
          style={{
            marginLeft: row.original.parentResponseId ? "20px" : "0px",
          }}
          dangerouslySetInnerHTML={{ __html: row.original.description || "—" }}
        />
      ),
    },
    {
      accessorKey: "files",
      header: "Files",
      cell: ({ row }) => {
        const count = row.original.files?.length ?? 0;
        return count > 0 ? `${count} file(s)` : "—";
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-xl font-black text-black flex items-center gap-2 uppercase tracking-tight">
              Submittal Details
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
            {/* LEFT PANEL */}
            <div className="bg-[#fafffb] border border-green-100/50 p-6 rounded-3xl shadow-sm space-y-5">
              <h1 className="text-2xl font-black text-black uppercase tracking-tight">{submittal.subject}</h1>

              <Info label="Project" value={submittal.project?.name || "—"} />
              <Info
                label="Submitted By"
                value={submittal.sender?.firstName || "—"}
              />
              <Info
                label="Created On"
                value={new Date(submittal.date).toLocaleString()}
              />

              {/* <div>
                <h4 className="font-semibold text-gray-700">Description</h4>
                <div
                  className="p-3 bg-gray-50 border rounded-lg prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      submittal.description ||
                      submittal.currentVersion?.description ||
                      "—",
                  }}
                />
              </div> */}

              <RenderFiles
                files={submittal.versions || []}
                table="submittals"
                parentId={submittal.id}
              />
            </div>

            {/* RIGHT PANEL */}
            <div className="bg-[#fafffb] border border-green-100/50 p-6 rounded-3xl shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-black uppercase tracking-tight">
                  Responses
                </h2>
                {(userRole === "CLIENT_ADMIN" || userRole === "CLIENT") && (
                  <Button
                    className="px-4 py-2 bg-green-50 text-black rounded-lg font-bold uppercase tracking-tight hover:bg-black/90 transition-all border border-black shadow-md"
                    onClick={() => setShowResponseModal(true)}
                  >
                    + Add Response
                  </Button>
                )}
              </div>

              {submittal.submittalsResponse?.length > 0 ? (
                <DataTable
                  columns={responseColumns}
                  data={submittal.submittalsResponse}
                  onRowClick={(row) => setSelectedResponse(row)}
                  pageSizeOptions={[5, 10]}
                />
              ) : (
                <p className="text-gray-700 italic">No responses yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* ADD RESPONSE MODAL */}
        {showResponseModal && (
          <SubmittalResponseModal
            submittal={submittal}
            onClose={() => setShowResponseModal(false)}
            onSuccess={() => {
              setShowResponseModal(false);
              fetchData();
            }}
          />
        )}

        {/* RESPONSE DETAILS MODAL */}
        {selectedResponse && (
          <SubmittalResponseDetailsModal
            response={selectedResponse}
            onClose={() => {
              setSelectedResponse(null);
              fetchData();
            }}
          />
        )}
      </div>
    </div>,
    document.body
  );
};

export default GetSubmittalByID;
