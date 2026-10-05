/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Service from "../../api/Service";
import type { RFQItem } from "../../interface";
import { Loader2, AlertCircle, Settings, Settings2 } from "lucide-react";
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
import { Trash2, X } from "lucide-react";
import { formatDate, formatDateTime } from "../../utils/dateUtils";
import { openFileSecurely } from "../../utils/openFileSecurely";
import { useDispatch } from "react-redux";
import { deleteRFQ, updateRFQ } from "../../store/rfqSlice";
import { toast } from "react-toastify";
import { rfqService } from "../../api/Service1";

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

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // New states for quotation responses
  const [showQuotationResponseModal, setShowQuotationResponseModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);

  // Followup states
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [followupDescription, setFollowupDescription] = useState("");
  const [followupFiles, setFollowupFiles] = useState<File[]>([]);
  const [isSubmittingFollowup, setIsSubmittingFollowup] = useState(false);
  const [followups, setFollowups] = useState<any[]>([]);

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
      
      const respRes = await rfqService.getRFQResponses(cleanId);
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
      if (!rfq) setLoading(true);
      const rfqRes = await Service.GetRFQbyId(id);

      const rfqRes = await rfqService.GetRFQbyId(cleanId);
      const rfqData = rfqRes?.data || rfqRes;
      if (rfqData) {
        setRfq(rfqData);
        dispatch(updateRFQ(rfqData));
      }

      // followUps are included in the RFQ response directly
      const rfqFollowUps = rfqData?.followUps ?? [];
      console.log("[Followups] Setting followups state:", rfqFollowUps);
      setFollowups(Array.isArray(rfqFollowUps) ? rfqFollowUps : []);
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
      const res = await rfqService.DeleteRFQById(id);
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
      await rfqService.UpdateRFQById(id, payload, fabricatorName, rfqProjectName);
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
    console.log("[Followup] Description:", followupDescription);
    console.log("[Followup] Files:", followupFiles);

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
      const res = await rfqService.addRFQFollowups(
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

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }
    if (!statusReason) {
      toast.error("Please provide a reason");
      return;
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
      if (rfqData.MTOStickModel || rfqData.MTOValue || rfqData.MTOManualModel || rfqData.isMTOStickModel || rfqData.mtoStickModelEnabled) mtoScopes.push("MTO - Stick Model");

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
          const rows: any[] = [];
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
      console.error("Status update failed:", err);
      toast.error("Failed to update RFQ status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading || error || !rfq) {
    return createPortal(
      <div className="project-component-container fixed inset-0 z-9999 flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
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
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full ml-2">
                <X size={20} />
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
      cell: ({ row }) => {
        const plainText =
          row.original.description?.replace(/<[^>]*>?/gm, "") || "";
        return <p className="truncate max-w-[180px]">{plainText}</p>;
      },
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
          {formatDateTime(row.original.createdAt)}
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
        <span className="text-sm text-gray-600">{row.original.weeks} wks</span>
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
        <div className="p-6 border-b border-gray-100 flex items-center justify-end bg-white">

          <button
            onClick={onClose}
            className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 sm:p-6 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* ---------------- LEFT COLUMN — RFQ DETAILS ---------------- */}
            <div className="border border-green-100/50 p-4 sm:p-6 rounded-3xl bg-gray-100 shadow-sm space-y-5 sm:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h3 className="text-xl sm:text-2xl text-black wrap-break-word max-w-full uppercase tracking-tight">
                    {rfq?.projectName}
                  </h3>

                  {/* Status tag */}
                  <span
                    className="px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-green-100 text-black border border-gray-200"
                  >
                    {rfq?.status}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* EDIT RFQ */}
                  {userRole !== "CLIENT" && userRole !== "CLIENT_ADMIN" && (
                    <>
                      <Button
                        onClick={() => alert("Coming soon: Edit RFQ modal")}
                        className="flex-1 sm:flex-none px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                      >
                        Edit
                      </Button>

                      <Button
                        onClick={() => setShowStatusModal(true)}
                        className="flex-1 sm:flex-none px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                      >
                        Change Status
                      </Button>
                    </>
                  )}

                  {/* DELETE RFQ */}
                  {/* <Button
                  type="button"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(true);
                  }}
                  className="flex-1 sm:flex-none px-3 py-1 text-white rounded-md transition text-sm"
                >
                  Delete
                </Button> */}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Info label="Subject" value={rfq?.subject || ""} />
                <Info label="Project Number" value={rfq?.projectNumber || ""} />
                <Info label="Status" value={rfq?.status || ""} />
                <Info label="Tools" value={rfq?.tools || "N/A"} />
                <Info label="Due Date" value={formatDate(rfq?.estimationDate)} />
                <Info label="Bid Amount (USD)" value={rfq?.bidPrice || "----"} />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h4 className="text-black text-sm bg-white p-4 rounded-xl border border-black/5 font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                  Description
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
                    className="rfq-description text-gray-800 p-5 text-xs sm:text-sm break-words leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: rfq?.description || "No description provided",
                    }}
                  />
                </div>
              </div>

              {/* Followups */}
              <div className="space-y-3 border border-grey-400 bg-white rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-black uppercase tracking-tight">Followups</h4>
                  <Button
                    onClick={() => setShowFollowupForm((v) => !v)}
                    className="px-3 py-1.5 text-xs bg-green-50 text-black border border-black rounded-lg font-bold uppercase tracking-tight hover:bg-green-100 transition-all"
                  >
                    {showFollowupForm ? "Cancel" : "+ Add Followup"}
                  </Button>
                </div>

                {showFollowupForm && (
                  <div className="bg-white border border-green-100 rounded-2xl p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Description *</label>
                      <textarea
                        value={followupDescription}
                        onChange={(e) => setFollowupDescription(e.target.value)}
                        placeholder="Enter followup details..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Files (optional)</label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          console.log("[Followup] Files selected:", files.map((f) => f.name));
                          setFollowupFiles(files);
                        }}
                        className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border file:border-gray-300 file:text-xs file:font-bold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                      />
                      {followupFiles.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{followupFiles.length} file(s) selected</p>
                      )}
                    </div>
                    <Button
                      onClick={handleAddFollowup}
                      disabled={isSubmittingFollowup}
                      className="w-full py-2 bg-green-200 text-black border border-black rounded-lg font-bold uppercase tracking-tight text-sm hover:bg-green-300 transition-all disabled:opacity-60"
                    >
                      {isSubmittingFollowup ? "Submitting..." : "Submit Followup"}
                    </Button>
                  </div>
                )}

                {/* Existing Followups — Table with inline accordion */}
                {followups.length > 0 ? (
                  <DataTable
                    columns={[
                      {
                        accessorKey: "createdBy",
                        header: "Created By",
                        cell: ({ row }: any) => {
                          const cb = row.original.createdBy;
                          const name = cb
                            ? `${cb.firstName ?? ""} ${cb.lastName ?? ""}`.trim()
                            : "—";
                          return <span className="font-medium text-xs sm:text-sm">{name}</span>;
                        },
                      },
                      {
                        accessorKey: "createdAt",
                        header: "Created At",
                        cell: ({ row }: any) => (
                          <span className="text-gray-700 text-xs">
                            {formatDateTime(row.original.createdAt)}
                          </span>
                        ),
                      },
                      {
                        accessorKey: "description",
                        header: "Description",
                        cell: ({ row }: any) => (
                          <p className="truncate max-w-[160px] text-xs text-gray-800">
                            {row.original.description || "—"}
                          </p>
                        ),
                      },
                      {
                        accessorKey: "files",
                        header: "Files",
                        cell: ({ row }: any) => {
                          const count = row.original.files?.length ?? 0;
                          return count > 0 ? (
                            <span className="text-black font-medium text-xs">{count} file(s)</span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          );
                        },
                      },
                    ]}
                    data={followups}
                    pageSizeOptions={[5, 10]}
                    detailComponent={({ row }: { row: any; close: () => void }) => {
                      const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

                      const handleViewFile = async (followupId: string, fileId: string) => {
                        console.log("[ViewFile] Opening file:", { followupId, fileId });
                        setLoadingFileId(fileId);
                        try {
                          await openFileSecurely("rfqFollowup", followupId, fileId);
                        } catch (err) {
                          console.error("[ViewFile] Error:", err);
                        } finally {
                          setLoadingFileId(null);
                        }
                      };

                      return (
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Description</p>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{row.description || "—"}</p>
                          </div>
                          {row.files?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Attachments</p>
                              <div className="flex flex-col gap-1.5">
                                {row.files.map((file: any, i: number) => (
                                  <button
                                    key={file.id || i}
                                    onClick={() => handleViewFile(row.id, file.id)}
                                    disabled={loadingFileId === file.id}
                                    className="flex items-center gap-2 text-xs text-blue-600 hover:underline text-left disabled:opacity-50"
                                  >
                                    <span>📎</span>
                                    {loadingFileId === file.id ? "Opening..." : (file.fileName || file.originalName || file.name || `File ${i + 1}`)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                ) : (
                  <p className="text-xs text-gray-400 italic">No followups yet.</p>
                )}
              </div>

              {/* Scopes */}
              <div className="space-y-3">
                <div className="p-4 bg-white/60 rounded-2xl border border-green-100/50 text-sm">
                  <h4 className="text-sm font-black text-black mb-3 flex items-center gap-1 uppercase tracking-wider">
                    <Settings className="w-4 h-4" /> Connection Design Scope
                  </h4>
                  <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs tracking-wider">
                    <Scope
                      label="Main Design"
                      enabled={rfq?.connectionDesign || false}
                    />
                    <Scope
                      label="Misc Design"
                      enabled={rfq?.miscDesign || false}
                    />
                    <Scope
                      label={
                        rfq?.customerDesign
                          ? "Connection Design by WBT"
                          : `Connection Design by ${rfq?.fabricator?.fabName ?? "Fabricator"}`
                      }
                      enabled={true}
                    />
                  </div>
                </div>
                <div className="p-4 bg-white/60 rounded-2xl border border-green-100/50 text-sm">
                  <h4 className="text-sm font-black text-black mb-3 flex items-center gap-1 uppercase tracking-wider">
                    <Settings2 className="w-4 h-4" /> Detailing Scope
                  </h4>
                  <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs tracking-wider">
                    <Scope
                      label="Detailing Main"
                      enabled={rfq?.detailingMain || false}
                    />
                    <Scope
                      label="Detailing Misc"
                      enabled={rfq?.detailingMisc || false}
                    />
                  </div>
                </div>
              </div>

              {/* Files */}
              <RenderFiles
                files={rfq?.files || []}
                table="rFQ"
                parentId={rfq?.id}
                formatDate={formatDate}
              />
              {userRole !== "CLIENT_ADMIN" &&
                userRole !== "CLIENT" &&
                userRole !== "CONNECTION_DESIGNER_ENGINEER" && (
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
            <div className="bg-gray-100 border border-green-100/50 p-4 sm:p-6 rounded-3xl shadow-sm space-y-5 sm:space-y-6">
              {/* Header + Add Response Button */}
              <div className="flex justify-between items-center gap-4">
                <h1 className="text-xl sm:text-2xl text-black uppercase tracking-tight">
                  Responses
                </h1>

                {(userRole === "ADMIN" ||
                  userRole === "DEPUTY_MANAGER" ||
                  userRole === "OPERATION_EXECUTIVE" ||
                  userRole === "USER") && (
                    <Button
                      onClick={() => setShowResponseModal(true)}
                      className="px-4 py-2 bg-green-50 text-black rounded-lg font-bold uppercase tracking-tight hover:bg-black/90 transition-all border border-black shadow-md"
                    >
                      + Add Response
                    </Button>
                  )}
              </div>
              {showResponseModal && (
                <ResponseModal
                  rfqId={id}
                  onClose={() => setShowResponseModal(false)}
                  onSuccess={fetchRfq}
                />
              )}
              {/* ---- RESPONSE TABLE (HIDDEN FOR CONNECTION DESIGNERS) ---- */}
              {userRole !== "CONNECTION_DESIGNER_ENGINEER" &&
                (rfq?.responses?.length ? (
                  <DataTable
                    columns={responseColumns}
                    data={rfq.responses} // Ensure rfq.responses is an array
                    pageSizeOptions={[5, 10]}
                    onRowClick={(row: any) => setSelectedResponse(row)} // 👈 open modal
                  />
                ) : (
                  <p className="text-gray-700 italic">No responses yet.</p>
                ))}
              <div className="mt-4">
                {(rfq?.CDQuotas?.length ?? 0) > 0 ? (
                  <>
                    <p className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                      CD Quotation
                    </p>
                  // Show their quotation if submitted
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
                    {userRole === "CONNECTION_DESIGNER_ENGINEER" ? (
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
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="AWARDED">AWARDED</option>
                    <option value="RE_APPROVED">RE_APPROVED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Change
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
      </div>
    </div>,
    document.body
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

const Scope = ({ label, enabled }: { label: string; enabled: boolean }) => (
  <div
    className={`px-3 py-2 rounded-lg border font-bold uppercase tracking-tighter ${enabled
      ? "bg-green-100/50 border-green-200 text-black"
      : "bg-gray-50 border-gray-200 text-gray-500"
      }`}
  >
    {label}
  </div>
);

export default GetRFQByID;
