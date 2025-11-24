import React, { useEffect, useState } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Input from "../fields/input";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";

import Service from "../../api/Service";

import type {
  AddRFQForm,
  RFQpayload,
  Fabricator,
  FabricatorClient,
  Staff,
  SelectOption,
} from "../../interface";
import SectionTitle from "../ui/SectionTitle";
import Select from "../fields/Select";
import Toggle from "../fields/Toggle";

const AddRFQ: React.FC = () => {
  const dispatch = useDispatch();

  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo?.fabricatorData
  );

  const staffData = useSelector((state: any) => state.userInfo.staffData);

  const userData = useSelector(
    (state: any) => state.userData?.profile as Staff | undefined
  );

  const userType =
    typeof window !== "undefined" ? sessionStorage.getItem("userType") : null;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddRFQForm>({
    defaultValues: {
      tools: "NO_PREFERENCE",
    },
  });

  const tools = watch("tools");
  const otherTool = watch("otherTool");
  const selectedFabricatorId = watch("fabricatorId");
 
  


  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const res = (await Service.FetchEmployeeByRole("CLIENT")) as Staff[];
        console.log(res);
      } catch (err) {
        console.error("Staff Fetch Failed:", err);
      }
    };
    loadStaff();
  }, [dispatch]);

  interface RecipientOption {
    label: string;
    value: string;
  }

  const recipientOption: RecipientOption[] = ((staffData as Staff[]) || [])
    .filter((u: Staff) => u.is_sales || u.is_superuser)
    .map((u: Staff) => ({
      label: `${u.f_name} ${u.m_name ?? ""} ${u.l_name}`,
      value: String(u.id),
    }));

  useEffect(() => {
    if (tools !== "OTHER") {
      setValue("otherTool", "");
    }
  }, [tools, setValue]);

  const onFilesChange = (uploaded: File[]) => {
    setFiles(uploaded);
  };

  const fabOptions: SelectOption[] =
    (fabricators as Fabricator[] | undefined)?.map((fab: Fabricator) => ({
      label: fab.fabName,
      value: fab.id,
    })) ?? [];
  
const selectedFabricator = (fabricators as Fabricator[])?.find(
  (fab) => fab.id === selectedFabricatorId
);
  console.log(selectedFabricatorId);
  

const clientOptions: SelectOption[] =
  selectedFabricator?.pointOfContact?.map((client: FabricatorClient) => ({
    label: `${client.f_name} ${client.m_name ?? ""} ${client.l_name}`,
    value: client.id,
  })) ?? [];
  console.log(selectedFabricator?.pointOfContact);
  

  const onSubmit: SubmitHandler<AddRFQForm> = async (data) => {
    try {
      const payload: RFQpayload = {
        ...data,
        description,
        files,
        wbtStatus: "RECEIVED",
        recipient_id: data.recipients,
        salesPersonId: data.recipients,
        fabricatorId: data.fabricatorId ?? userData?.fabricatorId!,
        estimationDate: data.estimationDate
          ? new Date(data.estimationDate).toISOString()
          : null,
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === "files" && Array.isArray(value)) {
          value.forEach((file) => formData.append("files", file));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      await Service.addRFQ(formData);

      toast.success("RFQ Created Successfully");
      reset();
    } catch (err) {
      toast.error("Failed to create RFQ");
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-8 my-6">
      <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
        Add New RFQ
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <SectionTitle title="Project Information" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fabricator (Not visible to clients) */}
          {userType !== "client" && (
            <>
              <div>
                <label className="font-semibold text-gray-700 mb-1 block">
                  Fabricator *
                </label>

                <Controller
                  name="fabricatorId"
                  control={control}
                  rules={{ required: "Fabricator is required" }}
                  render={({ field }) => (
                    <Select
                      options={fabOptions}
                      {...register("fabricatorId")}
                      onChange={(v: string) => field.onChange(v)}
                    />
                  )}
                />

                {errors.fabricatorId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fabricatorId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="font-semibold text-gray-700 mb-1 block">
                  Fabricator Contact *
                </label>

                <Controller
                  name="sender_id"
                  control={control}
                  rules={{ required: "Contact is required" }}
                  render={({ field }) => (
                    <Select
                      options={clientOptions}
                      onChange={(v: string) => field.onChange(v)}
                    />
                  )}
                />
                {errors.sender_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sender_id.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* WBT Point of Contact */}
          <div className="md:col-span-2">
            <label className="font-semibold text-gray-700 mb-1 block">
              WBT Point of Contact *
            </label>

            <Controller
              name="recipients"
              control={control}
              rules={{ required: "WBT contact is required" }}
              render={({ field }) => (
                <Select
                  options={recipientOption}
                  onChange={(v: string) => field.onChange(v)}
                />
              )}
            />

            {errors.recipients && (
              <p className="text-red-500 text-xs mt-1">
                {errors.recipients.message}
              </p>
            )}
          </div>

          {/* Project Name */}
          <div className="md:col-span-2">
            <Input
              label="Project Name *"
              {...register("projectName", {
                required: "Project name is required",
              })}
              placeholder="Enter project name"
            />
            {errors.projectName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.projectName.message}
              </p>
            )}
          </div>

          <Input
            label="Project Number"
            {...register("projectNumber")}
            placeholder="Optional"
          />
        </div>

        {/* ------------------- DETAILS ------------------- */}
        <SectionTitle title="Details" />

        <Input label="Subject" {...register("subject")} />

        {/* Description (rich text) */}
        <textarea
          className="w-full border rounded-md p-2"
          rows={4}
          placeholder="Enter description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Tools */}
        <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Tools *
          </label>
          <Controller
            name="tools"
            control={control}
            rules={{ required: "Tools selection is required" }}
            render={({ field }) => (
              <Select
                options={[
                  "TEKLA",
                  "SDS2",
                  "BOTH",
                  "NO_PREFERENCE",
                  "OTHER",
                ].map((t) => ({ label: t, value: t }))}
                onChange={(v: string) => field.onChange(v)}
              />
            )}
          />
          {errors.tools && (
            <p className="text-red-500 text-xs mt-1">{errors.tools.message}</p>
          )}
        </div>

        {tools === "OTHER" && (
          <Input
            label="Specify Other Tool"
            {...register("otherTool", {
              required: "Please specify the tool",
            })}
          />
        )}

        <Input
          label="Bid Price (USD)"
          type="number"
          {...register("bidPrice")}
        />

        {/* Due Date */}
        <Input
          label="Due Date *"
          type="date"
          {...register("estimationDate", {
            required: "Due date is required",
          })}
        />

        {/* ------------------- SCOPES ------------------- */}

        <SectionTitle title="Connection Design Scope" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Toggle label="Main Design" {...register("connectionDesign")} />
          <Toggle label="Misc Design" {...register("miscDesign")} />
          <Toggle label="Customer Design" {...register("customerDesign")} />
        </div>

        <SectionTitle title="Detailing Scope" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Toggle label="Main Steel" {...register("detailingMain")} />
          <Toggle label="Misc Steel" {...register("detailingMisc")} />
        </div>

        {/* ------------------- FILE UPLOAD ------------------- */}

        <SectionTitle title="Attach Files" />

        <Controller
          name={"files" as any}
          control={control}
          render={({ field }) => (
            <MultipleFileUpload
              onFilesChange={(uploaded) => {
                field.onChange(uploaded);
                onFilesChange(uploaded);
              }}
            />
          )}
        />

        {/* ------------------- SUBMIT ------------------- */}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create RFQ"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddRFQ;
