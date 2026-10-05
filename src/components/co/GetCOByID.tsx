import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Service from "../../api/Service";
import type { ChangeOrderItem } from "../../interface";
import { AlertCircle, Loader2 } from "lucide-react";
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

  const [responses, setResponses] = useState<any[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);

  const userRole = sessionStorage.getItem("userRole");
  console.log(id);

  const effectiveProjectId =
    projectId ||
    (typeof co?.project === "string"
      ? co.project
      : (co?.project as any)?.id ||
      (co as any)?.projectId ||
      (co as any)?.project_id);

  const sortedVersions = useMemo(() => {
    if (!co?.versions) return [];
    return [...co.versions].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [co?.versions]);

  const isClientRole = userRole === "CLIENT" || userRole === "CLIENT_ADMIN";
  const hasMultipleVersions = sortedVersions.length > 1 && !isClientRole;

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

  /* -------------------- EXTRACT RESPONSES HELPER -------------------- */
  const extractResponsesArray = (res: any): any[] => {
    if (!res) return [];
    if (typeof res === "string") {
      try {
        const parsed = JSON.parse(res);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.responses)) return res.responses;
    if (Array.isArray(res.data?.responses)) return res.data.responses;
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (typeof res === "object" && res !== null) {
      const arrayVal = Object.values(res).find((v) => Array.isArray(v));
      if (Array.isArray(arrayVal)) return arrayVal as any[];

      // In case res is an object with numerical keys: { 0: { id: "..." }, status: "success" }
      const items = Object.values(res).filter(
        (v: any) => v && typeof v === "object" && (v.id || v.CoId || v.description)
      );
      if (items.length > 0) return items;
    }
    return [];
  };

  /* -------------------- FETCH CO RESPONSES -------------------- */
  const fetchCOResponses = async (targetCoId: string, fallbackCoResponses?: any) => {
    if (!targetCoId) return;
    try {
      setLoadingResponses(true);
      console.log("[GetCOByID] Fetching responses for changeOrderId:", targetCoId);
      const res = await Service.GetChangeOrderResponseById(targetCoId);
      const fetched = extractResponsesArray(res);
      console.log("[GetCOByID] Responses fetched successfully:", fetched);
      setResponses(fetched);
    } catch (err) {
      console.error("Failed to fetch CO responses:", err);
      // Fallback to coResponses in Change Order if available
      const rawFallback = fallbackCoResponses ?? co?.coResponses;
      if (rawFallback) {
        try {
          const fallback = Array.isArray(rawFallback)
            ? rawFallback
            : JSON.parse(rawFallback);
          setResponses(fallback || []);
        } catch {
          setResponses([]);
        }
      }
    } finally {
      setLoadingResponses(false);
    }
  };

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

      const coData = response?.data?.data || response?.data || response;
      if (!coData || typeof coData !== "object" || !coData.id) {
        setError("Change Order not found");
        return;
      }

      setCO(coData);
      if (coData.currentVersionId) {
        setViewingVersionId(coData.currentVersionId);
      }

      // Technique: Once change order is fetched, fetch the responses using the resolved changeOrderId
      const changeOrderId = coData.id || id;
      await fetchCOResponses(changeOrderId, coData.coResponses);
    } catch (err) {
      console.error(err);
      setError("Failed to load Change Order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedResponse && responses.length > 0) {
      const updated = responses.find((r: any) => r.id === selectedResponse.id);
      if (updated) setSelectedResponse(updated);
    }
  }, [responses]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      const targetUrl = window.location.pathname + window.location.search;
      navigate(`/?redirect=${encodeURIComponent(targetUrl)}`);
      return;
    }
    if (id) {
      fetchCO();
    }
  }, [id, navigate]);

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

  /* -------------------- RESPONSE TABLE COLUMNS -------------------- */
  const responseColumns: ColumnDef<any>[] = [
    {
      id: "from",
      header: "From",
      cell: ({ row }) => {
        const u = row.original.user;
        const fullName = u
          ? [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ").trim() ||
          [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
          u.username ||
          u.name
          : null;

        const role = row.original.createdByRole || row.original.userRole;
        const roleFallback =
          role === "CLIENT" || role === "CLIENT_ADMIN"
            ? "Client"
            : role
              ? "WBT Team"
              : "—";

        const displayName = fullName || row.original.username || row.original.userName || roleFallback;

        return (
          <span className="font-medium text-sm text-black">
            {displayName}
          </span>
        );
      },
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

        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 sm:p-6 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ================= LEFT: CO DETAILS ================= */}
            <div className="bg-[#fafffb] border border-green-100/50 p-6 rounded-3xl shadow-sm space-y-5">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-black uppercase tracking-tight">
                  CO #{co.changeOrderNumber}
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
                  co.recipients
                    ? `${co.recipients.firstName ?? ""} ${co.recipients.lastName ?? ""
                    }`
                    : "—"
                }
              />

              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Remarks</h4>
                <p className="bg-gray-50 p-3 rounded-lg border">
                  {co.remarks || "—"}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
                <p className="bg-gray-50 p-3 rounded-lg border">
                  {co.description || "—"}
                </p>
              </div>

              <RenderFiles
                files={co.files ?? []}
                table="changeOrders"
                parentId={co.id}
              />

              <div className="pt-4 border-t">
                <button
                  onClick={() =>
                    window.open(`/co-table?coData=${encodedCO}`, "_blank")
                  }
                  className="text-black font-bold uppercase tracking-tight underline hover:text-gray-700 transition-all text-sm"
                >
                  View Change Order Reference Table
                </button>
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
                    className="px-4 py-2 bg-black text-white rounded-lg font-bold uppercase tracking-tight hover:bg-black/90 transition-all border border-black shadow-md"
                    onClick={() => setShowResponseModal(true)}
                  >
                    + Add Response
                  </Button>
                )}
              </div>

              {loadingResponses ? (
                <div className="flex items-center justify-center py-8 text-gray-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                  <span className="text-sm font-medium">Loading responses...</span>
                </div>
              ) : responses.length > 0 ? (
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
            CoId={co?.id || id}
            projectId={effectiveProjectId}
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
