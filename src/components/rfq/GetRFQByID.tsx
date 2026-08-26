/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import Service from "../../api/Service";
import type { RFQItem } from "../../interface";
import {
  Loader2,
  AlertCircle,
  MessageSquare,
  User,
  Clock,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

const ThreadedChildResponse = ({
  child,
  onReply,
  onSelect,
  allResponses,
}: {
  child: any;
  onReply?: (parent: any) => void;
  onSelect?: (resp: any) => void;
  allResponses: any[];
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const computedChildren = allResponses.filter(
    (r: any) => r.parentResponseId === child.id
  );
  const childrenToRender = computedChildren.length > 0 ? computedChildren : (child.childResponses || []);
  const hasChildren = childrenToRender.length > 0;

  return (
    <div className="relative">
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
          className="text-sm text-gray-800 font-medium leading-relaxed prose prose-sm max-w-none"
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
              noAccordion
            />
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          {hasChildren && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="px-4 py-1.5 text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-700 border-2 border-blue-700/80 rounded-lg hover:bg-blue-100 transition-all uppercase tracking-tight shadow-sm cursor-pointer"
            >
              {isExpanded ? "Hide Thread" : `View Thread (${childrenToRender.length})`}
            </Button>
          )}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(child);
            }}
            className="px-4 py-1.5 text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-700 border-2 border-blue-700/80 rounded-lg hover:bg-blue-100 transition-all uppercase tracking-tight shadow-sm cursor-pointer"
          >
            Open
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onReply?.(child);
            }}
            className="px-4 py-1.5 text-[10px] sm:text-xs font-bold bg-green-50 text-green-700 border-2 border-green-700/80 rounded-lg hover:bg-green-100 transition-all uppercase tracking-tight shadow-sm cursor-pointer"
          >
            Reply to this
          </Button>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="mt-6 space-y-6 ml-2 sm:ml-4 border-l-4 border-green-100 pl-4 sm:pl-8 animate-in slide-in-from-top-2 duration-200">
          {[...childrenToRender]
            .sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map((grandChild: any) => (
              <ThreadedChildResponse
                key={grandChild.id}
                child={grandChild}
                onReply={onReply}
                onSelect={onSelect}
                allResponses={allResponses}
              />
            ))}
        </div>
      )}
    </div>
  );
};

