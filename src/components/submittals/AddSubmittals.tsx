import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import Input from "../fields/input";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import SectionTitle from "../ui/SectionTitle";
import Service from "../../api/Service";
import type { SelectOption, Fabricator } from "../../interface";
import RichTextEditor from "../fields/RichTextEditor";

const AddSubmittal: React.FC<{ project: any; initialData?: any }> = ({
  project,
  initialData,
}) => {
  const userDetail = useSelector((state: any) => state.userInfo.userDetail);
  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo.fabricatorData
  );
  const staff = useSelector((state: any) => state.userInfo.staffData);
  const [milestones, setMilestones] = useState<any[]>([]);
  const projectId = project?.id;
  const fabricatorId = project?.fabricatorID;

  const fetchMileStone = async () => {
    try {
      const response = await Service.GetProjectMilestoneById(project.id);
      if (response && response.data) {
        setMilestones(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMileStone();
  }, [project.id]);

  const { register, handleSubmit, control, setValue, reset } = useForm<any>({
    defaultValues: {
      subject: initialData?.subject || "",
    },
  });
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [files, setFiles] = useState<File[]>([]);

  const selectedFabricator = fabricators?.find(
    (f: Fabricator) => String(f.id) === String(fabricatorId)
  );

  const pocOptions: SelectOption[] =
    selectedFabricator?.pointOfContact?.map((p: any) => ({
      label: `${p.firstName} ${p.middleName ?? ""} ${p.lastName}`,
      value: String(p.id),
    })) ?? [];

  const recipientOptions: SelectOption[] =
    staff
      ?.filter((s: any) => ["ADMIN", "SALES"].includes(s.role))
      .map((s: any) => ({
        label: `${s.firstName} ${s.lastName}`,
        value: String(s.id),
      })) ?? [];

  const mileStoneOptions: SelectOption[] =
    milestones?.map((m: any) => ({
      label: m.subject || m.description || "Unnamed Milestone",
      value: String(m.id),
    })) ?? [];

  useEffect(() => {
    setValue("sender_id", String(userDetail?.id));
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const payload: any = {
        ...data,
        fabricator_id: String(fabricatorId),
        project_id: String(projectId),

        description,
        files,
      };
      console.log(payload);

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === "files" && Array.isArray(files)) {
          files.forEach((file) => formData.append("files", file));
        } else {
          formData.append(key, value as any);
        }
      });
      console.log(formData);

      await Service.AddSubmittal(formData);
      toast.success("Submittal Created Successfully!");

      reset();
      setDescription("");
      setFiles([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create Submittal");
    }
  };

  useEffect(() => {
    if (milestones.length > 0) {
      setValue("mileStoneId", String(milestones[0].id));
    }
  }, [milestones]);

  return (
    <div className="w-full mx-auto bg-white p-4 rounded-xl shadow">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SectionTitle title="Fabrication & Routing" />

        {/* Sender (Fabricator POC) */}
        <Controller
          name="sender_id"
          control={control}
          render={({ field }) => (
            <Select<SelectOption>
              placeholder="Fabricator Contact"
              options={pocOptions}
              value={pocOptions.find((o) => o.value === field.value) ?? null}
              onChange={(option) => field.onChange(option?.value || "")}
            />
          )}
        />

        {/* Recipient (WBT Team) */}
        <Controller
          name="recepient_id"
          control={control}
          rules={{ required: "Recipient required" }}
          render={({ field }) => (
            <Select<SelectOption>
              placeholder="WBT Recipient *"
              options={recipientOptions}
              value={
                recipientOptions.find((o) => o.value === field.value) ?? null
              }
              onChange={(option) => field.onChange(option?.value || "")}
            />
          )}
        />

        <Controller
          name="mileStoneId"
          control={control}
          render={({ field }) => (
            <Select<SelectOption>
              placeholder="Select Project Milestone"
              options={mileStoneOptions}
              value={
                mileStoneOptions.find((o) => o.value === field.value) ?? null
              }
              onChange={(option) => field.onChange(option?.value || null)}
            />
          )}
        />

        <SectionTitle title="Details" />

        <Input
          label="Subject"
          placeholder="Enter Submittal Subject"
          {...register("subject", { required: true })}
        />

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Enter submittal description..."
          />
        </div>

        <SectionTitle title="Files" />

        <MultipleFileUpload onFilesChange={setFiles} />

        <div className="flex justify-end">
          <Button type="submit">Submit Submittal</Button>
        </div>
      </form>
    </div>
  );
};

export default AddSubmittal;
