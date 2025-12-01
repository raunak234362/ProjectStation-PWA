/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import Input from "../fields/input";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";

import Service from "../../api/Service";

import type {
  Fabricator,
  SelectOption,
  RFQpayload,
} from "../../interface";

import SectionTitle from "../ui/SectionTitle";
import Select from "../fields/Select";
import Toggle from "../fields/Toggle";

const AddRFQ: React.FC = () => {
  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo?.fabricatorData
  ) as Fabricator[];

  const staffData = useSelector(
    (state: any) => state.userInfo.staffData
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

  } = useForm<RFQpayload>({
    defaultValues: {
      tools: "NO_PREFERENCE",
    },
  });


  const selectedFabricatorId = watch("fabricatorId");



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
  }, []);

  // --- WBT RECIPIENT OPTIONS ---
  const recipientOption: SelectOption[] =
    staffData
      ?.filter((u: { role: string }) => u.role === "SALES" || u.role === "ADMIN")
      .map((u: { firstName: string; middleName?: string; lastName: string; id: number }) => ({
        label: `${u.firstName} ${u.middleName ?? ""} ${u.lastName}`,
        value: String(u.id),
      })) ?? [];
  // useEffect(() => {
  //   if (tools !== "OTHER") setValue("otherTool", "");
  // }, [tools, setValue]);


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

  // selector for the user

  const userDetail = useSelector((state: any) => state.userInfo.userDetail);
  const userRole = userDetail?.role;
  const fabricatorId = userDetail?.FabricatorPointOfContacts[0]?.id 
console.log(userDetail);


  // --- SUBMIT ---
 const onSubmit: SubmitHandler<RFQpayload> = async (data) => {
  try {
    const basePayload = {
      projectNumber: data.projectNumber || "",
      projectName: data.projectName,
      subject: data.subject || "",
      description,
      tools: data.tools,
      bidPrice: data.bidPrice,
      estimationDate: data.estimationDate
        ? new Date(data.estimationDate).toISOString()
        : null,
      status: "IN_REVIEW", 
      wbtStatus: "RECEIVED",
      connectionDesign: data.connectionDesign,
      miscDesign: data.miscDesign,
      customerDesign: data.customerDesign,
      detailingMain: data.detailingMain,
      detailingMisc: data.detailingMisc,

      files: data.files ?? [],
    };

    let payload;

    if (userRole === "CLIENT") {
      payload = {
        ...basePayload,
        senderId: userDetail?.id,
        fabricatorId: fabricatorId,
        recipientId: data.recipientId || "", // must exist
        salesPersonId: null, // client doesn't assign
      };
    } else {
      payload = {
        ...basePayload,
        senderId: data.senderId,
        recipientId: data.recipientId,
        fabricatorId: data.fabricatorId,
        salesPersonId: data.salesPersonId ?? null,
      };
    }

    // Convert to FormData
    const formData = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      if (key === "files" && Array.isArray(value)) {
        value.forEach((file) => formData.append("files", file));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    }

    await Service.addRFQ(formData);
    toast.success("RFQ Created Successfully");
    setDescription("");

  } catch (err) {
    console.error(err);
    toast.error("Failed to create RFQ");
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
          {userRole !== "CLIENT" && (
            <>
              <div>
                <label className="font-semibold text-gray-700 mb-1 block">
                  Fabricator *
                </label>

                <Controller
                  name="fabricatorId"
                  control={control}
                  disabled={userRole === "CLIENT"}

                  rules={{ required: "Fabricator is required" }}
                  render={({ field }) => {
                    const normalizedValue =
                      field.value ?? selectedFabricatorOption?.value ?? undefined;
                    const stringValue =
                      typeof normalizedValue === "number"
                        ? String(normalizedValue)
                        : normalizedValue;
                    return (
                      <Select
                        name={field.name}
                        options={fabOptions}
                        value={stringValue}
                        onChange={(_, value) => {
                          const sanitized = value ?? "";
                          field.onChange(sanitized);
                          setValue("fabricatorId", sanitized);
                        }}
                      />
                    );
                  }}
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
                  name="senderId"
                  control={control}
                  disabled={userRole === "CLIENT"}
                  rules={{ required: "Fabricator contact is required" }}
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      options={clientOptions}
                      value={field.value ? String(field.value) : undefined}
                      onChange={(_, value) => field.onChange(value ?? "")}
                    />
                  )}
                />


                {errors.senderId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.senderId.message}
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
              name="recipientId"
              control={control}
              rules={{ required: "WBT contact is required" }}
              render={({ field }) => (
                <Select
                  name={field.name}
                  options={recipientOption}
                  value={field.value ? String(field.value) : undefined}
                  onChange={(_, value) => field.onChange(value ?? "")}
                />
              )}
            />

            {errors.recipientId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.recipientId.message}
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
                name={field.name}
                options={[
                  "TEKLA",
                  "SDS2",
                  "BOTH",
                  "NO_PREFERENCE",
                  "OTHER",
                ].map((t) => ({ label: t, value: t }))}
                value={field.value}
                onChange={(_, value) => field.onChange(value ?? "")}
              />
            )}
          />
        </div>



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
