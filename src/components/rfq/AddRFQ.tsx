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
  // const dispatch = useDispatch();

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
    reset,
  } = useForm<RFQpayload>({
    defaultValues: {
      tools: "NO_PREFERENCE",
    },
  });


  const selectedFabricatorId = watch("fabricatorId");


  // const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");

  // --- FETCH STAFF ONCE ---
  // useEffect(() => {
  //   const loadStaff = async () => {
  //     try {
  //       await Service.FetchEmployeeByRole("CLIENT");
  //     } catch (err) {
  //       console.error("Staff Fetch Failed:", err);
  //     }
  //   };
  //   loadStaff();
  // }, [dispatch]);

  // --- WBT RECIPIENT OPTIONS ---
  const recipientOption: SelectOption[] =
    staffData
      ?.filter((u: { role: string; }) => u.role === "SALES" || u.role === "ADMIN")
      .map((u: { firstName: any; middleName: any; lastName: any; id: any; }) => ({
        label: `${u.firstName} ${u.middleName ?? ""} ${u.lastName}`,
        value: String(u.id),
      })) ?? [];

  // --- RESET OTHER TOOL IF TOOLS != OTHER ---
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

  // --- SUBMIT ---
  // const onSubmit: SubmitHandler<RFQpayload> = async (data) => {
  //   console.log("88888888888888888888888", data);

  //   try {
  //     const payload = {
  //       ...data,
  //       description,
  //       files: data.files,
  //       wbtStatus: "RECEIVED",
  //       recipientId: data.recipientId,
  //       salesPersonId: data.salesPersonId,
  //       fabricatorId: data.fabricatorId,
  //       estimationDate: data.estimationDate
  //         ? new Date(data.estimationDate).toISOString()
  //         : null,
  //     };

  //     const formData = new FormData();

  //     Object.entries(payload).forEach(([key, value]) => {
  //       if (key === "files" && Array.isArray(value)) {
  //         value.forEach((file) => formData.append("files", file));
  //       } else if (value !== undefined && value !== null) {
  //         formData.append(key, value as any);
  //       }
  //     });

  //     await Service.addRFQ(formData);

  //     toast.success("RFQ Created Successfully");
  //     reset();

  //     setDescription("");
  //   } catch (err) {
  //     toast.error("Failed to create RFQ");
  //     console.error(err);
  //   }
  // };
const onSubmit: SubmitHandler<RFQpayload> = async (data) => {
  try {
    const payload = {
  project_name: data.projectName,
  project_number: data.projectNumber ?? "",
  sender_id: data.senderId,
  recipient_id: data.recipientId,
  sales_person_id: data.recipientId, // mapping rule
  subject: data.subject ?? "",
  description,
  status: "PENDING",
  wbt_status: "RECEIVED",
  tools: data.tools,
  bid_price: data.bidPrice ?? "",
  estimation_date: data.estimationDate ? new Date(data.estimationDate).toISOString() : null,
  connection_design: data.connectionDesign ?? false,
  misc_design: data.miscDesign ?? false,
  customer_design: data.customerDesign ?? false,
  detailing_main: data.detailingMain ?? false,
  detailing_misc: data.detailingMisc ?? false,
  fabricator_id: data.fabricatorId ?? null,
  files: data.files ?? [],
};


   const formData = new FormData();
for (const [key, value] of Object.entries(payload)) {
  if (key === "files" && Array.isArray(value)) {
    value.forEach(file => formData.append("files", file));
  } else if (value !== undefined && value !== null) {
    formData.append(key, value as string);
  }
}


    await Service.addRFQ(formData);
    toast.success("RFQ Created Successfully");
    reset();
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
                  name="senderId"
                  control={control}
                  rules={{ required: "Fabricator contact is required" }}
                  render={({ field }) => (
                    <Select
                      options={clientOptions}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
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
                  options={recipientOption}
                  value={field.value}
                  onChange={field.onChange}
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
