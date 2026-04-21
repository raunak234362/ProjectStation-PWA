import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Service from "../../api/Service";
import type { ChangeOrderItem } from "../../interface";
import { AlertCircle, Loader2, History } from "lucide-react";
import RenderFiles from "../ui/RenderFiles";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../ui/table";
import Button from "../fields/Button";
import CoResponseModal from "./CoResponseModal";
import COResponseDetailsModal from "./CoResponseDetailsModal";

/* -------------------- Small UI Helper -------------------- */
const Info = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <h4 className="text-sm text-gray-700">{label}</h4>
    <div className="text-gray-700 font-medium">{value}</div>
  </div>
);

/* -------------------- Props -------------------- */
interface GetCOByIDProps {
  id: string;
  projectId?: string;
  onClose?: () => void;
}

/* ========================================================= */
/* ======================= COMPONENT ======================= */
/* ========================================================= */

const GetCOByID = ({ id, projectId, onClose }: GetCOByIDProps) => {
  /* -------------------- STATE (ALL HOOKS AT TOP) -------------------- */
  const [loading, setLoading] = useState(true);
  const [co, setCO] = useState<ChangeOrderItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [viewingVersionId, setViewingVersionId] = useState<string | null>(null);

  const userRole = sessionStorage.getItem("userRole");
  console.log(id);

  const sortedVersions = useMemo(() => {
    if (!co?.versions) return [];
    return [...co.versions].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [co?.versions]);

  const hasMultipleVersions = sortedVersions.length > 1;

  const currentVersion = useMemo(() => {
    if (!co) return null;
    const targetId = viewingVersionId || co.currentVersionId;
    return (
      co.versions?.find((v) => v.id === targetId) ||
      sortedVersions[0] ||
      co
    );
  }, [co, sortedVersions, viewingVersionId]);

  const isViewingCurrent = useMemo(() => {
    return currentVersion?.id === co?.currentVersionId || (!co?.versions?.length);
  }, [currentVersion, co]);


  const responses = useMemo(() => {
    try {
      if (!co?.coResponses) return [];
      return Array.isArray(co.coResponses)
        ? co.coResponses
        : JSON.parse(co.coResponses);
    } catch (err) {
      console.error("Failed to parse CO responses", err);
      return [];
    }
  }, [co?.coResponses]);

  /* -------------------- FETCH CO -------------------- */
  const fetchCO = async () => {
    try {
      if (!projectId) {
        setError("Project ID is missing");
        return;
      }

      setLoading(true);

      const response = await Service.GetChangeOrderById(id);
      console.log(response);

      setCO(response.data);
      if (response.data?.currentVersionId) {
        setViewingVersionId(response.data.currentVersionId);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load Change Order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCO();
  }, [id, projectId]);

  /* -------------------- EARLY RETURNS -------------------- */
  if (loading || error || !co) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-green-600" />
              <span className="text-gray-700">Loading Change Order details...</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-600">{error || "Change Order not found"}</span>
              <button
                onClick={onClose}
                className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
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

  /* -------------------- RESPONSE TABLE COLUMNS -------------------- */
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
      accessorKey: "reason",
      header: "Message",
      cell: ({ row }) => (
        <p className="truncate max-w-[220px]">{row.original.reason}</p>
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
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
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

  /* ======================= RENDER ======================= */
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-xl font-black text-black flex items-center gap-2 uppercase tracking-tight">
              Change Order Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 sm:p-6 bg-white space-y-6">
          {/* ================= VERSION SWITCHER (TOP) ================= */}
          {hasMultipleVersions && (
            <div className="bg-[#fafffb] border border-green-100/50 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-black text-black uppercase tracking-tight">
                  Versions
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {sortedVersions.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => setViewingVersionId(v.id)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${viewingVersionId === v.id
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
                      }`}
                  >
                    v{v.versionNumber || sortedVersions.length - idx}
                    {v.id === co.currentVersionId && " (Current)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ================= LEFT: CO DETAILS ================= */}
            <div className="bg-[#fafffb] border border-green-100/50 p-6 rounded-3xl shadow-sm space-y-5">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-black uppercase tracking-tight">
                  COR - {co.changeOrderNumber?.slice(-3)}
                </h1>

                <span
                  className="px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-gray-100 text-black border border-gray-200"
                >
                  {co.isAproovedByAdmin === true
                    ? "Approved"
                    : co.isAproovedByAdmin === false
                      ? "Rejected"
                      : "Pending"}
                </span>
              </div>

              <Info
                label="Sender"
                value={
                  co.senders
                    ? `${co.senders.firstName ?? ""} ${co.senders.lastName ?? ""}`
                    : "—"
                }
              />

              <Info
                label="Recipient"
                value={
                  (co as any).Recipients || co.recipients
                    ? `${((co as any).Recipients || co.recipients).firstName ?? ""} ${((co as any).Recipients || co.recipients).lastName ?? ""}`.trim() || "—"
                    : "—"
                }
              />

              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Remarks</h4>
                <div
                  className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-700 min-h-[50px]"
                  dangerouslySetInnerHTML={{ __html: co.currentVersion?.remarks || co.remarks || "—" }}
                />
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
                <div
                  className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-700 min-h-[50px]"
                  dangerouslySetInnerHTML={{ __html: co.currentVersion?.description || co.description || "—" }}
                />
              </div>

              <RenderFiles
                files={currentVersion?.files || co.files || []}
                table="changeOrders"
                parentId={co.id}
                versionId={currentVersion?.id || co.currentVersionId}
              />

              <div className="pt-4 border-t">
                {isViewingCurrent ? (
                  <button
                    onClick={() => {
                      const data = {
                        id: co.id,
                        changeOrderNumber: co.changeOrderNumber,
                        serialNo: co.serialNo,
                        CoRefersTo: currentVersion?.changeOrderTables || currentVersion?.CoRefersTo || co?.CoRefersTo || [],
                      };
                      sessionStorage.setItem(`coTableData_${co.id}`, JSON.stringify(data));
                      window.open(`/co-table?id=${co.id}`, "_blank");
                    }}
                    className="text-black font-bold uppercase tracking-tight underline hover:text-gray-700 transition-all text-sm"
                  >
                    View Change Order Reference Table
                  </button>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Table view is only available for the current version.
                  </p>
                )}
              </div>
            </div>

            {/* ================= RIGHT: RESPONSES ================= */}
            <div className="bg-[#fafffb] border border-green-100/50 p-6 rounded-3xl shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-black uppercase tracking-tight">
                  Responses
                </h2>

                {(userRole === "CLIENT" || userRole === "CLIENT_ADMIN") && (
                  <Button
                    className="px-4 py-2 bg-green-100 text-black rounded-lg font-bold uppercase tracking-tight hover:bg-green-200 transition-all border border-black shadow-md"
                    onClick={() => setShowResponseModal(true)}
                  >
                    + Add Response
                  </Button>
                )}
              </div>

              {responses.length > 0 ? (
                <DataTable
                  columns={responseColumns}
                  data={responses}
                  pageSizeOptions={[5, 10]}
                  onRowClick={(row) => setSelectedResponse(row)}
                />
              ) : (
                <p className="text-gray-700 italic">No responses yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* ================= MODALS ================= */}
        {showResponseModal && (
          <CoResponseModal
            CoId={id}
            currentVersionId={co.currentVersionId}
            onClose={() => setShowResponseModal(false)}
            onSuccess={fetchCO}
          />
        )}

        {selectedResponse && (
          <COResponseDetailsModal
            response={selectedResponse}
            onClose={() => setSelectedResponse(null)}
            onSuccess={fetchCO}
          />
        )}
      </div>
    </div>,
    document.body
  );
};

export default GetCOByID;
