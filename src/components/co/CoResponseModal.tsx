import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import Service from "../../api/Service";
import type { CoResponsePayload } from "../../interface";

interface Props {
  CoId: string;
  onClose: () => void;
  onSuccess: () => void;
  currentVersionId?: string;
  projectId?: string;
}

const CoResponseModal = ({
  CoId,
  onClose,
  onSuccess,
  currentVersionId,
  projectId,
}: Props) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CoResponsePayload>();
  console.log(CoId);

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: CoResponsePayload) => {
    if (loading) return;

    if (!data.status) {
      toast.error("Please select a status");
      return;
    }

    if (!data.description || !data.description.trim()) {
      toast.error("Please enter a response message");
      return;
    }

    try {
      setLoading(true);
      const userId = sessionStorage.getItem("userId") || "";
      const userRole = sessionStorage.getItem("userRole") || "";

      const formData = new FormData();

      formData.append("CoId", CoId);
      formData.append("description", (data.description || "").toUpperCase());
      formData.append("status", data.status);
      formData.append("userId", userId);
      formData.append("userRole", userRole);
      formData.append("ParentResponseId", data.parentResponseId ?? "");
      formData.append("changeOrderVersionId", currentVersionId ?? "");

      if (files?.length) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      let fabricatorName = "";
      let projectName = "";
      if (projectId) {
        const projectRes = await Service.GetProjectById(projectId);
        const project = projectRes?.data || projectRes;
        fabricatorName = project?.fabricator?.fabName || project?.fabricatorName || "";
        projectName = project?.projectName || project?.name || "";
      } else {
        const coDetails = await Service.GetChangeOrderById(CoId);
        const coObj = coDetails?.data || coDetails;
        const projectObj = coObj?.project;
        if (projectObj) {
          fabricatorName = projectObj.fabricator?.fabName || projectObj.fabricatorName || "";
          projectName = projectObj.projectName || projectObj.name || "";
        } else {
          const pid = coObj?.projectId || coObj?.project_id;
          if (pid) {
            const projectRes = await Service.GetProjectById(pid);
            const project = projectRes?.data || projectRes;
            fabricatorName = project?.fabricator?.fabName || project?.fabricatorName || "";
            projectName = project?.projectName || project?.name || "";
          }
        }
      }

      await Service.addCOResponse(formData, CoId, fabricatorName, projectName);
      toast.success("Response added successfully!");

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("CO Response error:", error);
      toast.error(error?.response?.data?.message || "Failed to add response");
    } finally {
      setLoading(false);
    }
  };

  const onError = (formErrors: any) => {
    if (formErrors.status) {
      toast.error(formErrors.status.message || "Please select a status");
    }
    if (formErrors.description) {
      toast.error(formErrors.description.message || "Please enter a response message");
    }
  };

  return (
    <div className="project-component-container fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl relative">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-black uppercase tracking-tight">
            Add CO Response
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4 mt-4">
          {/* Description */}
          <div>
            <textarea
              {...register("description", {
                required: "Please enter your response message",
              })}
              rows={4}
              className={`w-full border rounded-md p-3 uppercase focus:outline-none transition-colors ${
                errors.description
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-black"
              }`}
              placeholder="WRITE YOUR RESPONSE..."
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1 font-semibold">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <select
              {...register("status", {
                required: "Please select a status",
              })}
              className={`w-full border rounded-md p-2 bg-white focus:outline-none transition-colors ${
                errors.status
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-black"
              }`}
            >
              <option value="">Select Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-xs mt-1 font-semibold">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Files */}
          <Controller
            name="files"
            control={control}
            render={() => <MultipleFileUpload onFilesChange={setFiles} />}
          />

          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-50 text-black flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoResponseModal;