const RFQResponseItem = ({
  response,
  onReply,
  onSelect,
  allResponses,
}: {
  response: any;
  onReply?: (parent: any) => void;
  onSelect?: (resp: any) => void;
  allResponses: any[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  
  const computedChildren = allResponses.filter(
    (r: any) => r.parentResponseId === response.id
  );
  const childrenToRender = computedChildren.length > 0 ? computedChildren : (response.childResponses || []);
  const hasChildren = childrenToRender.length > 0;

  return (
    <div className="mb-6 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300">
      {/* Header */}
      <div
        className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
          isOpen ? "bg-gray-50" : "bg-white"
        } hover:bg-gray-50 ${isOpen ? "border-b border-gray-100" : ""}`}
      >
        <div
          className="flex items-center gap-4 flex-1 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border border-green-100 shrink-0">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-black text-black uppercase tracking-tight text-base">
                {response.subject || "No Subject"}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap text-gray-500 text-[11px]">
              <span className="font-bold text-gray-700 uppercase tracking-widest">
                {response.user?.firstName
                  ? `${response.user.firstName} ${response.user.lastName}`
                  : response.user?.username || "Team Member"}
              </span>
              {response.user?.role && (
                <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-gray-200">
                  {response.user.role.replace("_", " ")}
                </span>
              )}
              <span className="text-gray-300">|</span>
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-bold text-gray-400 uppercase tracking-widest">
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

          {hasChildren && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (!isOpen) setIsOpen(true);
                setIsThreadOpen(!isThreadOpen);
              }}
              className="h-9 px-4 rounded-xl border border-black/10 bg-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 hover:text-blue-700 transition-all shadow-2xs"
            >
              {isThreadOpen ? "Hide Thread" : `View Thread (${childrenToRender.length})`}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onReply?.(response);
            }}
            className="h-9 px-4 rounded-xl border border-black/10 bg-white font-black text-[10px] uppercase tracking-widest hover:bg-green-50 hover:text-green-700 transition-all shadow-2xs"
          >
            Reply
          </Button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
          >
            {isOpen ? (
              <ChevronUp size={18} className="text-gray-500" />
            ) : (
              <ChevronDown size={18} className="text-gray-500" />
            )}
          </button>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">
                    Tonnage (With Connections)
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
                  <div
                    className="text-xs font-black text-black"
                    dangerouslySetInnerHTML={{
                      __html: response.PageNumbers || "—",
                    }}
                  />
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
          {hasChildren && isThreadOpen && (
            <div className="mt-8 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span className="text-xs font-black text-green-700 uppercase tracking-widest">
                  Replies ({childrenToRender.length})
                </span>
              </div>
              <div className="space-y-6 ml-2 sm:ml-4 border-l-4 border-green-100 pl-4 sm:pl-8">
                {[...childrenToRender]
                  .sort(
                    (a: any, b: any) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((child: any) => (
                    <ThreadedChildResponse
                      key={child.id}
                      child={child}
                      onReply={onReply}
                      onSelect={onSelect}
                      allResponses={allResponses}
                    />
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
  filterType?: "MTO" | "DETAILING";
}

const GetRFQByID = ({ id, onClose, filterType }: GetRfqByIDProps) => {
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
  const [isDescOpen, setIsDescOpen] = useState(false);

  // New states for quotation responses
  const [showQuotationResponseModal, setShowQuotationResponseModal] =
    useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);

  // Followup states
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [followupDescription, setFollowupDescription] = useState("");
  const [followupFiles, setFollowupFiles] = useState<File[]>([]);
  const [isSubmittingFollowup, setIsSubmittingFollowup] = useState(false);
  const [followups, setFollowups] = useState<any[]>([]);

  const [responses, setResponses] = useState<any[]>([]);

  // Followups removed
  const [selectedParentResponseId, setSelectedParentResponseId] = useState<
    string | null
  >(null);

  const dispatch = useDispatch();

  const topLevelResponses = useMemo(() => {
    return (responses || [])
      .filter((r: any) => {
        if (r.parentResponseId) return false;
        if (filterType) {
          const type = (r.type || r.Type || "").toUpperCase();
          return type === filterType.toUpperCase();
        }
        return true;
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [responses, filterType]);

  const extractResponsesArray = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.responses)) return res.responses;
    if (Array.isArray(res.data?.responses)) return res.data.responses;
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (typeof res === "object" && res !== null) {
      const arrayVal = Object.values(res).find((v) => Array.isArray(v));
      if (Array.isArray(arrayVal)) return arrayVal;
    }
    return [];
  };

  const fetchResponses = async () => {
    try {
      const cleanId = typeof id === "object" && id !== null ? (id as any).id || (id as any)._id : id;
      if (!cleanId) return;
      console.log("[GetRFQByID] Fetching responses independently for cleanId:", cleanId);
      
      const respRes = await Service.getRFQResponses(cleanId);
      const fetchedResponses = extractResponsesArray(respRes);
      console.log("[RFQ Responses] Fetched successfully:", fetchedResponses);
      setResponses(fetchedResponses);
    } catch (err) {
      console.error("Error fetching RFQ responses independently:", err);
      setResponses([]);
    }
  };

  const fetchRfq = async () => {
    try {
      const cleanId = typeof id === "object" && id !== null ? (id as any).id || (id as any)._id : id;
      if (!cleanId) return;

      if (!rfq) setLoading(true);

      const rfqRes = await Service.GetRFQbyId(cleanId);
      const rfqData = rfqRes?.data || rfqRes;
      
      if (rfqData) {
        // Explicitly remove responses from getById object to enforce decoupling
        delete rfqData.responses;
        setRfq(rfqData);
        dispatch(updateRFQ(rfqData));
      }

      // followUps are included in the RFQ response directly
      const rfqFollowUps = rfqData?.followUps ?? [];
      setFollowups(Array.isArray(rfqFollowUps) ? rfqFollowUps : []);
      
      // Also refresh responses alongside RFQ
      fetchResponses();
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
    if (id) {
      fetchRfq();
      fetchResponses();
    }
  }, [id]);

  useEffect(() => {
    if (selectedResponse && responses.length > 0) {
      const updated = responses.find(
        (r: any) => r.id === selectedResponse.id,
      );
      if (updated) setSelectedResponse(updated);
    }
  }, [responses]);

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
    if (
      (newStatus === "CLOSED" || newStatus === "RE_APPROVED") &&
      !statusReason
    ) {
      toast.error("Please provide a reason");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const payload = {
        wbtStatus: newStatus,
        reason: statusReason,
      };
      const fabricatorName =
        rfq?.fabricator?.fabName ||
        rfq?.sender?.fabricator?.fabName ||
        (rfq as any)?.fabricatorName ||
        "";
      const rfqProjectName = rfq?.projectName || "";
      await Service.UpdateRFQById(id, payload, fabricatorName, rfqProjectName);
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

  const handleAddFollowup = async () => {
    if (!followupDescription.trim()) {
      toast.error("Description is required");
      return;
    }
    console.log("[Followup] Submitting followup for RFQ ID:", id);

    const formData = new FormData();
    formData.append("description", followupDescription);
    followupFiles.forEach((file) => {
      formData.append("files", file);
      console.log("[Followup] Appending file:", file.name);
    });

    try {
      setIsSubmittingFollowup(true);
      const fabricatorName =
        rfq?.fabricator?.fabName ||
        rfq?.sender?.fabricator?.fabName ||
        (rfq as any)?.fabricatorName ||
        "";
      const rfqProjectName = rfq?.projectName || "";
      const res = await Service.addRFQFollowups(
        formData,
        id,
        fabricatorName,
        rfqProjectName,
      );
      console.log("[Followup] Response:", res);
      toast.success("Followup added successfully");
      setFollowupDescription("");
      setFollowupFiles([]);
      setShowFollowupForm(false);
      fetchRfq();
    } catch (err) {
      console.error("[Followup] Error adding followup:", err);
      toast.error("Failed to add followup");
    } finally {
      setIsSubmittingFollowup(false);
    }
  };

  const stripHtml = (html: string | null | undefined): string => {
    if (!html) return "";
    let text = String(html)
      .replace(/<br\s*[\/]?>/gi, "\n")
      .replace(/<\/p>|<\/div>|<\/li>/gi, "\n")
      .replace(/<li>/gi, "• ")
      .replace(/&nbsp;/gi, " ")
      .replace(/<[^>]+>/g, "");
    if (typeof DOMParser !== "undefined") {
      try {
        const doc = new DOMParser().parseFromString(text, "text/html");
        text = doc.body.textContent || text;
      } catch {
        // fallback
      }
    }
    return text.trim();
  };

  const getFileShareUrl = async (
    table: string,
    parentId: string | number,
    fileId: string | number,
    fileObj?: any
  ): Promise<string> => {
    if (fileObj?.shareUrl) return fileObj.shareUrl;
    if (fileObj?.shareLink) return fileObj.shareLink;
    if (fileObj?.url) return fileObj.url;

    let mappedTable = table;
    if (table === "rfqFollowup" || table === "rFQFollowUp" || table === "rfq/followup") {
      mappedTable = "rFQFollowUp";
    } else if (table === "rfqResponse" || table === "rFQResponse" || table === "rfq/response") {
      mappedTable = "rFQResponse";
    } else {
      mappedTable = "rFQ";
    }

    try {
      const res = await Service.createShareLink(mappedTable, String(parentId), String(fileId));
      if (res?.shareUrl) {
        return res.shareUrl;
      }
      if (res?.url) {
        return res.url;
      }
    } catch (err) {
      console.warn("Failed to generate share link via API:", err);
    }

    let baseURL = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");
    if (baseURL && baseURL.startsWith("/")) {
      baseURL = `${window.location.origin}${baseURL}`;
    } else if (baseURL && !baseURL.startsWith("http")) {
      baseURL = `${window.location.origin}/${baseURL}`;
    } else if (!baseURL) {
      baseURL = window.location.origin;
    }

    return `${baseURL}/share/${mappedTable}/${parentId}/${fileId}`;
  };

  const handleDownloadPDF = async () => {
    if (!rfq) return;
    const rfqData: any = rfq;

    try {
      const doc = new jsPDF();
      const primaryColor: [number, number, number] = [107, 189, 69]; // #6bbd45 WBT Green
      const textColor: [number, number, number] = [30, 30, 30];
      const lightBg: [number, number, number] = [248, 250, 252];

      let currentY = 15;

      // Title Header Banner
      doc.setFillColor(...primaryColor);
      doc.rect(14, currentY, 182, 16, "F");

      const projTitle = rfqData.projectName ? `RFQ - ${rfqData.projectName}` : "REQUEST FOR QUOTATION (RFQ)";

      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(projTitle, 20, currentY + 11);

      currentY += 22;

      // Section: General Information
      doc.setFontSize(11);
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text("GENERAL INFORMATION", 14, currentY);
      currentY += 4;

      const senderObj = rfqData.sender;
      const senderName = senderObj
        ? `${senderObj.firstName || ""} ${senderObj.middleName || ""} ${senderObj.lastName || ""}`.replace(/\s+/g, " ").trim() || senderObj.username || "—"
        : "—";
      const senderEmail = senderObj?.email || "—";

      let recipientNames = "—";
      if (rfqData.multipleRecipients && rfqData.multipleRecipients.length > 0) {
        recipientNames = rfqData.multipleRecipients
          .map((r: any) => {
            const name = `${r.firstName || ""} ${r.lastName || ""}`.trim();
            return name ? `${name} (${r.email || ""})` : r.email || "";
          })
          .filter(Boolean)
          .join("\n");
      } else if (rfqData.recipient) {
        const name = `${rfqData.recipient.firstName || ""} ${rfqData.recipient.lastName || ""}`.trim();
        recipientNames = name ? `${name} (${rfqData.recipient.email || ""})` : rfqData.recipient.email || "—";
      }

      const createdDateStr = formatDate(rfqData.createdAt) || "N/A";
      const dueDateStr = formatDate(isCDRole ? rfqData.RFQDueDate : rfqData.estimationDate) || "N/A";

      const basicInfoData = [
        ["Subject:", rfqData.subject || "N/A", "Created At:", createdDateStr],
        ["Project Name:", rfqData.projectName || "N/A", "Due Date:", dueDateStr],
        ["Sender:", `${senderName}\n(${senderEmail})`, "Recipient(s):", recipientNames]
      ];

      autoTable(doc, {
        body: basicInfoData,
        startY: currentY,
        theme: "grid",
        headStyles: { fillColor: primaryColor },
        styles: { fontSize: 8.5, cellPadding: 3, textColor: textColor },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 28, fillColor: lightBg },
          1: { cellWidth: 63 },
          2: { fontStyle: "bold", cellWidth: 25, fillColor: lightBg },
          3: { cellWidth: 66 }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;

      // Section: Scope Details
      const detailingScopes: string[] = [];
      if (rfqData.detailingMain) detailingScopes.push("Detailing Main");
      if (rfqData.detailingMisc) detailingScopes.push("Detailing Misc");

      const connectionScopes: string[] = [];
      if (rfqData.connectionDesign) connectionScopes.push("Main Design");
      if (rfqData.miscDesign) connectionScopes.push("Misc Design");
      if (rfqData.customerDesign) connectionScopes.push("Connection Design by WBT");

      const mtoScopes: string[] = [];
      if (rfqData.MTOManual) mtoScopes.push("MTO - Manual");
      if (rfqData.MTOStickModel || rfqData.MTOValue || rfqData.MTOManualModel) mtoScopes.push("MTO - Stick Model");

      const scopeRows: string[][] = [];
      if (detailingScopes.length > 0) {
        scopeRows.push(["Detailing Scope", detailingScopes.join(", ")]);
      }
      if (connectionScopes.length > 0) {
        scopeRows.push(["Connection Design Scope", connectionScopes.join(", ")]);
      }
      if (mtoScopes.length > 0) {
        scopeRows.push(["Material Take-off (MTO)", mtoScopes.join(", ")]);
      }

      if (scopeRows.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text("SCOPE DETAILS", 14, currentY);
        currentY += 4;

        autoTable(doc, {
          body: scopeRows,
          startY: currentY,
          theme: "grid",
          styles: { fontSize: 8.5, cellPadding: 3, textColor: textColor },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 48, fillColor: lightBg },
            1: { cellWidth: 134 }
          }
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;
      }

      // Section: Description
      const rawDesc = isCDRole ? rfqData.CDDescription : rfqData.description;
      const cleanDesc = stripHtml(rawDesc);
      if (cleanDesc && cleanDesc !== "No description provided" && cleanDesc !== "No CD description provided") {
        if (currentY > 240) {
          doc.addPage();
          currentY = 15;
        }

        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text("DESCRIPTION", 14, currentY);
        currentY += 4;

        autoTable(doc, {
          body: [[cleanDesc]],
          startY: currentY,
          theme: "grid",
          styles: { fontSize: 8.5, cellPadding: 4, textColor: textColor },
          columnStyles: {
            0: { cellWidth: 182 }
          }
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;
      }

      // Section: MTO Details & Notes if any
      const mtoNote = stripHtml(rfqData.MTOValue || rfqData.MTOStickModel || rfqData.MTOManualModel);
      if (mtoNote) {
        if (currentY > 240) {
          doc.addPage();
          currentY = 15;
        }

        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text("MTO DETAILS & NOTES", 14, currentY);
        currentY += 4;

        autoTable(doc, {
          body: [[mtoNote]],
          startY: currentY,
          theme: "grid",
          styles: { fontSize: 8.5, cellPadding: 4, textColor: textColor },
          columnStyles: {
            0: { cellWidth: 182 }
          }
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;
      }

      // Helper to format long URLs so autoTable wraps them inside table cells without overflow
      const formatBreakableUrl = (url: string) => {
        return url.replace(/([\/._\-\?&=])/g, "$1 ");
      };

      // Section: Main Attachments & Share Links
      const attachments = isCDRole ? rfqData.CDAttachments : rfqData.files;
      if (attachments && attachments.length > 0) {
        if (currentY > 220) {
          doc.addPage();
          currentY = 15;
        }

        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(`ATTACHMENTS & SHARE LINKS (${attachments.length})`, 14, currentY);
        currentY += 4;

        const fileRows = await Promise.all(
          attachments.map(async (file: any, idx: number) => {
            const fileName = file.originalName || file.filename || `File ${idx + 1}`;
            const shareUrl = await getFileShareUrl(
              isCDRole ? "rfqCDAttachments" : "rFQ",
              rfqData.id,
              file.id,
              file
            );
            return [
              idx + 1,
              { content: fileName, link: shareUrl },
              { content: `Open File Link:\n(${formatBreakableUrl(shareUrl)})`, link: shareUrl }
            ];
          })
        );

        autoTable(doc, {
          head: [["#", "File Name", "Share Link (Click to Open)"]],
          body: fileRows,
          startY: currentY,
          theme: "grid",
          headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 8, cellPadding: 3, textColor: textColor, overflow: "linebreak" },
          columnStyles: {
            0: { cellWidth: 10, halign: "center" },
            1: { cellWidth: 55, fontStyle: "bold", textColor: [0, 102, 204] },
            2: { cellWidth: 117, textColor: [0, 102, 204] }
          },
          didDrawCell: (data) => {
            if (data.section === "body") {
              const rawCell: any = data.cell.raw;
              if (rawCell && typeof rawCell === "object" && rawCell.link) {
                data.doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: rawCell.link });
              }
            }
          }
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;
      }

      // Section: Followups
      if (followups && followups.length > 0) {
        if (currentY > 220) {
          doc.addPage();
          currentY = 15;
        }

        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(`FOLLOWUPS (${followups.length})`, 14, currentY);
        currentY += 4;

        const followupRows = await Promise.all(
          followups.map(async (f: any, idx: number) => {
            const cb = f.createdBy
              ? `${f.createdBy.firstName || ""} ${f.createdBy.lastName || ""}`.trim() || f.createdBy.username || "—"
              : "—";
            const desc = stripHtml(f.description);
            const createdOn = formatDateTime(f.createdAt);

            let fileDetails = "—";
            if (f.files && f.files.length > 0) {
              const fileShareList = await Promise.all(
                f.files.map(async (file: any) => {
                  const name = file.originalName || file.filename || "File";
                  const url = await getFileShareUrl("rFQFollowUp", f.id, file.id, file);
                  return `${name}\nOpen Link: ${formatBreakableUrl(url)}`;
                })
              );
              fileDetails = fileShareList.join("\n\n");
            }

            return [idx + 1, cb, createdOn, desc, fileDetails];
          })
        );

        autoTable(doc, {
          head: [["#", "Created By", "Date", "Description", "Files & Share Links"]],
          body: followupRows,
          startY: currentY,
          theme: "grid",
          headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 8, cellPadding: 3, textColor: textColor, overflow: "linebreak" },
          columnStyles: {
            0: { cellWidth: 10, halign: "center" },
            1: { cellWidth: 32 },
            2: { cellWidth: 32 },
            3: { cellWidth: 48 },
            4: { cellWidth: 60, textColor: [0, 102, 204] }
          },
          didDrawCell: (data) => {
            if (data.section === "body") {
              const cellText = Array.isArray(data.cell.text) ? data.cell.text.join(" ") : String(data.cell.text || "");
              const foundUrls = cellText.match(/https?:\/\/[^\s\n\)\"\']+/g);
              if (foundUrls) {
                foundUrls.forEach((urlWithSpaces) => {
                  const cleanUrl = urlWithSpaces.replace(/\s+/g, "");
                  data.doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: cleanUrl });
                });
              }
            }
          }
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;
      }

      // Section: Responses
      if (responses && responses.length > 0 && !isCDRole) {
        if (currentY > 220) {
          doc.addPage();
          currentY = 15;
        }

        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(`RESPONSES (${responses.length})`, 14, currentY);
        currentY += 4;

        const flattenResponsesForPdf = async (resList: any[], indent = 0): Promise<any[]> => {
          let rows: any[] = [];
          for (const r of resList) {
            const u = r.user;
            const userName = u
              ? `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "Team Member"
              : "Team Member";
            const role = u?.role ? ` (${u.role.replace("_", " ")})` : "";
            const prefix = indent > 0 ? "  ".repeat(indent) + "↳ " : "";
            const userStr = `${prefix}${userName}${role}`;
            const subj = r.subject || "No Subject";
            const respStatus = r.wbtStatus || r.status || "OPEN";
            const dateStr = formatDateTime(r.createdAt);
            let desc = stripHtml(r.description);

            if (r.files && r.files.length > 0) {
              const fileShareList = await Promise.all(
                r.files.map(async (file: any) => {
                  const name = file.originalName || file.filename || "File";
                  const url = await getFileShareUrl("rFQResponse", r.id, file.id, file);
                  return `• ${name}\n  Open Link: ${formatBreakableUrl(url)}`;
                })
              );
              desc += `\n\n[Attached Files]:\n${fileShareList.join("\n")}`;
            }

            rows.push([userStr, subj, respStatus, dateStr, desc]);

            const children = responses.filter((child: any) => child.parentResponseId === r.id);
            const childList = children.length > 0 ? children : (r.childResponses || []);
            if (childList.length > 0) {
              const childRows = await flattenResponsesForPdf(childList, indent + 1);
              rows.push(...childRows);
            }
          }
          return rows;
        };

        const topLevel = responses.filter((r: any) => !r.parentResponseId);
        const responseRows = await flattenResponsesForPdf(topLevel.length > 0 ? topLevel : responses);

        autoTable(doc, {
          head: [["User", "Subject", "Status", "Date", "Description & Attached Files"]],
          body: responseRows,
          startY: currentY,
          theme: "grid",
          headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 8, cellPadding: 3, textColor: textColor, overflow: "linebreak" },
          columnStyles: {
            0: { cellWidth: 38 },
            1: { cellWidth: 26 },
            2: { cellWidth: 18 },
            3: { cellWidth: 28 },
            4: { cellWidth: 72 }
          },
          didDrawCell: (data) => {
            if (data.section === "body") {
              const cellText = Array.isArray(data.cell.text) ? data.cell.text.join(" ") : String(data.cell.text || "");
              const foundUrls = cellText.match(/https?:\/\/[^\s\n\)\"\']+/g);
              if (foundUrls) {
                foundUrls.forEach((urlWithSpaces) => {
                  const cleanUrl = urlWithSpaces.replace(/\s+/g, "");
                  data.doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: cleanUrl });
                });
              }
            }
          }
        });
        currentY = (doc as any).lastAutoTable.finalY + 8;
      }

      // Save Document
      const safeProjectName = (rfqData.projectName || "RFQ_Document").replace(/[^a-zA-Z0-9_\-]/g, "_");
      doc.save(`RFQ_${safeProjectName}_${rfqData.serialNo || id}.pdf`);
      toast.success("RFQ PDF downloaded successfully!");
    } catch (err) {
      console.error("Failed to generate RFQ PDF:", err);
      toast.error("Failed to generate PDF");
    }
  };

  if (loading || error || !rfq) {
    return createPortal(
      <div className="project-component-container fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
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
    userRole === "connection_designer" ||
    userRole === "connection_designer_engineer" ||
    userRole === "connection_designer_admin";
  const isClientRole = [
    "client",
    "client_admin",
    "client_estimator",
    "client_accountant",
  ].includes(userRole);

  /* ---------------- FOLLOWUP COLUMNS ---------------- */
  const followupColumns: ColumnDef<any>[] = [
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ row }: any) => {
        const cb = row.original.createdBy;
        const name = cb
          ? `${cb.firstName ?? ""} ${cb.lastName ?? ""}`.trim()
          : "—";
        return <span className="font-semibold text-xs sm:text-sm">{name}</span>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created On",
      cell: ({ row }: any) => (
        <span className="text-gray-500 text-xs font-semibold">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "files",
      header: "Files",
      cell: ({ row }: any) => {
        const count = row.original.files?.length ?? 0;
        return count > 0 ? (
          <span className="text-black font-semibold text-xs">
            {count} file(s)
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        );
      },
    },
  ];

  /* ---------------- QUOTATION COLUMNS ---------------- */
  const quotationColumns: ColumnDef<any>[] = [
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
      accessorKey: "approvalStatus",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-tight  ${
            row.original.approvalStatus
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
    <div className="project-component-container fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
              {rfq?.projectName}
            </h3>
            {/* Status tag */}
            <span className="px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-green-100 text-black border border-gray-200">
              {(() => {
                const wbtStatus = (rfq as any)?.wbtStatus;
                const status = rfq?.status;
                const currentStatus =
                  wbtStatus && wbtStatus !== "RECEIVED" ? wbtStatus : status;

                if (currentStatus === "AWARDED") {
                  const isMTO = !!(
                    rfq?.MTOManual ||
                    rfq?.MTOStickModel ||
                    rfq?.MTOValue ||
                    (rfq as any)?.mtoStickModelEnabled
                  );
                  return isMTO ? "SUBMITTED" : "AWARDED";
                }

                return currentStatus?.replace("_", " ");
              })()}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleDownloadPDF}
              className="px-4 sm:px-6 py-1.5 bg-green-600 text-white hover:bg-green-700 transition-all font-bold text-xs sm:text-sm uppercase tracking-tight shadow-sm cursor-pointer flex items-center gap-2 rounded-lg"
            >
              <Download size={16} />
              Download PDF
            </button>
            {userRole !== "client" &&
              userRole !== "client_admin" &&
              userRole !== "client_estimator" &&
              !isCDRole && (
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
            <div className="bg-zinc-50 border border-zinc-200/50 p-6 rounded-3xl shadow-sm space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Info label="Subject" value={rfq?.subject || ""} />
                <Info label="Project Number" value={rfq?.projectNumber || ""} />
                {/* <Info label="Tools" value={rfq?.tools || "N/A"} /> */}
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
                {/* Connection Design Scope - Only shown if at least one option is selected */}
                {(rfq?.connectionDesign ||
                  rfq?.miscDesign ||
                  rfq?.customerDesign) && (
                  <div className="space-y-4">
                    <h4 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-tight border-l-4 border-[#6bbd45] pl-3">
                      Connection Design Scope
                    </h4>
                    <div className="flex flex-col gap-2 pl-4">
                      {rfq?.connectionDesign && (
                        <div className="flex items-center gap-2.5 text-sm font-bold text-gray-800 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                          <span>Main Design</span>
                        </div>
                      )}
                      {rfq?.miscDesign && (
                        <div className="flex items-center gap-2.5 text-sm font-bold text-gray-800 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                          <span>Misc Design</span>
                        </div>
                      )}
                      {rfq?.customerDesign && (
                        <div className="flex items-center gap-2.5 text-sm font-bold text-gray-800 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                          <span>Connection Design by WBT</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Detailing Scope - Only shown if at least one option is selected */}
                {(rfq?.detailingMain || rfq?.detailingMisc) && (
                  <div className="space-y-4">
                    <h4 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-tight border-l-4 border-[#6bbd45] pl-3">
                      Detailing Scope
                    </h4>
                    <div className="flex flex-col gap-2 pl-4">
                      {rfq?.detailingMain && (
                        <div className="flex items-center gap-2.5 text-sm font-bold text-gray-800 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                          <span>Detailing Main</span>
                        </div>
                      )}
                      {rfq?.detailingMisc && (
                        <div className="flex items-center gap-2.5 text-sm font-bold text-gray-800 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                          <span>Detailing Misc</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Material Take-off - Only shown if at least one option is selected */}
                {(rfq?.MTOManual ||
                  rfq?.MTOStickModel ||
                  rfq?.MTOValue ||
                  (rfq as any)?.MTOManualModel) && (
                  <div className="space-y-4">
                    <h4 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-tight border-l-4 border-[#6bbd45] pl-3">
                      Material Take-off
                    </h4>
                    <div className="flex flex-col gap-2 pl-4">
                      {rfq?.MTOManual && (
                        <div className="flex items-center gap-2.5 text-sm font-bold text-gray-800 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                          <span>MTO - Manual</span>
                        </div>
                      )}
                      {!!(
                        rfq?.MTOStickModel ||
                        rfq?.MTOValue ||
                        (rfq as any)?.MTOManualModel
                      ) && (
                        <div className="flex items-center gap-2.5 text-sm font-bold text-gray-800 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                          <span>MTO - Stick Model</span>
                        </div>
                      )}
                    </div>

                    {(rfq?.MTOStickModel ||
                      (rfq as any)?.MTOManualModel ||
                      rfq?.MTOValue) && (
                      <div className="mt-4 pl-4">
                        <div
                          className="prose prose-sm max-w-none text-sm font-medium text-gray-800 leading-relaxed rfq-description"
                          dangerouslySetInnerHTML={{
                            __html:
                              rfq?.MTOValue ||
                              rfq?.MTOStickModel ||
                              (rfq as any)?.MTOManualModel ||
                              "",
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-4">
                <div
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => setIsDescOpen(!isDescOpen)}
                >
                  <h4 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-tight border-l-4 border-[#6bbd45] pl-3">
                    {isDescOpen
                      ? "Description"
                      : "Click here to View the Description"}
                  </h4>
                  <button className="p-1.5 rounded-full group-hover:bg-gray-100 transition-colors">
                    {isDescOpen ? (
                      <ChevronUp size={20} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>

                {isDescOpen && (
                  <div className="pl-4 animate-in slide-in-from-top-2 duration-300">
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
                      className="rfq-description text-gray-800 text-sm font-medium wrap-break-word leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100"
                      dangerouslySetInnerHTML={{
                        __html:
                          (isCDRole ? rfq?.CDDescription : rfq?.description) ||
                          (isCDRole
                            ? "No CD description provided"
                            : "No description provided"),
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Files */}
              <div className="space-y-4">
                <h4 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-tight border-l-4 border-[#6bbd45] pl-3">
                  Attachments
                </h4>
                <div className="pl-4">
                  <RenderFiles
                    files={(isCDRole ? rfq?.CDAttachments : rfq?.files) || []}
                    table={isCDRole ? "rfqCDAttachments" : "rFQ"}
                    parentId={rfq?.id}
                    formatDate={formatDate}
                    hideHeader
                    noAccordion
                  />
                </div>
              </div>

              {/* Followups */}
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-4">
                  <h4 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-tight border-l-4 border-[#6bbd45] pl-3">
                    Followups
                  </h4>
                  <Button
                    onClick={() => setShowFollowupForm((v) => !v)}
                    className="px-4 sm:px-6 py-1.5 bg-green-50 text-black border-2 border-green-700/80 rounded-lg hover:bg-green-100 transition-all font-bold text-xs sm:text-sm uppercase tracking-tight shadow-sm cursor-pointer"
                  >
                    {showFollowupForm ? "Cancel" : "+ Add Followup"}
                  </Button>
                </div>

                {showFollowupForm && (
                  <div className="bg-white border border-green-100/50 rounded-2xl p-5 space-y-4 shadow-xs ml-4 animate-in slide-in-from-top-2 duration-300">
                    <div>
                      <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2">
                        Description *
                      </label>
                      <textarea
                        value={followupDescription}
                        onChange={(e) => setFollowupDescription(e.target.value)}
                        placeholder="Enter followup details..."
                        rows={3}
                        className="w-full px-4 py-3 border border-black/10 rounded-xl focus:ring-2 focus:ring-green-100 outline-none font-semibold text-sm transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2">
                        Files (optional)
                      </label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          console.log(
                            "[Followup] Files selected:",
                            files.map((f) => f.name),
                          );
                          setFollowupFiles(files);
                        }}
                        className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border file:border-gray-200 file:text-xs file:font-bold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 focus:outline-none"
                      />
                      {followupFiles.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1 font-semibold">
                          {followupFiles.length} file(s) selected
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleAddFollowup}
                      disabled={isSubmittingFollowup}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-sm transition-all disabled:opacity-60"
                    >
                      {isSubmittingFollowup
                        ? "Submitting..."
                        : "Submit Followup"}
                    </Button>
                  </div>
                )}

                <div className="pl-4">
                  {followups.length > 0 ? (
                    <DataTable
                      columns={followupColumns}
                      data={followups}
                      pageSizeOptions={[5, 10]}
                      detailComponent={({
                        row,
                      }: {
                        row: any;
                        close: () => void;
                      }) => (
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                              Description
                            </p>
                            <div
                              className="text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none [&_*]:max-w-full"
                              dangerouslySetInnerHTML={{
                                __html: row.description || "—",
                              }}
                            />
                          </div>
                          {row.files && row.files.length > 0 && (
                            <div className="pt-2">
                              <RenderFiles
                                files={row.files}
                                table="rFQFollowUp"
                                parentId={row.id}
                                formatDate={formatDate}
                                hideHeader
                                noAccordion
                              />
                            </div>
                          )}
                        </div>
                      )}
                    />
                  ) : (
                    <p className="text-sm text-gray-400 italic font-semibold">
                      No followups yet.
                    </p>
                  )}
                </div>
              </div>

              {userRole !== "client_admin" &&
                userRole !== "client" &&
                userRole !== "client_estimator" &&
                !isCDRole && (
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

            {/* ---------------- RIGHT COLUMN — RESPONSES ---------------- */}
            <div className="bg-zinc-50 border border-green-100/50 p-6 rounded-3xl shadow-sm space-y-6">
              {/* Header + Add Response Button */}
              <div className="flex justify-between items-center gap-4">
                <h4 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-tight border-l-4 border-[#6bbd45] pl-3">
                  Responses
                </h4>

                {(userRole === "admin" ||
                  userRole === "deputy_manager" ||
                  userRole === "operation_executive") && (
                  <Button
                    onClick={() => {
                      setSelectedParentResponseId(null);
                      setShowResponseModal(true);
                    }}
                    className="px-4 sm:px-6 py-1.5 bg-green-50 text-black border-2 border-green-700/80 rounded-lg hover:bg-green-100 transition-all font-bold text-xs sm:text-sm uppercase tracking-tight shadow-sm cursor-pointer"
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
                  fabricatorName={
                    rfq?.fabricator?.fabName ||
                    rfq?.sender?.fabricator?.fabName ||
                    (rfq as any)?.fabricatorName ||
                    ""
                  }
                  rfqProjectName={rfq?.projectName || ""}
                />
              )}
              {/* ---- RESPONSE TABLE (HIDDEN FOR CONNECTION DESIGNERS) ---- */}
              {!isCDRole &&
                (topLevelResponses.length ? (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {topLevelResponses.map((resp: any) => (
                      <RFQResponseItem
                        key={resp.id}
                        response={resp}
                        allResponses={responses}
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
              {!isClientRole && (
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
                  ) : isCDRole ? (
                    // Show Submit Button for all connection designer roles
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <p className="text-gray-500 mb-4 text-center">
                        You haven't submitted a quotation yet.
                      </p>
                      <Button
                        onClick={() => setShowQuotationResponseModal(true)}
                        className="px-6 py-2.5 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
                      >
                        Submit Quotation Response
                      </Button>
                    </div>
                  ) : null}
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
            rfqId={id}
            fabricatorName={
              rfq?.fabricator?.fabName ||
              rfq?.sender?.fabricator?.fabName ||
              (rfq as any)?.fabricatorName ||
              ""
            }
            rfqProjectName={rfq?.projectName || ""}
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
                  className={`flex-1 ${
                    deleteConfirmText === "DELETE"
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
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200 border border-black/10">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-black/10">
                <h3 className="text-xl sm:text-2xl font-black text-green-600 uppercase tracking-tight flex items-center gap-2">
                  Change RFQ Status
                </h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-xs sm:text-sm uppercase tracking-tight shadow-sm cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:ring-2 focus:ring-green-100 outline-none font-black uppercase text-xs tracking-widest cursor-pointer bg-white"
                  >
                    <option value="">Select Status</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="AWARDED">AWARDED</option>
                    <option value="RE_APPROVED">REVISED AND RESUBMIT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2">
                    Reason for Change{" "}
                    {(newStatus === "CLOSED" || newStatus === "RE_APPROVED") &&
                      "*"}
                  </label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="Enter reason..."
                    rows={3}
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:ring-2 focus:ring-green-100 outline-none font-black text-sm transition-all resize-none"
                  />
                </div>
              </div>
              <div className="flex mt-8 pt-4 border-t border-black/10">
                <Button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={isUpdatingStatus}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-sm transition-all"
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

const Info = ({ label, value }: { label: string; value: string | number }) => {
  if (!value || value === "----" || value === "N/A") return null;
  return (
    <div className="space-y-1.5">
      <h4 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-tight border-l-4 border-[#6bbd45] pl-3">
        {label}
      </h4>
      <p className="text-sm font-semibold text-gray-700 pl-4">{value}</p>
    </div>
  );
};

export default GetRFQByID;
