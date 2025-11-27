import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import Service from "../../api/Service";
import { X } from "lucide-react";
import type { RfqResponsePayload } from  "../../interface";

interface ResponseModalProps {
  rfqId: string;
  onClose: () => void;
  onSuccess: () => void; // callback to refresh RFQ after submission
}

const ResponseModal: React.FC<ResponseModalProps> = ({
  rfqId,
  onClose,
  onSuccess,
}) => {
  const { register, handleSubmit, control, reset } = useForm<RfqResponsePayload>();

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // Submit Handler
  const onSubmit = async (data: RfqResponsePayload) => {
    try {
      setLoading(true);

      const userId = sessionStorage.getItem("userId") || ""; // assuming userId stored in session

      const payload: RfqResponsePayload = {
        ...data,
        rfqId,
        userId,
        parentResponseId: data.parentResponseId || "",
        files,
      };
console.log(payload);

      // Convert to FormData
      const formData = new FormData();
      formData.append("rfqId", payload.rfqId);
      formData.append("userId", payload.userId);
      formData.append("description", payload.description);
      formData.append("status", "OPEN");
      formData.append("wbtStatus", "OPEN");
      
      if (payload.link) formData.append("link", payload.link);

      if (files.length > 0) {
        files.forEach((file) => formData.append("files", file));
      }

      await Service.addResponse(formData, rfqId);

      reset();
      setFiles([]);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Response submission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex items-center justify-center z-50">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-teal-700 mb-4">
          Add Response
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Message *
            </label>
            <textarea
              {...register("description", { required: true })}
              placeholder="Type your response..."
              rows={4}
              className="w-full border rounded-md p-2 text-gray-800"
            />
          </div>

          {/* Optional Parent Thread
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Replying to (optional)
            </label>
            <input
              {...register("parentResponseId")}
              placeholder="Enter response ID for threading"
              className="w-full border rounded-md p-2"
            />
          </div> */}

          {/* Optional Link */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Optional Link
            </label>
            <input
              {...register("link")}
              placeholder="Paste URL if any"
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* Files */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Attach Files
            </label>
            <Controller
              name="files"
              control={control}
              render={() => (
                <MultipleFileUpload
                  onFilesChange={(uploadedFiles) => setFiles(uploadedFiles)}
                />
              )}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Response"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResponseModal;
