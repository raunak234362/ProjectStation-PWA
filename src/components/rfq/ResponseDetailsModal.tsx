import { Loader2 } from "lucide-react";
import { formatDateTime } from "../../utils/dateUtils";
import { useState } from "react";
import Service from "../../api/Service";
import Button from "../fields/Button";
import RichTextEditor from "../fields/RichTextEditor";
import RenderFiles from "../ui/RenderFiles";
import { toast } from "react-toastify";

interface ResponseDetailsModalProps {
  response: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const ResponseDetailsModal = ({
  response,
  onClose,
  onSuccess,
}: ResponseDetailsModalProps) => {
  const [replyMode, setReplyMode] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState("PENDING");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRole = sessionStorage.getItem("userRole")?.toUpperCase() || "";

  const handleReplySubmit = async () => {
    if (!replyMessage.trim()) {
      toast.warning("Please enter a message before sending.");
      return;
    }

    const formData = new FormData();
    formData.append("description", replyMessage);
    formData.append("parentResponseId", response.id);
    formData.append("rfqId", response.rfqId);
    formData.append("userId", sessionStorage.getItem("userId") || "");
    formData.append("status", replyStatus);

    replyFiles.forEach((file) => formData.append("files", file));

    try {
      setIsSubmitting(true);
      const res = await Service.addResponse(formData, response.rfqId);
      toast.success(res?.data?.message || "Reply sent successfully!");
      setReplyMode(false);
      setReplyMessage("");
      setReplyFiles([]);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Reply failed:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to send reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
                {child.user?.firstName} {child.user?.lastName}
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
              className="prose prose-sm max-w-none text-black/80 font-medium"
              dangerouslySetInnerHTML={{ __html: child.description }}
            />
            {child.files?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-black/5">
                <RenderFiles
                  files={child.files}
                  table="rfqResponse"
                  parentId={child.id}
                />
              </div>
            )}
            {child.childResponses?.length > 0 && renderThread(child)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white shadow-2xl rounded-2xl md:rounded-3xl w-full max-w-5xl h-[95vh] md:h-auto md:max-h-[90vh] relative flex flex-col border border-black/10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/10 flex justify-between items-center bg-white shrink-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-black uppercase tracking-tight">
            Response Details
          </h2>
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-xs sm:text-sm uppercase tracking-tight shadow-sm cursor-pointer"
          >
            Close
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
              {response.status && (
                <span className="text-[10px] font-semibold bg-green-100 text-black px-3 py-0.5 rounded-md uppercase tracking-widest border border-gray-200 shadow-2xs">
                  {response.status}
                </span>
              )}
            </div>
            {response.user && (
              <span className="text-sm font-semibold text-black uppercase tracking-tight">
                Sent by {response.user.firstName ? `${response.user.firstName} ${response.user.lastName}` : response.user.username}
              </span>
            )}
          </div>

          {/* Subject Box */}
          {response.subject && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-xs space-y-1.5">
              <span className="text-base text-black uppercase tracking-widest block">
                Subject :  <span className="text-base text-black">
                  {response.subject}
                </span>
              </span>

            </div>
          )}

          {/* Message Content Box */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-xs">
            <div
              className="prose prose-base max-w-none text-black leading-relaxed rich-text-content"
              dangerouslySetInnerHTML={{ __html: response.description }}
            />
          </div>

          {/* Tonnage & Pages 3-column Box */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              <div>
                <span className="text-base font-semibold text-black uppercase tracking-widest block mb-1.5">
                  Tonnage (With Connections) :  <span className="text-base font-semibold text-black">
                    {response.totalTonnageWithConnection || "—"}
                  </span>
                </span>

              </div>
              <div>
                <span className="text-base font-semibold text-black uppercase tracking-widest block mb-1.5">
                  Tonnage (W/O Connections) : <span className="text-base font-semibold text-black">
                    {response.totalTonnageWithoutConnection || "—"}
                  </span>
                </span>

              </div>
              <div className="sm:col-span-2">
                <span className="text-sm font-semibold text-black uppercase tracking-widest block mb-1.5">
                  Page Numbers :
                </span>
                <div
                  className="text-sm text-black rich-text-content"
                  dangerouslySetInnerHTML={{ __html: response.PageNumbers || "—" }}
                />
              </div>
            </div>
          </div>

          {/* Project Files */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-black uppercase tracking-widest block">
              Project Files
            </span>
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-xs">
              <RenderFiles
                files={response.files}
                table="rfqResponse"
                parentId={response.id}
                hideHeader={true}
                noAccordion={true}
              />
            </div>
          </div>

          {replyMode && (
            <div className="mt-8 pt-8 border-t border-black/10 space-y-6 animate-in slide-in-from-bottom-4 duration-300 bg-white p-6 rounded-2xl border border-black/10 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h1 className="text-xs font-semibold text-black uppercase tracking-[0.2em]">
                  Reply
                </h1>
              </div>

              <div className="border border-black/10 rounded-2xl overflow-hidden focus-within:border-green-400 transition-all">
                <RichTextEditor
                  value={replyMessage}
                  onChange={setReplyMessage}
                  placeholder="Draft your engineering response..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-black uppercase tracking-widest block">
                    Proposal Status
                  </label>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value)}
                    className="w-full h-12 px-4 border border-black/10 rounded-xl bg-white focus:ring-2 focus:ring-green-100 outline-none font-semibold uppercase text-xs tracking-widest appearance-none cursor-pointer text-black"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Awarded</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CLARIFICATION_REQUIRED">
                      Clarification Required
                    </option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-black uppercase tracking-widest block">
                    Documents
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setReplyFiles(Array.from(e.target.files || []))
                    }
                    className="w-full h-12 px-4 py-2.5 border border-black/10 rounded-xl bg-white text-xs font-semibold uppercase text-black"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={() => setReplyMode(false)}
                  className="px-6 py-3 bg-white text-black border border-black/10 rounded-xl font-semibold uppercase text-xs tracking-widest hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  className="px-8 py-3 bg-green-200 text-black border-2 border-black rounded-xl font-semibold uppercase text-xs tracking-widest hover:bg-green-300 shadow-sm disabled:opacity-50"
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
          )}

          {response.childResponses?.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-semibold text-black uppercase tracking-widest">
                Threaded Communications ({response.childResponses.length})
              </h3>
              {renderThread(response)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-black/10 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          <span className="text-xs text-black font-bold tracking-wide">
            Submitted on: {formatDateTime(response.createdAt)}
          </span>
          {!replyMode &&
            ["ADMIN", "STAFF", "CLIENT", "CLIENT_ADMIN"].includes(userRole) && (
              <Button
                onClick={() => setReplyMode(true)}
                className="px-8 py-2.5 bg-green-200 text-black border-2 border-black rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-green-300 transition-all shadow-sm cursor-pointer"
              >
                Reply
              </Button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResponseDetailsModal;
