/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import Service from "../../api/Service";
import type { RFQItem } from "../../interface";
import {
  Loader2, AlertCircle, Settings, Settings2, ClipboardList,
  ChevronDown, ChevronUp, MessageSquare, User, Clock, Trash2, X
} from "lucide-react";
import ResponseModal from "./ResponseModal";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import ResponseDetailsModal from "./ResponseDetailsModal";
import Button from "../fields/Button";
import AddEstimation from "../estimation/AddEstimation";
import RenderFiles from "../ui/RenderFiles";
import QuotationRaise from "../connectionDesigner/QuotationRaise";
import QuotationResponseModal from "../connectionDesigner/QuotationResponseModal";
import QuotationResponseDetailsModal from "../connectionDesigner/QuotationResponseDetailsModal";
import EditRFQByID from "./EditRFQbyID";
import { useDispatch } from "react-redux";
import { updateRFQ, deleteRFQ } from "../../store/rfqSlice";

import { formatDate, formatDateTime } from "../../utils/dateUtils";
import { toast } from "react-toastify";

const RFQResponseItem = ({
  response,
  onReply,
  onSelect,
}: {
  response: any;
  onReply?: (parent: any) => void;
  onSelect?: (resp: any) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren =
    response.childResponses && response.childResponses.length > 0;

  return (
    <div className="mb-6 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300">
      {/* Header */}
      <div
        onClick={() => onSelect?.(response)}
        className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${
          isOpen ? "bg-gray-50" : "bg-white"
        } hover:bg-gray-50 ${isOpen ? "border-b border-gray-100" : ""}`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border border-green-100 shrink-0">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-black uppercase tracking-tight text-base">
                {response.user?.firstName
                  ? `${response.user.firstName} ${response.user.lastName}`
                  : response.user?.username || "Team Member"}
              </span>
              {response.user?.role && (
                <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-gray-200">
                  {response.user.role.replace("_", " ")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                {formatDateTime(response.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 justify-end flex-wrap w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              STATUS
            </span>
            <span className="text-xs font-black text-black uppercase tracking-tight">
              {response.wbtStatus || response.status || "OPEN"}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(response);
            }}
            className="h-9 px-4 rounded-xl border border-black/10 bg-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all shadow-2xs"
          >
            Popup View
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="flex items-center gap-1 h-9 px-3 rounded-xl border border-gray-200 font-black text-[10px] uppercase tracking-widest hover:bg-green-100 hover:text-black transition-all"
          >
            {isOpen ? "Close" : "Expand"}
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-6 bg-white animate-in slide-in-from-top-2 duration-300 space-y-6">
          {/* Main Message Section */}
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
              Message Description
            </span>
            <div
              className="prose prose-sm max-w-none text-black font-semibold text-base leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100"
              dangerouslySetInnerHTML={{ __html: response.description }}
            />
          </div>

          {/* Quantification & Metrics Header Section */}
          {(response.totalTonnageWithConnection ||
            response.totalTonnageWithoutConnection ||
            response.PageNumbers) && (
            <div className="bg-green-50/40 p-4 rounded-xl border border-green-100">
              <span className="text-[10px] font-black text-green-800 uppercase tracking-widest block mb-3">
                Quantification & Metrics
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">
                    Tonnage (With Conn)
                  </span>
                  <span className="text-xs font-black text-black">
                    {response.totalTonnageWithConnection || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">
                    Tonnage (W/O Conn)
                  </span>
                  <span className="text-xs font-black text-black">
                    {response.totalTonnageWithoutConnection || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">
                    Page Numbers
                  </span>
                  <span className="text-xs font-black text-black">
                    {response.PageNumbers || "—"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Attachments Section */}
          {response.files && response.files.length > 0 && (
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                Attached Files
              </span>
              <div className="pt-2 border-t border-dashed border-gray-100">
                <RenderFiles
                  files={response.files}
                  table="rfqResponse"
                  parentId={response.id}
                  hideHeader
                />
              </div>
            </div>
          )}

          {/* Child Responses */}
          {hasChildren && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span className="text-xs font-black text-green-700 uppercase tracking-widest">
                  Replies ({response.childResponses.length})
                </span>
              </div>
              <div className="space-y-6 ml-2 sm:ml-4 border-l-4 border-green-100 pl-4 sm:pl-8">
                {[...response.childResponses]
                  .sort(
                    (a: any, b: any) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((child: any) => (
                    <div key={child.id} className="relative">
                      {/* Visual Connector */}
                      <div className="absolute -left-[20px] sm:-left-[36px] top-6 w-5 sm:w-9 h-1 bg-green-100" />

                      <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center border border-green-200">
                              <User className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="font-black text-sm text-black uppercase tracking-tight">
                              {child.user?.firstName
                                ? `${child.user.firstName} ${child.user.lastName}`
                                : child.user?.username || "Team Member"}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {formatDateTime(child.createdAt)}
                          </span>
                        </div>
                        <div
                          className="text-sm text-gray-800 font-medium leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: child.description,
                          }}
                        />
                        {child.files && child.files.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100/50">
                            <RenderFiles
                              files={child.files}
                              table="rfqResponse"
                              parentId={child.id}
                              hideHeader
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Button
              onClick={() => onReply?.(response)}
              className="h-9 px-6 rounded-xl bg-green-100 text-black text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
            >
              Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};


interface GetRfqByIDProps {
  id: string;
  onClose?: () => void;
}

const GetRFQByID = ({ id, onClose }: GetRfqByIDProps) => {
  console.log("GetRFQByID initialized with ID:", id);
  const [rfq, setRfq] = useState<RFQItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [showEstimationModal, setShowEstimationModal] = useState(false);
  const [showCDQuotationModal, setShowCDQuotationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // New states for quotation responses
  const [showQuotationResponseModal, setShowQuotationResponseModal] =
    useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);

  // Followups removed
  const [selectedParentResponseId, setSelectedParentResponseId] = useState<string | null>(null);

  const dispatch = useDispatch();

  const topLevelResponses = useMemo(() => {
    return (rfq?.responses || [])
      .filter((r: any) => !r.parentResponseId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [rfq?.responses]);

  console.log(rfq);
  const fetchRfq = async () => {
    try {
      if (!rfq) setLoading(true);
      const rfqRes = await Service.GetRFQbyId(id);

      const rfqData = rfqRes?.data || rfqRes;
      if (rfqData) {
        setRfq(rfqData);
        dispatch(updateRFQ(rfqData));
      }

      // Followups logic removed
    } catch (err) {
      console.error("Error fetching RFQ:", err);
      if (!rfq) setError("Failed to load RFQ");
    } finally {
      setLoading(false);
    }
  };

  const handleCDQuotationModal = () => {
    setShowCDQuotationModal(true);
  };
  const handleCDQuotationModalClose = () => {
    setShowCDQuotationModal(false);
  };

  useEffect(() => {
    if (id) fetchRfq();
  }, [id]);

  useEffect(() => {
    if (selectedResponse && rfq?.responses) {
      const updated = rfq.responses.find(
        (r: any) => r.id === selectedResponse.id,
      );
      if (updated) setSelectedResponse(updated);
    }
  }, [rfq?.responses]);

  const handleDelete = async () => {
    console.log(
      "handleDelete called with text:",
      deleteConfirmText,
      "and ID:",
      id,
    );
    if (deleteConfirmText !== "DELETE") {
      console.log("Confirmation text mismatch");
      return;
    }

    try {
      setIsDeleting(true);
      console.log("Calling Service.DeleteRFQById...");
      const res = await Service.DeleteRFQById(id);
      console.log("Service.DeleteRFQById response:", res);
      dispatch(deleteRFQ(id));
      toast.success("RFQ deleted successfully");
      // Redirect or close view - assuming we want to close/go back
      // Since this is a detail view, we might need a way to tell the parent to refresh or close
      // For now, let's just show success and maybe the parent handles the state sync via Redux
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete RFQ");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmText("");
    }
  };


  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }
    if ((newStatus === "CLOSED" || newStatus === "RE_APPROVED") && !statusReason) {
      toast.error("Please provide a reason");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const payload = {
        wbtStatus: newStatus,
        reason: statusReason,
      };
      await Service.UpdateRFQById(id, payload);
      toast.success("RFQ status updated successfully");
      setShowStatusModal(false);
      setNewStatus("");
      setStatusReason("");
      fetchRfq(); // Refresh data
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update RFQ status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading || error || !rfq) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-green-600" />
              <span className="text-gray-700">Loading RFQ details...</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-600">{error || "RFQ not found"}</span>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full ml-2"
              >
                <X size={20} />
              </button>
            </>
          )}
        </div>
      </div>,
      document.body,
    );
  }

  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";
  const isCDRole =
    userRole === "connection_designer_engineer" ||
    userRole === "connection_designer_admin";



  /* ---------------- QUOTATION COLUMNS ---------------- */
  const quotationColumns: ColumnDef<any>[] = [
    {
      accessorKey: "connectionDesignerName",
      header: "Designer",
      cell: ({ row }) => {
        const name =
          row.original.connectionDesignerName ||
          row.original.connectionDesignerId ||
          "Unknown";
        return <span className="font-medium text-sm">{name}</span>;
      },
    },
    {
      accessorKey: "bidprice",
      header: "Bid Price",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-700">
          ${row.original.bidprice}
        </span>
      ),
    },
    {
      accessorKey: "estimatedHours",
      header: "Est. Hours",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.estimatedHours} hrs
        </span>
      ),
    },
    {
      accessorKey: "weeks",
      header: "Weeks",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.weeks || "0"} wks
          {row.original.days && row.original.days !== "0"
            ? ` ${row.original.days} d`
            : ""}
        </span>
      ),
    },
    {
      accessorKey: "approvalStatus",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-tight  ${row.original.approvalStatus
            ? "bg-gray-100 text-black border border-gray-200"
            : "bg-gray-100 text-black border border-gray-200"
            }`}
        >
          {row.original.approvalStatus ? "Approved" : "Pending"}
        </span>
      ),
    },
    {
      accessorKey: "files",
      header: "Files",
      cell: ({ row }) => {
        const count = row.original.files?.length ?? 0;
        return count > 0 ? (
          <span className="text-blue-600 font-medium">{count}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-gray-500 text-xs">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "approvalDate",
      header: "Approved Date",
      cell: ({ row }) => (
        <span className="text-gray-500 text-xs">
          {formatDate(row.original.approvalDate)}
        </span>
      ),
    },
  ];

  /* ---------------- TABLE STATE ---------------- */
  // Removed redundant useDataTable hook

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
              {rfq?.projectName}
            </h3>
            {/* Status tag */}
            <span className="px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-green-100 text-black border border-gray-200">
              {((rfq as any)?.wbtStatus &&
                (rfq as any)?.wbtStatus !== "RECEIVED"
                ? (rfq as any)?.wbtStatus
                : rfq?.status
              )?.replace("_", " ")}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {userRole !== "client" &&
              userRole !== "client_admin" &&
              userRole !== "connection_designer_engineer" &&
              userRole !== "connection_designer_admin" && (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 sm:px-6 py-1.5 bg-green-50 text-black border-2 border-green-700/80 rounded-lg hover:bg-green-100 transition-all font-bold text-xs sm:text-sm uppercase tracking-tight shadow-sm cursor-pointer"
                  >
                    Edit RFQ
                  </button>
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="px-4 sm:px-6 py-1.5 bg-green-50 text-black border-2 border-green-700/80 rounded-lg hover:bg-green-100 transition-all font-bold text-xs sm:text-sm uppercase tracking-tight shadow-sm cursor-pointer"
                  >
                    Change Status
                  </button>
                </>
              )}
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-xs sm:text-sm uppercase tracking-tight shadow-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 sm:p-6 bg-white">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {/* ---------------- LEFT COLUMN — RFQ DETAILS ---------------- */}
            <div className="border border-green-100/50 p-4 sm:p-6 rounded-3xl bg-gray-100 shadow-sm space-y-5 sm:space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Info label="Subject" value={rfq?.subject || ""} />
                <Info label="Project Number" value={rfq?.projectNumber || ""} />
                <Info
                  label="Status"
                  value={
                    ((rfq as any)?.wbtStatus &&
                      (rfq as any)?.wbtStatus !== "RECEIVED"
                      ? (rfq as any)?.wbtStatus
                      : rfq?.status
                    )?.replace("_", " ") || ""
                  }
                />
                <Info label="Tools" value={rfq?.tools || "N/A"} />
                <Info
                  label="Due Date"
                  value={formatDate(
                    isCDRole ? rfq?.RFQDueDate : rfq?.estimationDate,
                  )}
                />
                {!isCDRole && (
                  <Info
                    label="Bid Amount (USD)"
                    value={rfq?.bidPrice || "----"}
                  />
                )}
              </div>

              {/* Scopes */}
              <div className="space-y-3">
                {/* Connection Design Scope */}
                <div className="p-4 bg-white/60 rounded-2xl border border-green-100/50 text-sm">
                  <h4 className="text-sm font-black text-black mb-3 flex items-center gap-1 uppercase tracking-wider">
                    <Settings className="w-4 h-4 text-green-600" /> Connection Design Scope
                  </h4>
                  <div className="flex flex-col gap-2 pl-1 pt-1">
                    {rfq?.connectionDesign && (
                      <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                        <span>Main Design</span>
                      </div>
                    )}
                    {rfq?.miscDesign && (
                      <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                        <span>Misc Design</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                      <span>
                        {rfq?.customerDesign
                          ? "Connection Design by WBT"
                          : `Connection Design by ${rfq?.fabricator?.fabName ?? "Fabricator"}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailing Scope */}
                <div className="p-4 bg-white/60 rounded-2xl border border-green-100/50 text-sm">
                  <h4 className="text-sm font-black text-black mb-3 flex items-center gap-1 uppercase tracking-wider">
                    <Settings2 className="w-4 h-4 text-green-600" /> Detailing Scope
                  </h4>
                  <div className="flex flex-col gap-2 pl-1 pt-1">
                    {rfq?.detailingMain && (
                      <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                        <span>Detailing Main</span>
                      </div>
                    )}
                    {rfq?.detailingMisc && (
                      <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                        <span>Detailing Misc</span>
                      </div>
                    )}
                    {!rfq?.detailingMain && !rfq?.detailingMisc && (
                      <span className="text-gray-400 italic text-xs block py-0.5">None selected</span>
                    )}
                  </div>
                </div>

                {/* Material Take-off */}
                <div className="p-4 bg-white/60 rounded-2xl border border-green-100/50 text-sm">
                  <h4 className="text-sm font-black text-black mb-3 flex items-center gap-1 uppercase tracking-wider">
                    <ClipboardList className="w-4 h-4 text-green-600" /> Material Take-off
                  </h4>
                  <div className="flex flex-col gap-2 pl-1 pt-1">
                    {rfq?.MTOManual && (
                      <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                        <span>MTO - Manual</span>
                      </div>
                    )}
                    {!!(rfq?.MTOStickModel || rfq?.MTOValue) && (
                      <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                        <span>MTO - Stick Model</span>
                      </div>
                    )}
                    {!rfq?.MTOManual && !(rfq?.MTOStickModel || rfq?.MTOValue) && (
                      <span className="text-gray-400 italic text-xs block py-0.5">None selected</span>
                    )}
                  </div>

                  {(rfq?.MTOStickModel || (rfq as any)?.MTOManualModel || rfq?.MTOValue) && (
                    <div className="mt-4 p-5 bg-white/80 rounded-xl border border-green-100 shadow-sm">
                      <div
                        className="prose prose-sm max-w-none text-xs font-medium text-black leading-relaxed rfq-description"
                        dangerouslySetInnerHTML={{
                          __html: rfq?.MTOValue || rfq?.MTOStickModel || (rfq as any)?.MTOManualModel || "",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h4 className="text-black text-sm bg-white p-4 rounded-xl border border-black/5 font-black uppercase tracking-widest flex items-center gap-2">
                  <span
                    className={`w-1.5 h-6 ${isCDRole ? "bg-blue-500" : "bg-green-500"} rounded-full`}
                  ></span>
                  {isCDRole ? "Description" : "Description"}
                </h4>
                <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden w-full">
                  <style>{`
                    .rfq-description * {
                      max-width: 100% !important;
                      width: auto !important;
                      box-sizing: border-box !important;
                      overflow-x: hidden !important;
                    }
                    .rfq-description table {
                      width: 100% !important;
                      table-layout: fixed !important;
                    }
                    .rfq-description td, .rfq-description th {
                      word-break: break-word !important;
                    }
                    .rfq-description img {
                      max-width: 100% !important;
                      height: auto !important;
                    }
                    .rfq-description center {
                      display: block !important;
                      text-align: left !important;
                    }
                    .rfq-description a {
                      color: #2563eb !important;
                      word-break: break-all !important;
                    }
                    .rfq-description p { margin-bottom: 1rem !important; }
                  `}</style>
                  <div
                    className="rfq-description text-gray-800 p-5 text-xs sm:text-sm wrap-break-word leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html:
                        (isCDRole ? rfq?.CDDescription : rfq?.description) ||
                        (isCDRole
                          ? "No CD description provided"
                          : "No description provided"),
                    }}
                  />
                </div>
              </div>

              {/* Files */}
              <RenderFiles
                files={(isCDRole ? rfq?.CDAttachments : rfq?.files) || []}
                table={isCDRole ? "rfqCDAttachments" : "rFQ"}
                parentId={rfq?.id}
                formatDate={formatDate}
              />

              {/* ---------------- RIGHT COLUMN — RESPONSES ---------------- */}
              <div className="bg-gray-50 border border-gray-200 p-4 sm:p-8 rounded-[2rem] shadow-sm space-y-6">
                {/* Header + Add Response Button */}
                <div className="flex justify-between items-center gap-4">
                  <h1 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tighter">
                    Responses
                  </h1>

                  {(userRole === "admin" ||
                    userRole === "deputy_manager" ||
                    userRole === "operation_executive" ||
                    userRole === "user") && (
                      <Button
                        onClick={() => {
                          setSelectedParentResponseId(null);
                          setShowResponseModal(true);
                        }}
                        className="px-4 py-2 bg-green-50 text-black rounded-lg font-bold uppercase tracking-tight hover:bg-black/90 hover:text-white transition-all border border-black shadow-md"
                      >
                        + Add Response
                      </Button>
                    )}
                </div>
                {showResponseModal && (
                  <ResponseModal
                    rfqId={id}
                    onClose={() => {
                      setShowResponseModal(false);
                      setSelectedParentResponseId(null);
                    }}
                    onSuccess={fetchRfq}
                    parentResponseId={selectedParentResponseId || undefined}
                  />
                )}
                {/* ---- RESPONSE TABLE (HIDDEN FOR CONNECTION DESIGNERS) ---- */}
                {userRole !== "connection_designer_engineer" &&
                  (topLevelResponses.length ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {topLevelResponses.map((resp: any) => (
                        <RFQResponseItem
                          key={resp.id}
                          response={resp}
                          onSelect={(r) => setSelectedResponse(r)}
                          onReply={(parent) => {
                            setSelectedParentResponseId(parent.id);
                            setShowResponseModal(true);
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 italic">No responses yet.</p>
                  ))}
                <div className="mt-4">
                  {(rfq?.CDQuotas?.length ?? 0) > 0 ? (
                    <>
                      <p className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                        CD Quotation
                      </p>
                      <DataTable
                        columns={quotationColumns}
                        data={rfq?.CDQuotas || []}
                        pageSizeOptions={[5]}
                        onRowClick={(row: any) => setSelectedQuotation(row)}
                      />
                    </>
                  ) : (
                    // Show Submit Button if not submitted
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      {userRole === "connection_designer_engineer" ? (
                        <>
                          <p className="text-gray-500 mb-4 text-center">
                            You haven't submitted a quotation yet.
                          </p>
                          <Button
                            onClick={() => setShowQuotationResponseModal(true)}
                            className="px-6 py-2.5 bg-green-600 text-white  rounded-lg shadow-md hover:bg-green-700 transition"
                          >
                            Submit Quotation Response
                          </Button>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              {userRole !== "client_admin" &&
                userRole !== "client" &&
                userRole !== "client_estimator" &&
                userRole !== "connection_designer_engineer" &&
                userRole !== "connection_designer_admin" && (
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      onClick={() => setShowEstimationModal(true)}
                      className="w-full sm:w-auto h-auto py-2.5 px-4 text-sm  bg-green-200 text-black border border-black shadow-xs"
                    >
                      Raise For Estimation
                    </Button>
                    <Button
                      onClick={() => handleCDQuotationModal()}
                      className="w-full sm:w-auto h-auto py-2.5 px-4 text-[11px] sm:text-sm bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 whitespace-normal leading-tight "
                    >
                      Raise for Connection Designer Quotation
                    </Button>
                  </div>
                )}
            </div>


          </div>
        </div>
        {showCDQuotationModal && (
          <QuotationRaise
            rfqId={id}
            onClose={() => handleCDQuotationModalClose()}
            onSuccess={fetchRfq} // refresh after submit
          />
        )}

        {selectedResponse && (
          <ResponseDetailsModal
            response={selectedResponse}
            onClose={() => setSelectedResponse(null)}
            onSuccess={fetchRfq}
          />
        )}

        {/* Quotation Submission Modal */}
        {showQuotationResponseModal && (
          <QuotationResponseModal
            rfqId={id}
            onClose={() => setShowQuotationResponseModal(false)}
            onSuccess={fetchRfq}
          />
        )}

        {/* Quotation Details Modal */}
        {selectedQuotation && (
          <QuotationResponseDetailsModal
            quotation={selectedQuotation}
            onClose={() => setSelectedQuotation(null)}
            onSuccess={fetchRfq}
          />
        )}

        {/* Estimation Modal */}
        {showEstimationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setShowEstimationModal(false)}
                className="absolute top-4 right-4 text-gray-700 hover:text-gray-700 z-10"
              >
                ✕
              </button>
              <AddEstimation
                initialRfqId={id}
                onSuccess={() => {
                  setShowEstimationModal(false);
                  fetchRfq();
                }}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl  text-red-600 flex items-center gap-2">
                  <Trash2 size={24} /> Delete RFQ
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this RFQ? This action cannot be
                undone.
                <br />
                <span className="font-semibold text-sm mt-2 block">
                  Please type <span className="text-red-600">DELETE</span> to
                  confirm:
                </span>
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full px-4 py-2 border rounded-lg mb-6 focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteConfirmText !== "DELETE" || isDeleting}
                  className={`flex-1 ${deleteConfirmText === "DELETE"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
                    } text-white`}
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl  text-blue-600 flex items-center gap-2">
                  Change RFQ Status
                </h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="">Select Status</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="AWARDED">AWARDED</option>
                    <option value="RE_APPROVED">REVISED AND RESUBMIT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Change {(newStatus === "CLOSED" || newStatus === "RE_APPROVED") && "*"}
                  </label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="Enter reason..."
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={isUpdatingStatus}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUpdatingStatus ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          </div>
        )}
        {showEditModal && (
          <EditRFQByID
            id={id}
            onCancel={() => setShowEditModal(false)}
            onSuccess={() => {
              setShowEditModal(false);
              fetchRfq();
            }}
          />
        )}
      </div>
    </div>,
    document.body,
  );
};

const Info = ({ label, value }: { label: string; value: string | number }) => (
  <div className="space-y-0.5 sm:space-y-1">
    <p className="text-gray-500 text-md sm:text-md uppercase font-medium tracking-wider">
      {label}
    </p>
    <p className=" text-gray-800 text-sm sm:text-base">{value}</p>
  </div>
);



export default GetRFQByID;
