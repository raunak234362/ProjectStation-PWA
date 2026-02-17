import { CalendarDays } from "lucide-react";
import { formatDateTime } from "../../utils/dateUtils";
import { useState, type ChangeEvent } from "react";
import Button from "../fields/Button";
import Service from "../../api/Service";
import RichTextEditor from "../fields/RichTextEditor";
import RenderFiles from "../ui/RenderFiles";

// Status dropdown options
const STATUS_OPTIONS = [
  { label: "Partial", value: "PARTIAL" },
  { label: "Complete", value: "COMPLETE" },
  { label: "Open", value: "OPEN" },
];

const RFIResponseDetailsModal = ({ response, onClose }: any) => {
  const [replyMode, setReplyMode] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [replyStatus, setReplyStatus] = useState(response.wbtStatus);

  const userRole = sessionStorage.getItem("userRole")?.toUpperCase() || "";
  const userId = sessionStorage.getItem("userId") || "";
  console.log(response);

  // 🔒 Only Admin/Team can reply (not client)
  const canReply = ["ADMIN", "STAFF", "MANAGER"].includes(userRole);

  const handleReplySubmit = async () => {
    if (!replyMessage.trim()) return;

    const formData = new FormData();
    formData.append("reason", replyMessage);
    formData.append("rfiId", response.rfiId);
    formData.append("parentResponseId", response.id);
    formData.append("userId", userId);
    formData.append("wbtStatus", replyStatus); // 👈 send selected status

    replyFiles.forEach((file) => formData.append("files", file));

    await Service.addRFIResponse(formData, response.rfiId);

    // Reset Form UI
    setReplyMode(false);
    setReplyMessage("");
    setReplyFiles([]);
    setReplyStatus(response.wbtStatus);

    // Close to refresh parent UI
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-[#fafffb] w-full max-w-lg p-8 rounded-3xl shadow-2xl space-y-5 relative border border-gray-100">
        {/* Close Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-black uppercase tracking-tight">
            Response Details
          </h2>
          <button
            onClick={onClose}
            className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
          >
            Close
          </button>
        </div>

        {/* Main message */}
        <div
          className="bg-gray-100 p-3 rounded-md border prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: response.reason }}
        />

        {/* Files */}
        <RenderFiles
          files={response.files}
          table="rFIResponse"
          parentId={response.id}
        />

        {/* Timestamp */}
        <div className="flex gap-2 items-center text-gray-700 text-xs">
          <CalendarDays size={14} />
          {formatDateTime(response.createdAt)}
        </div>

        {/* Child Responses (Thread) */}
        {response.childResponses?.length > 0 && (
          <div className="mt-4 space-y-4 border-t pt-4 max-h-60 overflow-y-auto">
            <h4 className="text-sm font-semibold text-gray-700">History</h4>
            {response.childResponses.map((child: any) => (
              <div
                key={child.id}
                className="bg-gray-50 p-3 rounded border text-sm"
              >
                <div className="flex justify-between text-xs text-gray-700 mb-1">
                  <span className="font-medium text-gray-700">
                    {child.user?.name || "User"} ({child.user?.role || "N/A"})
                  </span>
                  <span>{formatDateTime(child.createdAt)}</span>
                </div>
                <div
                  className="text-gray-700 mb-2 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: child.reason }}
                />

                {/* Child Files */}
                <RenderFiles
                  files={child.files}
                  table="rFIResponse"
                  parentId={child.id}
                />
              </div>
            ))}
          </div>
        )}

        {/* Reply Button — only internal side */}
        {canReply && !replyMode && (
          <Button
            className="px-6 py-2 bg-black text-white rounded-lg font-bold uppercase tracking-tight hover:bg-black/90 transition-all border border-black shadow-md mt-4"
            onClick={() => setReplyMode(true)}
          >
            Reply
          </Button>
        )}

        {/* Reply Form */}
        {replyMode && (
          <div className="pt-4 space-y-4 border-t">
            {/* Message */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Your Reply
              </label>
              <RichTextEditor
                value={replyMessage}
                onChange={setReplyMessage}
                placeholder="Type your reply..."
              />
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Response Status
              </label>
              <select
                className="w-full border rounded-md p-2"
                value={replyStatus}
                onChange={(e) => setReplyStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <input
              type="file"
              multiple
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setReplyFiles(e.target.files ? Array.from(e.target.files) : [])
              }
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button onClick={() => setReplyMode(false)} className="px-4 py-2 bg-gray-100 text-black rounded-lg font-bold uppercase tracking-tight hover:bg-gray-200 transition-all border border-gray-200">Cancel</Button>
              <Button
                className="px-6 py-2 bg-black text-white rounded-lg font-bold uppercase tracking-tight hover:bg-black/90 transition-all border border-black shadow-md"
                onClick={handleReplySubmit}
              >
                Send Reply
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RFIResponseDetailsModal;
