import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
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
  const { register, handleSubmit, control } = useForm<CoResponsePayload>();
  console.log(CoId);

  const [files, setFiles] = useState<File[]>([]);
  const [loading] = useState(false);
  const onSubmit = async (data: CoResponsePayload) => {
    try {
      const userId = sessionStorage.getItem("userId") || "";
      const userRole = sessionStorage.getItem("userRole") || "";

      const formData = new FormData();

      formData.append("CoId", CoId);
      formData.append("description", data.description);
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
    }
  };

  return (
    <div className="project-component-container fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl relative">
        <button onClick={onClose} className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm">
          Close
        </button>

        <h2 className="text-xl font-semibold text-black">
          Add CO Response
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Description */}
          <textarea
            {...register("description", { required: true })}
            rows={4}
            className="w-full border rounded-md p-3"
            placeholder="Write your response..."
          />

          {/* Status */}
          <select
            {...register("status", { required: true })}
            className="w-full border rounded-md p-2"
          >
            <option value="">Select Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Files */}
          <Controller
            name="files"
            control={control}
            render={() => <MultipleFileUpload onFilesChange={setFiles} />}
          />

          <div className="flex justify-end gap-3">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-50 text-black"
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoResponseModal;
