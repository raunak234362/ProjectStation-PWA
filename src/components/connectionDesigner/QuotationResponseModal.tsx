/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import Service from "../../api/Service";
import { X } from "lucide-react";
import type { Quotation } from "../../interface";
import { toast } from "react-toastify";

interface Props {
  rfqId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const QuotationResponseModal = ({ rfqId, onClose, onSuccess }: Props) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Quotation>();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: Quotation) => {
    try {
      setLoading(true);
      const connectionDesignerId =
        sessionStorage.getItem("connectionDesignerId") || "";
      const userId = sessionStorage.getItem("userId") || "";

      const formData = new FormData();

      formData.append("rfqId", rfqId);
      formData.append("connectionDesignerId", connectionDesignerId);
      formData.append("userId", userId);
      formData.append("bidprice", data.bidprice);
      formData.append("estimatedHours", data.estimatedHours);
      formData.append("weeks", data.weeks);
      formData.append("approvalStatus", String(data.approvalStatus || false));

      if (data.approvalDate) {
        formData.append("approvalDate", data.approvalDate);
      }

      if (files?.length) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      await Service.addConnectionDesignerQuotation(formData, rfqId);
      toast.success("Quotation submitted successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Quotation submission error:", error);
      toast.error("Failed to submit quotation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-green-700 mb-6">
          Submit Quotation Response
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Bid Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bid Price (USD) <span className="text-red-500">*</span>
            </label>
            <input
              {...register("bidprice", { required: "Bid price is required" })}
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="Enter bid price"
            />
            {errors.bidprice && (
              <p className="text-red-500 text-xs mt-1">
                {errors.bidprice.message}
              </p>
            )}
          </div>

          {/* Estimated Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Hours <span className="text-red-500">*</span>
            </label>
            <input
              {...register("estimatedHours", {
                required: "Estimated hours is required",
              })}
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="Enter estimated hours"
            />
            {errors.estimatedHours && (
              <p className="text-red-500 text-xs mt-1">
                {errors.estimatedHours.message}
              </p>
            )}
          </div>

          {/* Weeks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (Weeks) <span className="text-red-500">*</span>
            </label>
            <input
              {...register("weeks", {
                required: "Duration in weeks is required",
              })}
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="Enter duration in weeks"
            />
            {errors.weeks && (
              <p className="text-red-500 text-xs mt-1">
                {errors.weeks.message}
              </p>
            )}
          </div>

          {/* Approval Status */}
          <div className="flex items-center gap-3">
            <input
              {...register("approvalStatus")}
              type="checkbox"
              id="approvalStatus"
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label
              htmlFor="approvalStatus"
              className="text-sm font-medium text-gray-700"
            >
              Mark as Approved
            </label>
          </div>

          {/* Approval Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Date (Optional)
            </label>
            <input
              {...register("approvalDate")}
              type="date"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none transition"
            />
          </div>

          {/* Files */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <MultipleFileUpload onFilesChange={setFiles} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition disabled:bg-gray-400"
            >
              {loading ? "Submitting..." : "Submit Quotation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuotationResponseModal;
