import { X, Paperclip, CalendarDays } from "lucide-react";
import { useState } from "react";
import Service from "../../api/Service";
import Button from "../fields/Button";
import { openFileSecurely } from "../../utils/openFileSecurely";

interface ResponseDetailsModalProps {
  response: any;
  onClose: () => void;
}


const ResponseDetailsModal = ({ response, onClose }: ResponseDetailsModalProps) => {
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
  formData.append("status", replyStatus);
  formData.append("wbtStatus", replyStatus);

  // Attach files
  replyFiles.forEach(file => formData.append("files", file));

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
            <p className="font-medium">{child.description}</p>

            {child.files?.length > 0 && (
              <div className="text-sm text-gray-500">
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-xl space-y-4 relative">

        {/* Close Button */}
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
        >
          <X size={18} />
        </Button>

        <h2 className="text-xl font-semibold text-teal-700">
          Response Details
        </h2>

        {/* Message */}
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Message</p>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-md border">
            {response.description}
          </p>
        </div>

        {/* Attachments */}
        {response.files?.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Attachments</p>
            <ul className="space-y-2">
              {response.files.map((file: any) => (
                <li key={file.id} className="flex items-center gap-2">
                  <Paperclip size={16} className="text-teal-600" />
               

                  <span
                    className="text-sm text-teal-700 underline cursor-pointer hover:text-teal-900"
                    onClick={() => openFileSecurely("rfq/response", response.id, file.id)}
                  >
                    {file.originalName}
                  </span>
            
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Created At */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarDays size={16} />
          {new Date(response.createdAt).toLocaleString()}
        </div>


          {replyMode && (
  <div className="mt-4 border-t pt-4 space-y-3">
    <h3 className="text-md font-semibold text-teal-700">
      Write a Reply
    </h3>

    {/* Reply message */}
    <textarea
      value={replyMessage}
      onChange={(e) => setReplyMessage(e.target.value)}
      placeholder="Type your reply..."
      rows={3}
      className="w-full border rounded-md p-2"
    />

    {/* Status Dropdown */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
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
        <option value="CLARIFICATION_REQUIRED">Needs Clarification</option>
      </select>
    </div>

    {/* File Upload */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        Attach Files (Optional)
      </label>
      <input
        type="file"
        multiple
        onChange={(e) => setReplyFiles(Array.from(e.target.files || []))}
        className="w-full border rounded-md p-2"
      />
    </div>

    {/* ACTION BUTTONS */}
    <div className="flex justify-end gap-2">
      <Button onClick={() => setReplyMode(false)}>Cancel</Button>
      <Button className="bg-teal-600 text-white" onClick={handleReplySubmit}>
        Send Reply
      </Button>
    </div>
  </div>
)}


        {/* Replies Section */}
        {response.childResponses?.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm text-gray-600 font-semibold">Replies</h3>
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
