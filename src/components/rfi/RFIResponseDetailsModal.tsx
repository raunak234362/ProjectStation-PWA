import { X, Paperclip, CalendarDays } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import Button from "../fields/Button";
import { openFileSecurely } from "../../utils/openFileSecurely";
import Service from "../../api/Service";

const RFIResponseDetailsModal = ({ response, onClose }: any) => {
  const [replyMode, setReplyMode] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  
  const userRole = sessionStorage.getItem("userRole") || "";
  const userId = sessionStorage.getItem("userId") || "";

  // 🚨 Only Admin side roles can reply
  const canReply = ["ADMIN", "STAFF", "MANAGER"].includes(userRole.toUpperCase());

  const handleReplySubmit = async () => {
    if (!replyMessage.trim()) return;

    const formData = new FormData();
    formData.append("reason", replyMessage);
    formData.append("rfiId", response.rfiId);
    formData.append("parentResponseId", response.id);
    formData.append("userId", userId);

    replyFiles.forEach((file) => formData.append("files", file));

    await Service.addRFIResponse(formData, response.rfiId);

    setReplyMode(false);
    setReplyFiles([]);
    setReplyMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl space-y-5 relative">
        
        {/* Close button */}
        <Button className="absolute top-3 right-3" onClick={onClose}>
          <X size={18} />
        </Button>

        <h2 className="text-xl font-bold text-teal-700">Response Details</h2>

        <p className="bg-gray-100 p-3 rounded-md border">{response.reason}</p>

        {/* Attachments */}
        {response.files?.length > 0 && (
          <div>
            <h4 className="text-sm text-gray-600 mb-2">Attachments</h4>
            {response.files.map((file: any) => (
              <p 
                key={file.id}
                className="cursor-pointer text-teal-600 underline"
                onClick={() => openFileSecurely("rfi/response", response.id, file.id)}
              >
                <Paperclip size={16} className="inline-block mr-2" />
                {file.originalName}
              </p>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="flex gap-2 items-center text-gray-500 text-xs">
          <CalendarDays size={14} />
          {new Date(response.createdAt).toLocaleString()}
        </div>

        {/* 🚨 Only internal team sees reply */}
        {canReply && (
          <Button className="bg-blue-600 text-white mt-3" onClick={() => setReplyMode(true)}>
            Reply
          </Button>
        )}

        {/* Reply Form */}
        {replyMode && (
          <div className="pt-4 space-y-3">
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={3}
              className="w-full border p-2 rounded"
            />

            <input
              type="file"
              multiple
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setReplyFiles(Array.from(e.target.files || []))
              }
            />

            <div className="flex justify-end gap-3">
              <Button onClick={() => setReplyMode(false)}>Cancel</Button>
              <Button className="bg-teal-600 text-white" onClick={handleReplySubmit}>
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
