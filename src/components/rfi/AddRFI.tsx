import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Input from "../fields/input";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import Service from "../../api/Service";
import type { Fabricator, SelectOption, RFIPayload } from "../../interface";
import Select from "react-select";
import RichTextEditor from "../fields/RichTextEditor";
import { Loader2 } from "lucide-react";

const AddRFI: React.FC<{ project?: any; onSuccess?: () => void }> = ({
  project,
  onSuccess,
}) => {
  console.log(project);

  const userDetail = useSelector((state: any) => state.userInfo.userDetail);
  const userRole = userDetail?.role; // CLIENT | ADMIN | STAFF etc.
  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo.fabricatorData,
  );
  const project_id = project?.id;
  const fabricatorID = project?.fabricatorID;
  console.log("Fabricators from Redux:", fabricators);

  const { register, setValue, handleSubmit, control, reset } =
    useForm<RFIPayload>();
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // Match selected fabricator
  const selectedFabricator = fabricators?.find(
    (f: Fabricator) => String(f.id) === String(fabricatorID),
  );
  // Correct POC mapping
  const pocOptions: SelectOption[] =
    selectedFabricator?.pointOfContact?.map((p: any) => ({
      label: `${p.firstName} ${p.middleName ?? ""} ${p.lastName}`,
      value: String(p.id),
    })) ?? [];

  const loweredRole = userRole?.toLowerCase();
  const isConnectionDesigner =
    loweredRole === "connection_designer" ||
    loweredRole === "connection_designer_admin" ||
    loweredRole === "connection_designer_engineer";

  const recipientOptions = isConnectionDesigner
    ? project?.manager
      ? [
          {
            label: `${project.manager.firstName} ${project.manager.middleName ?? ""} ${project.manager.lastName} (Manager)`.trim(),
            value: String(project.manager.id),
          },
        ]
      : []
    : [...pocOptions];

  const projectOptions: SelectOption[] =
    selectedFabricator?.project?.map((p: any) => ({
      label: p.projectName || p.name,
      value: String(p.id),
    })) ?? [];

  const getAutoPrefix = () => {
    const existingRfis = project?.rfi || [];
    let maxNum = 0;
    let hasRfiPattern = false;
    existingRfis.forEach((r: any) => {
      const match = r.subject?.match(/^RFI#(\d+)/i);
      if (match) {
        hasRfiPattern = true;
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNum = hasRfiPattern ? maxNum + 1 : existingRfis.length + 1;
    return `RFI#${String(nextNum).padStart(3, "0")}`;
  };

  const autoRfiPrefix = isConnectionDesigner ? getAutoPrefix() : "";

  const onSubmit = async (data: RFIPayload) => {
    try {
      setLoading(true);
      const payload: any = {
        ...data,
        subject: isConnectionDesigner ? `${autoRfiPrefix} - ${data.subject}` : data.subject,
        project_id: project_id,
        fabricator_id: fabricatorID,
        recepient_id: data.recepient_id,
        sender_id: userDetail?.id, // always user
        status: true,
        isAproovedByAdmin: "PENDING",
        description,
        files,
        isConnectionDesign: isConnectionDesigner,
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === "files" && Array.isArray(files)) {
          files.forEach((f) => formData.append("files", f));
        } else {
          formData.append(key, value as any);
        }
      });

      let fabricatorName = project?.fabricator?.fabName || selectedFabricator?.fabName || "";
      let projectName = project?.projectName || project?.name || "";
      if (!fabricatorName || !projectName) {
        const fetchedProject = await Service.GetProjectById(project_id);
        fabricatorName = fetchedProject?.fabricator?.fabName || "";
        projectName = fetchedProject?.projectName || fetchedProject?.name || "";
      }

      await Service.addRFI(formData, fabricatorName, projectName);
      toast.success("RFI Submitted Successfully");
      reset();
      setDescription("");
      setFiles([]);
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create RFI");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "CLIENT") {
      setValue("sender_id", String(userDetail?.id)); // auto-select logged-in client
    }
  }, [userRole, userDetail, setValue]);
  useEffect(() => {
    if (userRole === "CLIENT" && selectedFabricator) {
      setValue("fabricator_id", String(selectedFabricator.id));
      setValue("sender_id", String(userDetail?.id));
    }
  }, [userRole, selectedFabricator, userDetail, setValue]);
  useEffect(() => {
    if (userRole === "CLIENT" && projectOptions.length > 0) {
      setValue("project_id", String(projectOptions[0].value));
    }
  }, [userRole, projectOptions, setValue]);



  return (
    <div className="w-full mx-auto bg-zinc-100 p-2 rounded-xl shadow relative">
      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl transition-all duration-300">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-2" />
          <p className="text-black dark:text-white font-semibold text-lg animate-pulse">
            Uploading files & submitting RFI...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please wait, do not close this window
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* <SectionTitle title="Fabrication & Routing" /> */}

        <label className="text-sm font-medium text-gray-700">
          Select Recipient
        </label>
        <Controller
          name="recepient_id"
          control={control}
          rules={{ required: "Recipient required" }}
          render={({ field }) => (
            <Select
              placeholder="Recipient *"
              options={recipientOptions}
              value={recipientOptions.find((o) => o.value === field.value) ?? null}
              onChange={(option) =>
                field.onChange(option ? option.value : null)
              }
            />
          )}
        />

        {/* <SectionTitle title="Details" /> */}

        {isConnectionDesigner ? (
          <div className="w-full flex flex-col gap-1">
            <label className="text-sm font-medium text-black dark:text-white">
              Subject
            </label>
            <div className="flex items-center border border-black dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
              <span className="px-3 py-2 bg-zinc-200 dark:bg-slate-700 text-black dark:text-white border-r border-black dark:border-slate-700 font-bold select-none whitespace-nowrap">
                {autoRfiPrefix}
              </span>
              <input
                type="text"
                placeholder="Enter subject description"
                className="w-full px-3 py-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none bg-transparent"
                {...register("subject", { required: true })}
              />
            </div>
          </div>
        ) : (
          <Input
            label="Subject"
            placeholder="Enter subject"
            {...register("subject", { required: true })}
          />
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Enter RFI description..."
          />
        </div>

        {/* <SectionTitle title="Files" /> */}

        <MultipleFileUpload onFilesChange={setFiles} />

        <div className="flex justify-center w-full mt-6">
          <Button
            type="submit"
            className="w-full text-black border border-black bg-green-100"
            disabled={loading}
          >
            {loading ? "Submitting RFI..." : "Submit RFI"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddRFI;
