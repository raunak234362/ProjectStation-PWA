import { useState } from "react";
import Button from "../fields/Button";
import Service from "../../api/Service";
import RichTextEditor from "../fields/RichTextEditor";
import { toast } from "react-toastify";

interface SubmittalResponseModalProps {
  submittal: any;
  parentResponseId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SubmittalResponseModal = ({
  submittal,
  onClose,

  parentResponseId = null,
}: SubmittalResponseModalProps) => {
  console.log(submittal);

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("SUBMITTED_TO_EOR");

  // ENUMS

  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async () => {
    const formData = new FormData();

    if (reason) formData.append("reason", reason);
    if (description) formData.append("description", description);
    formData.append("submittalVersionId", submittal.currentVersion.id);

    formData.append("submittalsId", submittal.id);
    formData.append("status", status);
    // formData.append("wbtStatus", wbtStatus);

    if (parentResponseId) {
      formData.append("parentResponseId", parentResponseId);
    }

    files.forEach((file) => formData.append("files", file));

    try {
      await Service.addSubmittalResponse(formData);
      toast.success("Submittal response added successfully");
      onClose();
    } catch (err) {
      toast.error("Submittal response failed");
      console.error("Submittal response failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative space-y-8 border border-black/5 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 px-4 py-1.5 bg-red-50 text-black border border-red-600 border-2 rounded-lg hover:bg-red-100 transition-all font-bold text-sm"
        >
          CLOSE
        </button>

        <h2 className="text-2xl font-black text-black uppercase tracking-tight">
          Add Submittal Response
        </h2>

        {/* REASON */}
        <div>
          <label className="text-sm font-medium">Reason (Optional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded-md p-2 mt-1"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Write your message..."
          />
        </div>

        {/* STATUS ENUM */}
        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as any);
              // setWbtStatus(e.target.value as any);
            }}
            className="w-full border rounded-md p-2 mt-1"
          >
            <option value="">Please Select the Status</option>
            <option value="SUBMITTED_TO_EOR">Submitted to EOR</option>
            <option value="REVISED_RESUBMITTAL">Revised & Resubmittal</option>
          </select>
        </div>

        {/* FILE UPLOAD */}
        <div>
          <label className="text-sm font-medium">Attachments</label>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="w-full border rounded-md p-2 mt-1"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
          <Button
            onClick={onClose}
            className="px-8 py-3 bg-gray-50 border border-black rounded-2xl text-black font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
          >
            Cancel
          </Button>
          <Button
            className="px-8 py-3 bg-green-100/80 border border-black rounded-2xl text-black font-black text-xs uppercase tracking-widest hover:bg-green-200/80 transition-all shadow-sm"
            onClick={handleSubmit}
          >
            Submit Response
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmittalResponseModal;
