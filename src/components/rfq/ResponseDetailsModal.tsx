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
  console.log(response);
  const [replyMode, setReplyMode] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState("PENDING");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);

  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";
  // const handleReplySubmit = async () => {
  //   if (!replyMessage.trim()) return;

  //   const formData = new FormData();
  //   formData.append("description", replyMessage);
  //   formData.append("parentResponseId", response.id); // Threading HERE
  //   formData.append("rfqId", response.rfqId);
  //   formData.append("userId", sessionStorage.getItem("userId") || "");
  //   formData.append("wbtStatus", "OPEN");
  //   formData.append("status", "OPEN");

  //   try {
  //     await Service.addResponse(formData, responseId);

  //     setReplyMode(false);
  //     setReplyMessage("");
  //     onClose(); // close modal
  //     // trigger parent refresh
  //   } catch (err) {
  //     console.error("Reply failed:", err);
  //   }
  // };

  const handleReplySubmit = async () => {
    if (!replyMessage.trim()) return;

    const formData = new FormData();
    formData.append("description", replyMessage);
    formData.append("parentResponseId", response.id);
    formData.append("rfqId", response.rfqId);
    formData.append("userId", sessionStorage.getItem("userId") || "");
    // formData.append("status", replyStatus);
    // formData.append("wbtStatus", replyStatus);

    // Attach files
    replyFiles.forEach((file) => formData.append("files", file));

    try {
      await Service.addResponse(formData, response.rfqId);

      setReplyMode(false);
      setReplyMessage("");
      setReplyFiles([]);
      setReplyStatus("PENDING");
      onClose();
    } catch (err) {
      console.error("Reply failed:", err);
    }
  };

  const renderThread = (res: any) => {
    return (
      <div className="ml-4 border-l pl-4 space-y-4">
        {res.childResponses?.map((child: any) => (
          <div key={child.id} className="bg-gray-50 p-3 rounded-md">
            <div
              className="font-medium prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: child.description }}
            />

            {child.files?.length > 0 && (
              <div className="text-sm text-gray-700">
                {child.files.length} attachment(s)
              </div>
            )}

            {/* Recursive threading */}
            {child.childResponses?.length > 0 && renderThread(child)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#fafffb] h-[90vh] overflow-y-auto w-full max-w-5xl p-8 rounded-3xl shadow-2xl space-y-4 relative border border-green-100/50">
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

        {/* Message */}
        <div className="space-y-1">
          <p className="text-sm text-gray-700">Message</p>
          <div
            className="text-gray-700 bg-gray-50 p-3 rounded-md border prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: response.description }}
          />
        </div>

        {/* Attachments */}
        <RenderFiles
          files={response.files}
          table="rfqResponse"
          parentId={response.id}
        />

        {/* Created At */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <CalendarDays size={16} />
          {formatDateTime(response.createdAt)}
        </div>

        {replyMode && (
          <div className="mt-4 border-t border-gray-100 pt-6 space-y-3">
            <h3 className="text-md font-black text-black uppercase tracking-tight">
              Write a Reply
            </h3>

            {/* Reply message */}
            <div className="space-y-1">
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
                value={replyStatus}
                onChange={(e) => setReplyStatus(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CLARIFICATION_REQUIRED">
                  Needs Clarification
                </option>
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attach Files (Optional)
              </label>
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setReplyFiles(Array.from(e.target.files || []))
                }
                className="w-full border rounded-md p-2"
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-2">
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


        {/* Replies Section */}
        {response.childResponses?.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm text-gray-700 font-semibold">Replies</h3>
            {renderThread(response)}
          </div>
        )}

        {/* Future  actions */}
        <div className="flex justify-end gap-3 pt-3">
          {userRole === "client" ? (
            <Button
              onClick={() => setReplyMode(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Reply
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ResponseDetailsModal;
