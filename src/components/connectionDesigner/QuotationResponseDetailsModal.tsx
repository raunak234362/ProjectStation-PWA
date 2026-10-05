
import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import { toast } from "react-toastify";
import { formatDate, formatDateTime } from "../../utils/dateUtils";
import RichTextEditor from "../fields/RichTextEditor";
import { connectionDesignerService } from "../../api/Service1";

interface Props {
  quotation: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const QuotationResponseDetailsModal = ({
  quotation,
  onClose,
  onSuccess,
}: Props) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const userRole = sessionStorage.getItem("userRole");
  const isAdmin =
    userRole === "ADMIN" ||
    userRole === "DEPUTY_MANAGER" ||
    userRole === "OPERATION_EXECUTIVE";

  const isCDRole =
    userRoleLower === "connection_designer" ||
    userRoleLower === "connection_designer_engineer" ||
    userRoleLower === "connection_designer_admin";

  const fetchReplies = async () => {
    try {
      setLoadingReplies(true);
      const res = await connectionDesignerService.getCDQuotaResponsesByQuotaId(quotation.id);
      const data = res?.data || res || [];
      setReplies(data);
    } catch (err) {
      console.error("Error fetching replies:", err);
    } finally {
      setLoadingReplies(false);
    }
  };

  useEffect(() => {
    if (quotation?.id) {
      fetchReplies();
      setMainSteelPriceInput(quotation.mainSteelPrice || "0");
      setMiscSteelPriceInput(quotation.miscSteelPrice || "0");
    }
  }, [quotation?.id]);

  const buildTree = (list: any[]) => {
    const map: { [key: string]: any } = {};
    const roots: any[] = [];
    list.forEach((item) => {
      map[item.id] = { ...item, childResponses: [] };
    });
    list.forEach((item) => {
      const mappedItem = map[item.id];
      if (item.parentId && map[item.parentId]) {
        map[item.parentId].childResponses.push(mappedItem);
      } else {
        roots.push(mappedItem);
      }
    });
    const sortTree = (nodes: any[]) => {
      nodes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      nodes.forEach(node => {
        if (node.childResponses) sortTree(node.childResponses);
      });
    };
    sortTree(roots);
    return roots;
  };

