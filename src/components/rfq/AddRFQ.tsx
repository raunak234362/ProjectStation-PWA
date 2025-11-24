/* eslint-disable @typescript-eslint/no-explicit-any */
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
  ) as Fabricator[];

  const staffData = useSelector(
    (state: any) => state.userInfo.staffData
  ) as Staff[];

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
  const selectedFabricatorId = watch("fabricatorId");
  console.log(selectedFabricatorId);

  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");

  // --- FETCH STAFF ONCE ---
  useEffect(() => {
    const loadStaff = async () => {
      try {
        await Service.FetchEmployeeByRole("CLIENT");
      } catch (err) {
        console.error("Staff Fetch Failed:", err);
      }
    };
    loadStaff();
  }, [dispatch]);

  // --- WBT RECIPIENT OPTIONS ---
  const recipientOption: SelectOption[] =
    staffData
      ?.filter((u) => u.is_sales || u.is_superuser)
      .map((u) => ({
        label: `${u.f_name} ${u.m_name ?? ""} ${u.l_name}`,
        value: String(u.id),
      })) ?? [];

  // --- RESET OTHER TOOL IF TOOLS != OTHER ---
  useEffect(() => {
    if (tools !== "OTHER") setValue("otherTool", "");
  }, [tools, setValue]);


  // --- FABRICATOR OPTIONS ---
  const fabOptions: SelectOption[] =
    fabricators?.map((fab) => ({
      label: fab.fabName,
      value: String(fab.id),
    })) ?? [];

  const selectedFabricator = fabricators?.find(
    (fab) => String(fab.id) === String(selectedFabricatorId)
  );

  const clientOptions: SelectOption[] =
    selectedFabricator?.pointOfContact?.map((client) => ({
      label: `${client.firstName} ${client.middleName ?? ""} ${client.lastName}`,
      value: String(client.id),
    })) ?? [];

  // --- SUBMIT ---
  const onSubmit: SubmitHandler<AddRFQForm> = async (data) => {
    try {
      const payload: RFQpayload = {
        ...data,
        description,
        files,
        wbtStatus: "RECEIVED",
        recipient_id: data.recipients,
        salesPersonId: data.recipients,
        fabricatorId: data.fabricatorId,
        estimationDate: data.estimationDate
          ? new Date(data.estimationDate).toISOString()
          : null,
      };

      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (key === "files" && Array.isArray(value)) {
          value.forEach((file) => formData.append("files", file));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });

      await Service.addRFQ(formData);

      toast.success("RFQ Created Successfully");
      reset();
      setFiles([]);
      setDescription("");
    } catch (err) {
      toast.error("Failed to create RFQ");
      console.error(err);
    }
  };

  const selectedFabricatorOption =
    fabOptions.find((opt) => opt.value === selectedFabricatorId) || null;

  return (
    <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-8 my-6">
      <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
        Add New RFQ
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <SectionTitle title="Project Information" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FABRICATOR (HIDDEN FOR CLIENTS) */}
          {userType !== "client" && (
            <>
              <div>
                <label className="font-semibold text-gray-700 mb-1 block">
                  Fabricator *
                </label>

                <Select
                  options={fabOptions}
                  {...register("fabricatorId")}
                  value={selectedFabricatorOption?.value?.toString()}
                  onChange={(_, value) =>
                    setValue("fabricatorId", value ? value.toString() : "")
                  }
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
                      {...register("sender_id")}
                      value={field.value}
                      onChange={field.onChange}
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

          {/* CONTACT */}
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
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            {errors.recipients && (
              <p className="text-red-500 text-xs mt-1">
                {errors.recipients.message}
              </p>
            )}
          </div>

          {/* PROJECT NAME */}
          <div className="md:col-span-2">
            <Input
              label="Project Name *"
              {...register("projectName", {
                required: "Project name is required",
              })}
              placeholder="Enter project name"
            />
          </div>

          <Input
            label="Project Number"
            {...register("projectNumber")}
            placeholder="Optional"
          />
        </div>

        {/* DETAILS */}
        <SectionTitle title="Details" />

        <Input label="Subject" {...register("subject")} />

        <textarea
          className="w-full border rounded-md p-2"
          rows={4}
          placeholder="Enter description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* TOOLS */}
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
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        {tools === "OTHER" && (
          <Input
            label="Specify Other Tool"
            {...register("otherTool", { required: "Please specify the tool" })}
          />
        )}

        <Input
          label="Bid Price (USD)"
          type="number"
          {...register("bidPrice")}
        />

        <Input
          label="Due Date *"
          type="date"
          {...register("estimationDate", { required: "Due date is required" })}
        />

        {/* SCOPES */}
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

        {/* FILES */}
        <SectionTitle title="Attach Files" />

        <Controller
            name="files"
            control={control}
            render={({ field }) => (
              <MultipleFileUpload
                // When files change, update RHF's state
                onFilesChange={(files) => {
                  field.onChange(files);
                }}
              />
            )}
          />

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
