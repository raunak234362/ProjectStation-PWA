import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import Service from "../../api/Service";
import Button from "../fields/Button";
import type { RFIResponseSchema } from "../../interface";
import RichTextEditor from "../fields/RichTextEditor";

interface RFIResponseModalProps {
  rfiId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RFIResponseModal: React.FC<RFIResponseModalProps> = ({
  rfiId,
  onClose,
  onSuccess,
}) => {
  const { handleSubmit, control, reset } = useForm<RFIResponseSchema>();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: RFIResponseSchema) => {
    try {
      setLoading(true);

      const userId = sessionStorage.getItem("userId") || "";
      const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";
      const payload: RFIResponseSchema = {
        ...data,
        rfiId,
        parentResponseId: data.parentResponseId || "",
      };
      console.log(payload);
      const formData = new FormData();
      formData.append("rfiId", rfiId);
      formData.append("reason", data.reason);

      //   formData.append("responseState", data.responseState ? "true" : "false");
      formData.append("userRole", userRole);
      formData.append("userId", userId);
      formData.append("wbtStatus", data.wbtStatus || "");

      files.forEach((file) => formData.append("files", file));

      await Service.addRFIResponse(formData, rfiId);

      reset();
      setFiles([]);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error submitting RFI response:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 px-4 py-1.5 bg-red-50 text-black border border-red-600 border-2 rounded-lg hover:bg-red-100 transition-all font-bold text-sm">

          CLOSE
        </button>

        <h2 className="text-xl font-bold text-black uppercase tracking-tight">Add Response</h2>

        <form className="space-y-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Message */}
          <Controller
            name="reason"
            control={control}
            rules={{ required: "Message is required" }}
            render={({ field }) => (
              <RichTextEditor
                value={field.value || ""}
                onChange={field.onChange}
                placeholder="Write your response..."
              />
            )}
          />

          {/* File uploader */}
          <Controller
            name="files"
            control={control}
            render={() => (
              <MultipleFileUpload onFilesChange={(f) => setFiles(f)} />
            )}
          />

          {/* Status Dropdown */}
          <Controller
            name="wbtStatus"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <div className="flex flex-col gap-1">
                <select
                  {...field}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-700"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="COMPLETE">Complete</option>
                  <option value="OPEN">Open</option>
                  <option value="SENT">Sent</option>
                  <option value="RECEIVED">Received</option>
                  <option value="IN_REVIEW">In Review</option>
                </select>
              </div>
            )}
          />

          <div className="flex justify-end gap-3 ">
            <Button onClick={onClose} className="bg-red-50 border border-red-600 border-2 rounded-lg hover:bg-red-100 transition-all font-bold text-sm text-black">Cancel</Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-100 border border-black rounded-lg hover:bg-green-200 transition-all font-bold text-sm text-black"
            >
              {loading ? "Submitting..." : "Submit Response"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RFIResponseModal;