  const renderThread = (res: any) => {
    return (
      <div className="ml-4 sm:ml-6 mt-4 border-l-2 border-black/10 pl-4 sm:pl-6 space-y-6">
        {res.childResponses?.map((child: any) => (
          <div
            key={child.id}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-black/5 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-semibold text-black uppercase tracking-tight">
                {child.userRole?.replace("_", " ") || "User"}
              </span>
              <div className="flex items-center gap-2">
                {child.status && (
                  <span className="text-[9px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-widest border border-blue-100">
                    {child.status}
                  </span>
                )}
                <span className="text-[9px] font-semibold bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  {formatDateTime(child.createdAt)}
                </span>
              </div>
            </div>
            <div
              className="prose prose-sm max-w-none text-black/80 font-medium rich-text-content"
              dangerouslySetInnerHTML={{ __html: child.description || child.message }}
            />
            
            {/* Display prices if any */}
            {(child.mainSteelPrice > 0 || child.miscSteelPrice > 0) && (
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                {child.mainSteelPrice > 0 && (
                  <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-bold uppercase tracking-wider">
                    Main Steel: ${child.mainSteelPrice}
                  </span>
                )}
                {child.miscSteelPrice > 0 && (
                  <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-bold uppercase tracking-wider">
                    Misc Steel: ${child.miscSteelPrice}
                  </span>
                )}
                <span className="px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-100 font-bold uppercase tracking-wider">
                  Total Bid: ${(parseFloat(child.mainSteelPrice || "0") + parseFloat(child.miscSteelPrice || "0")).toFixed(2)}
                </span>
              </div>
            )}

            {child.files && child.files.length > 0 && (
              <div className="mt-3 pt-3 border-t border-black/5">
                <RenderFiles
                  files={child.files}
                  table="CDQuotaResponse"
                  parentId={child.id}
                  hideHeader
                />
              </div>
            )}
            
            {/* Reply action inside thread */}
            {(isAdmin || isCDRole) && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedParentId(child.id);
                    setMainSteelPriceInput(child.mainSteelPrice || quotation.mainSteelPrice || "0");
                    setMiscSteelPriceInput(child.miscSteelPrice || quotation.miscSteelPrice || "0");
                    setReplyStatus(child.status || "IN_REVIEW");
                    setReplyMode(true);
                  }}
                  className="px-3 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded-md hover:bg-blue-100 transition-all uppercase tracking-wider cursor-pointer"
                >
                  Reply to this
                </button>
              </div>
            )}

            {child.childResponses?.length > 0 && renderThread(child)}
          </div>
        ))}
      </div>
    );
  };

  const handleReplySubmit = async () => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    try {
      setSubmitting(true);
      const userId = sessionStorage.getItem("userId") || "";
      const userRole = sessionStorage.getItem("userRole") || "";

      const formData = new FormData();
      formData.append("message", replyMessage);
      formData.append("userId", userId);
      formData.append("userRole", userRole);

      if (replyFiles?.length) {
        replyFiles.forEach((file) => {
          formData.append("files", file);
        });
      }

      await connectionDesignerService.addCDQuotaResponse(formData);
      toast.success("Reply sent successfully!");
      setReplyMessage("");
      setReplyFiles([]);
      setShowReplyForm(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Reply submission error:", error);
      toast.error("Failed to send reply");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-[#fafffb] w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-green-100/50">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-black uppercase tracking-tight">
            Quotation Details
          </h2>
          <button
            onClick={onClose}
            className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard
              icon={<DollarSign className="text-green-600" size={20} />}
              label="Bid Price"
              value={`$${quotation.bidprice || "N/A"}`}
            />
            <DetailCard
              icon={<Clock className="text-blue-600" size={20} />}
              label="Estimated Hours"
              value={`${quotation.estimatedHours || "N/A"} hrs`}
            />
            <DetailCard
              icon={<Calendar className="text-purple-600" size={20} />}
              label="Duration"
              value={`${quotation.weeks || "N/A"} weeks`}
            />
            <DetailCard
              icon={
                <CheckCircle
                  className={
                    quotation.approvalStatus
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                  size={20}
                />
              }
              label="Approval Status"
              value={quotation.approvalStatus ? "Approved" : "Pending"}
            />
          </div>

          {/* Approval Date */}
          {quotation.approvalDate && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Approval Date</p>
              <p className="font-semibold text-gray-800">
                {formatDate(quotation.approvalDate)}
              </p>
            </div>
          )}

          {/* Submitted By */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Submitted By</p>
            <p className="font-semibold text-gray-800">
              {quotation.connectionDesignerName ||
                quotation.connectionDesignerId ||
                "Connection Designer"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDateTime(quotation.createdAt || Date.now())}
            </p>
          </div>

          {/* Files */}
          {quotation.files && quotation.files.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-black text-black mb-3 flex items-center gap-2 uppercase tracking-tight">
                <FileText size={18} />
                Attachments ({quotation.files.length})
              </h3>
              <div className="space-y-2">
                {quotation.files.map((file: any, index: number) => (
                  <a
                    key={index}
                    href={file.url || file.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <FileText size={16} />
                    {file.name || `File ${index + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Replies Section */}
          {quotation.replies && quotation.replies.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-black text-black mb-4 uppercase tracking-tight">
                Replies ({quotation.replies.length})
              </h3>
              <div className="space-y-3">
                {quotation.replies.map((reply: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-gray-700">
                        {reply.userRole || "User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(reply.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-800">{reply.message}</p>
                    {reply.files && reply.files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {reply.files.map((file: any, idx: number) => (
                          <a
                            key={idx}
                            href={file.url || file.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <FileText size={12} />
                            {file.name || `Attachment ${idx + 1}`}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply Form */}
          {(isAdmin || userRole === "CONNECTION_DESIGNER_ENGINEER") && (
            <div className="border-t pt-4">
              {!showReplyForm ? (
                <Button
                  onClick={() => setShowReplyForm(true)}
                  className="w-full py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition"
                >
                  + Add Reply
                </Button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                    placeholder="Write your reply..."
                  />
                  <MultipleFileUpload onFilesChange={setReplyFiles} />
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyMessage("");
                        setReplyFiles([]);
                      }}
                      className="flex-1 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReplySubmit}
                      disabled={submitting}
                      className="flex-1 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition disabled:bg-gray-400"
                    >
                      {submitting ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer removed since we have header close */}
      </div>
    </div>
  );
};

// Helper Component
const DetailCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="bg-linear-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-4 flex items-start gap-3">
    <div className="mt-1">{icon}</div>
    <div>
      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className=" text-gray-800 text-lg">{value}</p>
    </div>
  </div>
);

export default QuotationResponseDetailsModal;
