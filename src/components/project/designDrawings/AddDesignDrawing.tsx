/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import Service from "../../../api/Service";
import { toast } from "react-toastify";
import Button from "../../fields/Button";
import { Loader2, Upload, X } from "lucide-react";

interface AddDesignDrawingProps {
  projectId: string;
  onSuccess: () => void;
  onClose: () => void;
}

const AddDesignDrawing = ({ projectId, onSuccess, onClose }: AddDesignDrawingProps) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [files, setFiles] = useState<FileList | null>(null);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("stage", data.stage);
      formData.append("description", data.description);

      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
      }

      let fabricatorName = "";
      let projectName = "";
      if (projectId) {
        const res = await Service.GetProjectById(projectId);
        const project = res?.data || res;
        fabricatorName = project?.fabricator?.fabName || "";
        projectName = project?.name || project?.projectName || "";
      }

      await Service.CreateDesignDrawing(formData, fabricatorName, projectName);
      toast.success("Design drawing created successfully!");
      reset();
      setFiles(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating design drawing:", error);
      toast.error(error?.response?.data?.message || "Failed to create design drawing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 bg-[#f8f9fa] border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-[#334155] uppercase tracking-widest">
            Add Design Drawing
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg transition-all">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-tight">
              Stage <span className="text-red-500">*</span>
            </label>
            <select
              {...register("stage", { required: true })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
            >
              <option value="">Select Stage</option>
              <option value="IFA">IFA</option>
              <option value="IFC">IFC</option>
              <option value="CO#">CO#</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-tight">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description", { required: true })}
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
              placeholder="Enter drawing description..."
            />
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-tight">
              Attachments
            </label>
            <div className="relative group">
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={(e) => setFiles(e.target.files)}
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-xl appearance-none cursor-pointer hover:border-green-400 focus:outline-none group-hover:bg-gray-50"
              >
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-green-500 transition-colors" />
                  <span className="font-medium text-gray-600">
                    {files && files.length > 0
                      ? `${files.length} files selected`
                      : "Click to upload or drag and drop"}
                  </span>
                  <span className="text-xs text-gray-400">
                    PNG, JPG, PDF up to 10MB
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-green-200 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDesignDrawing;
