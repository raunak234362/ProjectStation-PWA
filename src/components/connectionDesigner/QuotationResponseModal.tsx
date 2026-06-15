import { useState } from "react";
import { useForm } from "react-hook-form";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import Service from "../../api/Service";
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
    formState: { errors },
  } = useForm<Quotation>();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: Quotation) => {
    try {
      setLoading(true);
      const connectionDesignerId = sessionStorage.getItem("connectionDesignerId") || "";

      const formData = new FormData();
      formData.append("rfqId", rfqId);
      formData.append("connectionDesignerId", connectionDesignerId);
      formData.append("bidprice", data.bidprice);
      // Send dummy values for removed fields to satisfy backend validation
      formData.append("estimatedHours", "0");
      formData.append("weeks", "0");
      formData.append("days", "0");

      if (data.approvalDate) formData.append("approvalDate", data.approvalDate);
      if (files?.length) files.forEach((file) => formData.append("files", file));

      await Service.addConnectionDesignerQuotation(formData);
      toast.success("Quotation submitted successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to submit quotation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl md:rounded-3xl shadow-2xl relative max-h-[90vh] overflow-hidden border border-black/10 flex flex-col">
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-black/5 bg-white">
          <div className="flex flex-col">
            <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">Quotation Response</h2>
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.3em]">Bid & Estimation Protocol</p>
          </div>
          <button onClick={onClose} className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-10 space-y-8 overflow-y-auto custom-scrollbar">

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest">Bid Price (USD)</label>
            <input {...register("bidprice", { required: "Bid price is required" })} type="number" step="0.01" className="w-full h-12 px-4 border border-black/10 rounded-xl outline-none font-bold" placeholder="0.00" />
            <input {...register("bidprice", { required: "Bid price is required" })} type="number" step="0.01" className="w-full h-12 px-4 border border-black/10 rounded-xl outline-none font-bold" placeholder="0.00" />
            {errors.bidprice && <p className="text-rose-500 text-[9px] font-black uppercase tracking-widest">{errors.bidprice.message}</p>}
          </div>
          {/* <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-black/5">
            <input {...register("approvalStatus")} type="checkbox" id="approvalStatus" className="w-6 h-6 text-black border-black/10 rounded-lg cursor-pointer" />
            <label htmlFor="approvalStatus" className="text-xs font-black text-black uppercase tracking-widest cursor-pointer">Verify & Approve Quotation</label>
          </div> */}

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest">Supporting Documentation</label>
            <div className="p-1 rounded-2xl border-2 border-dashed border-black/10 hover:border-black transition-all">
              <MultipleFileUpload onFilesChange={setFiles} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-black/5">
            <button type="button" onClick={onClose} className="px-8 py-3 bg-white text-black border border-black/10 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-10 py-3 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl disabled:bg-black/40 shrink-0">
              {loading ? "Transmitting..." : "Submit Quotation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuotationResponseModal;
