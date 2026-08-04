import { Loader2 } from "lucide-react";
import { formatDateTime } from "../../utils/dateUtils";
import React, { useState, useEffect } from "react";
import Service from "../../api/Service";
import Button from "../fields/Button";
import RichTextEditor from "../fields/RichTextEditor";
import RenderFiles from "../ui/RenderFiles";
import { toast } from "react-toastify";

interface ResponseDetailsModalProps {
  response: any;
  onClose: () => void;
  onSuccess?: () => void;
  rfqId?: string;
  fabricatorName?: string;
  rfqProjectName?: string;
}

const ResponseDetailsModal: React.FC<ResponseDetailsModalProps> = ({
  response: initialResponse,
  onClose,
  onSuccess,
  rfqId,
  fabricatorName: propFabricatorName,
  rfqProjectName: propRfqProjectName,
}) => {
  const [replyMode, setReplyMode] = useState(false);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState("AWARDED");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rfqDetails, setRfqDetails] = useState<any>(null);
  const [localResponse, setLocalResponse] = useState<any>(initialResponse);

  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<string[]>([initialResponse.id]);
  const currentResponseId = history[history.length - 1];

  const fetchResponseDetails = async (idToFetch: string) => {
    try {
      const res = await Service.getRFQResponseById(idToFetch);
      let data = res?.data || res;
      if (Array.isArray(data)) {
        data = data[0];
      }
      if (data) {
        setLocalResponse(data);
      }
    } catch (err) {
      console.error("Error fetching fresh response details:", err);
    }
  };

  useEffect(() => {
    if (currentResponseId) {
      fetchResponseDetails(currentResponseId);
    }
  }, [currentResponseId]);

  const handleBack = () => {
    if (history.length > 1) {
      setHistory((prev) => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    const fetchRfq = async () => {
      try {
        const targetRfqId = rfqId || initialResponse.rfqId;
        if (!targetRfqId) return;
        const res = await Service.GetRFQbyId(targetRfqId);
        const data = res?.data || res;
        if (data) {
          delete data.responses;
          setRfqDetails(data);
        }
      } catch (err) {
        console.error("Error fetching RFQ in response modal reply:", err);
      }
    };
    if (rfqId || localResponse?.rfqId) {
      fetchRfq();
    }
  }, [rfqId, localResponse?.rfqId]);

  const canReply = true; // Temporary bypass to ensure visibility

  const handleReplySubmit = async () => {
    if (!replyMessage.trim()) {
      toast.warning("Please enter a message before sending.");
      return;
    }

    const targetRfqId = rfqId || localResponse.rfqId;
    const formData = new FormData();
    formData.append("description", replyMessage);
    formData.append("parentResponseId", replyTargetId || localResponse.id);
    formData.append("rfqId", targetRfqId || "");
    formData.append("userId", sessionStorage.getItem("userId") || "");
    formData.append("status", replyStatus);
    formData.append("wbtStatus", replyStatus);

    replyFiles.forEach((file) => formData.append("files", file));

    try {
      setIsSubmitting(true);
      const fabricatorName =
        propFabricatorName ||
        rfqDetails?.fabricator?.fabName ||
        rfqDetails?.sender?.fabricator?.fabName ||
        rfqDetails?.fabricatorName ||
        "";
      const rfqProjectName =
        propRfqProjectName || rfqDetails?.projectName || "";
      const res = await Service.addResponse(
        formData,
        targetRfqId || "",
        fabricatorName,
        rfqProjectName,
      );
      toast.success(res?.data?.message || "Reply sent successfully!");
      setReplyMode(false);
      setReplyTargetId(null);
      setReplyMessage("");
      setReplyFiles([]);
      await fetchResponseDetails(currentResponseId); // Refresh the threaded view instantly
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Reply failed:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send reply. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName.substring(0, 2).toUpperCase();
    if (username) return username.substring(0, 2).toUpperCase();
    return "NA";
  };

  const renderThread = (res: any) => {
    return (
      <div className="space-y-6">
        {res.childResponses?.map((child: any) => (
          <div key={child.id} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                <span className="text-xs font-bold text-gray-700">
                  {getInitials(child.user?.firstName, child.user?.lastName, child.user?.username)}
                </span>
              </div>
              <div className="flex-1 border border-gray-200 bg-white flex flex-col">
                <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-black uppercase">
                    {child.user?.firstName ? `${child.user?.firstName} ${child.user?.lastName}` : child.user?.username || "Team Member"}
                  </span>
                  <span className="text-gray-400 text-[10px] flex items-center gap-1 font-semibold uppercase tracking-wider">
                    📅 {formatDateTime(child.createdAt)}
                  </span>
                </div>
                <div className="p-4 flex-1">
                  <div
                    className="prose prose-sm max-w-none text-gray-700 font-medium uppercase"
                    dangerouslySetInnerHTML={{ __html: child.description }}
                  />
                </div>
                {child.files?.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="border border-green-100/50 p-4">
                      <span className="text-xs font-bold text-black uppercase tracking-widest block mb-3">
                        Attachments
                      </span>
                      <RenderFiles
                        files={child.files}
                        table="rfqResponse"
                        parentId={child.id}
                        hideHeader={true}
                        noAccordion={true}
                      />
                    </div>
                  </div>
                )}
                {canReply && (
                  <div className="bg-white border-t border-gray-100 p-2 flex justify-end gap-2">
                    {child.childResponses?.length > 0 && (
                      <button
                        onClick={() => setExpandedThreads(prev => ({ ...prev, [child.id]: !prev[child.id] }))}
                        className="px-4 py-1.5 bg-[#e2f1f8] text-black border border-black/80 font-bold text-[10px] uppercase tracking-widest hover:bg-[#c9e4f5]"
                      >
                        {expandedThreads[child.id] ? "HIDE THREAD" : `VIEW THREAD (${child.childResponses.length})`}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setReplyTargetId(child.id);
                        setReplyMode(true);
                      }}
                      className="px-4 py-1.5 bg-[#dbe8d3] text-black border border-black/80 font-bold text-[10px] uppercase tracking-widest hover:bg-[#c9d8c0]"
                    >
                      REPLY
                    </button>
                  </div>
                )}
              </div>
            </div>
            {child.childResponses?.length > 0 && expandedThreads[child.id] && (
              <div className="ml-12 border-l-2 border-green-100/50 pl-4 animate-in slide-in-from-top-2 duration-200">
                {renderThread(child)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="project-component-container fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-white shadow-2xl rounded-2xl md:rounded-3xl w-full max-w-5xl h-[95vh] md:h-auto md:max-h-[90vh] relative flex flex-col border border-black/10 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 flex justify-between items-center bg-[#fcfdfc] border-b border-black/10 shrink-0">
            <div className="flex items-center gap-3">
              {history.length > 1 && (
                <button
                  onClick={handleBack}
                  className="px-3 py-1.5 bg-gray-100 text-black border border-black/20 font-bold text-xs uppercase tracking-tight hover:bg-gray-200"
                >
                  ← BACK
                </button>
              )}
              <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                RESPONSE DETAILS
              </h2>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-1.5 bg-white text-black border border-red-600 font-bold text-xs sm:text-sm uppercase tracking-tight hover:bg-red-50"
            >
              CLOSE
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6 bg-gray-50/30">
            {/* Main Message Header info */}
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-black uppercase tracking-widest">
                  Main Message
                </span>
                {localResponse.status && (
                  <span className="text-[10px] font-semibold bg-green-100 text-black px-3 py-0.5 rounded-md uppercase tracking-widest border border-gray-200 shadow-2xs">
                    {localResponse.status}
                  </span>
                )}
              </div>
              {localResponse.user && (
                <span className="text-sm font-semibold text-black uppercase tracking-tight">
                  Sent by{" "}
                  {localResponse.user.firstName
                    ? `${localResponse.user.firstName} ${localResponse.user.lastName}`
                    : localResponse.user.username}
                </span>
              )}
            </div>

            {/* Subject Box */}
            {localResponse.subject && (
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-xs space-y-1.5">
                <span className="text-base text-black uppercase tracking-widest block">
                  Subject :{" "}
                  <span className="text-base text-black">
                    {localResponse.subject}
                  </span>
                </span>
              </div>
            )}

            {/* Message Content Box */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-xs">
              <div
                className="prose prose-base max-w-none text-black leading-relaxed rich-text-content"
                dangerouslySetInnerHTML={{ __html: localResponse.description }}
              />
            </div>

            {/* Tonnage & Pages 3-column Box */}
            {(localResponse.type || localResponse.Type || "")?.toUpperCase() !==
              "DETAILING" && (
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                  <div>
                    <span className="text-base font-semibold text-black uppercase tracking-widest block mb-1.5">
                      Tonnage (With Connections) :{" "}
                      <span className="text-base font-semibold text-black">
                        {localResponse.totalTonnageWithConnection || "—"}
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="text-base font-semibold text-black uppercase tracking-widest block mb-1.5">
                      Tonnage (W/O Connections) :{" "}
                      <span className="text-base font-semibold text-black">
                        {localResponse.totalTonnageWithoutConnection || "—"}
                      </span>
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-sm font-semibold text-black uppercase tracking-widest block mb-1.5">
                      Page Numbers :
                    </span>
                    <div
                      className="text-sm text-black rich-text-content"
                      dangerouslySetInnerHTML={{
                        __html: localResponse.PageNumbers || "—",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Project Files */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-black uppercase tracking-widest block">
                Project Files
              </span>
              <div className="bg-white border border-gray-200">
                <div className="p-4 sm:p-5">
                  <RenderFiles
                    files={localResponse.files}
                    table="rfqResponse"
                    parentId={localResponse.id}
                    hideHeader={true}
                    noAccordion={true}
                  />
                </div>
                {canReply && (
                  <div className="bg-gray-50/50 border-t border-gray-100 p-3 flex justify-end">
                    <button
                      onClick={() => {
                        setReplyTargetId(localResponse.id);
                        setReplyMode(true);
                      }}
                      className="px-4 py-2 bg-[#dbe8d3] text-black border border-black/80 font-bold text-[10px] uppercase tracking-widest hover:bg-[#c9d8c0]"
                    >
                      REPLY TO THREAD
                    </button>
                  </div>
                )}
              </div>
            </div>

            {localResponse.childResponses?.length > 0 && (
              <div className="pt-6 pb-2">
                <div className="flex items-center mb-6">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="mx-4 text-gray-400 font-bold uppercase tracking-widest text-xs">
                    THREAD ({localResponse.childResponses.length} REPLIES)
                  </span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
                {renderThread(localResponse)}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-black/10 bg-white flex items-center shrink-0">
            <span className="text-xs text-black font-bold tracking-wide">
              Submitted on: {formatDateTime(localResponse.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Reply Popup Modal */}
      {replyMode && (
        <div className="project-component-container fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col border border-black/10 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Reply Modal Header */}
            <div className="px-6 py-4 border-b border-black/10 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h2 className="text-base font-black text-black uppercase tracking-widest">
                  Reply
                </h2>
              </div>
              <button
                onClick={() => {
                  setReplyMode(false);
                  setReplyTargetId(null);
                }}
                className="px-4 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-xs uppercase tracking-tight cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Reply Modal Body */}
            <div className="p-6 space-y-5">
              <div className="border border-black/10 rounded-xl overflow-hidden focus-within:border-green-400 transition-all">
                <RichTextEditor
                  value={replyMessage}
                  onChange={setReplyMessage}
                  placeholder="Draft your reply..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-black uppercase tracking-widest block">
                    Proposal Status
                  </label>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value)}
                    className="w-full h-11 px-4 border border-black/10 rounded-xl bg-white focus:ring-2 focus:ring-green-100 outline-none font-semibold uppercase text-xs tracking-widest appearance-none cursor-pointer text-black"
                  >
                    <option value="">Select Status</option>
                    {(() => {
                      const tType = localResponse?.type || localResponse?.Type;
                      return (
                        <>
                          {tType === "MTO" ? (
                            <option value="COMPLETED">COMPLETED</option>
                          ) : (
                            <option value="AWARDED">AWARDED</option>
                          )}
                          <option value="REJECTED">Rejected</option>
                          <option value="REVISE">Revise</option>
                          <option value="CLOSED">CLOSED</option>
                        </>
                      );
                    })()}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-black uppercase tracking-widest block">
                    Documents
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setReplyFiles(Array.from(e.target.files || []))
                    }
                    className="w-full h-11 px-4 py-2.5 border border-black/10 rounded-xl bg-white text-xs font-semibold uppercase text-black"
                  />
                </div>
              </div>
            </div>

            {/* Reply Modal Footer */}
            <div className="px-6 py-4 border-t border-black/10 bg-gray-50/50 flex justify-end">
              <Button
                className="px-8 py-2.5 bg-green-50 text-black border-2 border-green-700/80 rounded-lg font-bold text-xs uppercase tracking-tight hover:bg-green-100 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                onClick={handleReplySubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Sending...
                  </div>
                ) : (
                  "Send Reply"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResponseDetailsModal;
