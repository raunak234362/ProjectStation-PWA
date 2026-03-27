import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import Service from "../../../api/Service";
import Input from "../../fields/input";
import Button from "../../fields/Button";
import Select from "react-select";
import type { ProjectMilestone } from "../../../interface";
import RichTextEditor from "../../fields/RichTextEditor";

interface AddMileStoneProps {
  projectId: string;
  fabricatorId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddMileStone = ({
  projectId,
  fabricatorId,
  
  onSuccess,
}: AddMileStoneProps) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectMilestone>({
    defaultValues: {
      project_id: projectId,
      fabricator_id: fabricatorId,
      status: "PENDING",
    },
  });

  const statusOptions = [
    { label: "Pending", value: "PENDING" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Approved", value: "APPROVED" },
  ];
  const stageOptions = [
    { label: "IFA", value: "IFA" },
    { label: "IFC", value: "IFC" },
    { label: "RIFA", value: "RIFA" },
    { label: "RIFC", value: "RIFC" },
    { label: "CO", value: "CO" },
  ];
  const subjectOptions = [
    { label: "Anchor Bolt", value: "Anchor Bolt" },
    { label: "Main Steel", value: "Main Steel" },
    { label: "Main Steel Connection Design", value: "Main Steel Connection" },
    { label: "Misc Steel", value: "Misc Steel" },
    { label: "Misc Steel Connection Design", value: "Misc Steel Connection" },
    { label: "Foundation Embeds", value: "Foundation Embeds" },
    { label: "Panel Embeds", value: "Panel Embeds" },
    { label: "Others", value: "Others" },
  ];

  const onSubmit = async (data: ProjectMilestone) => {
    try {
      const payload = {
        ...data,
        status: "ACTIVE",
        stage: data.stage || "IFA",
        date: data.date ? new Date(data.date).toISOString() : undefined,
        approvalDate: data.approvalDate
          ? new Date(data.approvalDate).toISOString()
          : undefined,
      };
      await Service.AddProjectMilestone(payload);
      toast.success("Milestone added successfully!");
      if (onSuccess) onSuccess();
      //   onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add milestone");
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-zinc-100 rounded-2xl shadow-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Subject *
          </label>
          <Controller
            name="subject"
            control={control}
            rules={{ required: "Subject is required" }}
            defaultValue={subjectOptions[0].value}
            render={({ field }) => (
              <Select
                {...field}
                options={subjectOptions}
                value={subjectOptions.find((opt) => opt.value === field.value)}
                onChange={(opt) => field.onChange(opt?.value || "")}
                className="text-sm"
                menuPlacement="bottom"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: "0.5rem",
                    padding: "2px",
                  }),
                }}
              />
            )}
          />
          {errors.subject && (
            <p className="text-red-500 text-xs mt-1">
              {errors.subject.message}
            </p>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description *
            </label>
            <Controller
              name="description"
              control={control}
              rules={{ required: "Required" }}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder=""
                />
              )}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
         
            <Input
              label="Approval Date"
              type="date"
              {...register("approvalDate")}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Status
            </label>
            <Select
              options={statusOptions}
              defaultValue={statusOptions[0]}
              onChange={(opt) => setValue("status", opt?.value || "PENDING")}
              className="text-sm"
              menuPlacement="top"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "0.5rem",
                  padding: "2px",
                }),
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Stage
            </label>
            <Select
              options={stageOptions}
              defaultValue={stageOptions[0]}
              onChange={(opt) => setValue("stage", opt?.value || "IFA")}
              className="text-sm"
              menuPlacement="top"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "0.5rem",
                  padding: "2px",
                }),
              }}
            />
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 mt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 text-lg bg-green-100 text-black px-6"
            >
              {isSubmitting ? "Adding..." : "ADD MILESTONE"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMileStone;
