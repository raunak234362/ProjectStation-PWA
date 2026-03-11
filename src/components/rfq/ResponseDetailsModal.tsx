import { CalendarDays } from "lucide-react";
import { formatDateTime } from "../../utils/dateUtils";
import { useState } from "react";
import Service from "../../api/Service";
import Button from "../fields/Button";
import RichTextEditor from "../fields/RichTextEditor";
import RenderFiles from "../ui/RenderFiles";

interface ResponseDetailsModalProps {
  response: any;
  onClose: () => void;
}

const ResponseDetailsModal = ({
  response,
  onClose,
}: ResponseDetailsModalProps) => {
  const [replyMode, setReplyMode] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState("PENDING");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);

  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";

  const handleReplySubmit = async () => {
    if (!replyMessage.trim()) return;

    const formData = new FormData();
    formData.append("description", replyMessage);
    formData.append("parentResponseId", response.id);
    formData.append("rfqId", response.rfqId);
    formData.append("userId", sessionStorage.getItem("userId") || "");

    replyFiles.forEach((file) => formData.append("files", file));

    try {
      await Service.addResponse(formData, response.rfqId);
      setReplyMode(false);
      setReplyMessage("");
      setReplyFiles([]);
      onClose();
    } catch (err) {
      console.error("Reply failed:", err);
    }
  };

  const renderThread = (res: any) => {
    return (
      <div className="ml-4 sm:ml-6 mt-4 border-l-2 border-black/10 pl-4 sm:pl-6 space-y-6">
        {res.childResponses?.map((child: any) => (
          <div
            key={child.id}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-black/5 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[9px] font-black bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                {formatDateTime(child.createdAt)}
              </span>
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
          <div className="flex flex-col">
            <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
              Response
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <CalendarDays size={12} className="text-black/30" />
              <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                {formatDateTime(response.createdAt)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-3 bg-red-50 hover:bg-red-100 text-black rounded-lg border border-red-600 transition-all flex items-center justify-center font-bold text-xs"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-10">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">
              Primary Manifest / Narrative
            </h3>
            <div
              className="text-black/80 bg-gray-50/50 p-6 rounded-2xl border border-black/10 prose prose-sm max-w-none shadow-inner font-medium"
              dangerouslySetInnerHTML={{ __html: response.description }}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">
              Technical Appendices
            </h3>
            <RenderFiles
              files={response.files}
              table="rfqResponse"
              parentId={response.id}
            />
          </div>

          {replyMode && (
            <div className="mt-8 pt-8 border-t border-black/10 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h1 className="text-xs font-black text-black uppercase tracking-[0.2em]">
                  Initialize Recursive Reply
                </h1>
              </div>

              <div className="border border-black/10 rounded-2xl overflow-hidden focus-within:border-blue-400 transition-all">
                <RichTextEditor
                  value={replyMessage}
                  onChange={setReplyMessage}
                  placeholder="Draft your engineering response..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                    Protocol Status
                  </label>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value)}
                    className="w-full h-12 px-4 border border-black/10 rounded-xl bg-white focus:ring-2 focus:ring-blue-100 outline-none font-black uppercase text-[10px] tracking-widest appearance-none cursor-pointer"
                  >
                    <option value="PENDING">PENDING - ACTIVE</option>
                    <option value="APPROVED">APPROVED - VERIFIED</option>
                    <option value="REJECTED">REJECTED - TERMINATED</option>
                    <option value="CLARIFICATION_REQUIRED">
                      CLARIFICATION REQUIRED
                    </option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                    Supplemental Assets
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setReplyFiles(Array.from(e.target.files || []))
                    }
                    className="w-full h-12 px-4 py-2.5 border border-black/10 rounded-xl bg-white text-[10px] font-black uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={() => setReplyMode(false)}
                  className="px-6 py-3 bg-white text-black border border-black/10 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  className="px-8 py-3 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black/90 shadow-xl"
                  onClick={handleReplySubmit}
                >
                  Send Reply Vector
                </Button>
              </div>
            </div>
          )}

          {response.childResponses?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">
                Threaded Communications ({response.childResponses.length})
              </h3>
              {renderThread(response)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-black/10 bg-gray-50/50 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 shrink-0">
          {!replyMode && userRole === "client" && (
            <Button
              onClick={() => setReplyMode(true)}
              className="w-full sm:w-auto px-10 py-3 bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-200 transition-all shadow-sm"
            >
              Initialize Reply
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseDetailsModal;
