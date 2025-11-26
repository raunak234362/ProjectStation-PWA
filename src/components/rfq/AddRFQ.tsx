/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import Input from "../fields/input";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import Service from "../../api/Service";

import type { Fabricator, SelectOption, RFQpayload } from "../../interface";

import SectionTitle from "../ui/SectionTitle";
import Select from "../fields/Select";
import Toggle from "../fields/Toggle";

const AddRFQ: React.FC = () => {
  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo?.fabricatorData
  ) as Fabricator[];

  const staffData = useSelector((state: any) => state.userInfo.staffData);

  const userType =
    typeof window !== "undefined" ? sessionStorage.getItem("userType") : null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RFQpayload>();

  const selectedFabricatorId = watch("fabricatorId");

  // ------------------------------
  // FETCH STAFF
  // ------------------------------
  useEffect(() => {
    // Fetch all staff roles required for the recipient dropdown (e.g., ADMIN, SALES)
    Service.FetchEmployeeByRole("CLIENT").catch(console.error);
  }, []);

  // ------------------------------
  // OPTIONS FOR SELECTS
  // ------------------------------

  const recipientOption: SelectOption[] =
    staffData
      ?.filter((u: any) => ["ADMIN", "SALES"].includes(u.role))
      .map((u: any) => ({
        label: `${u.firstName} ${u.middleName ?? ""} ${u.lastName}`,
        value: String(u.id),
      })) ?? [];

  const fabOptions: SelectOption[] =
    fabricators?.map((fab) => ({
      label: fab.fabName,
      value: String(fab.id),
    })) ?? [];

  const selectedFabricator = fabricators?.find(
    (fab) => String(fab.id) === String(selectedFabricatorId)
  );
console.log(selectedFabricator);

  const clientOptions: SelectOption[] =
    selectedFabricator?.pointOfContact?.map((client) => ({
      label: `${client.firstName} ${client.middleName ?? ""} ${
        client.lastName
      }`,
      value: String(client.id),
    })) ?? [];

  // ------------------------------
  // RESET sender when fabricator changes
  // ------------------------------
  useEffect(() => {
    setValue("senderId", undefined);
  }, [selectedFabricatorId]);

  // ------------------------------
  // SUBMIT
  // ------------------------------
  const onSubmit = async (data: RFQpayload) => {
    try {
      const formData = new FormData();

      // ISO DATE
      if (data.estimationDate) {
        formData.append(
          "estimationDate",
          new Date(data.estimationDate).toISOString()
        );
      }

      // NORMAL FIELDS
      Object.keys(data).forEach((key) => {
        if (key === "files" || key === "estimationDate") return;

        const val = (data as any)[key];

        if (typeof val === "boolean") {
          formData.append(key, val ? "true" : "false");
        } else {
          formData.append(key, val ?? "");
        }
      });

      // FILES
      if (Array.isArray(data.files)) {
        data.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const res = await Service.addRFQ(formData);
      console.log(res);

      toast.success("RFQ Created Successfully");
      reset();
    } catch (err) {
      toast.error("Failed to create RFQ");
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white/80 rounded-xl shadow-lg p-8 mt-6">
      <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
        Add New RFQ
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <SectionTitle title="Project Information" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!userType?.includes("client") && (
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
                      value={field.value} // Pass the primitive value directly
                      onChange={(_, val) => field.onChange(val)}
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
                  name="senderId"
                  control={control}
                  rules={{ required: "Fabricator contact is required" }}
                  render={({ field }) => (
                    <Select
                      key={selectedFabricatorId} // force refresh
                      options={clientOptions}
                      value={field.value} // Pass the primitive value directly
                      onChange={(_, val) => field.onChange(val)}
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

          {/* WBT POC */}
          <div className="md:col-span-2">
            <label className="font-semibold text-gray-700 mb-1 block">
              WBT Point of Contact *
            </label>
            <Controller
              name="recipientId"
              control={control}
              rules={{ required: "WBT POC is required" }}
              render={({ field }) => (
                <Select
                  options={recipientOption}
                  value={field.value} // Pass the primitive value directly
                  onChange={(_, val) => field.onChange(val)}
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
            />
            {errors.projectName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.projectName.message}
              </p>
            )}
          </div>

          <Input
            label="Project Number"
            type="number"
            {...register("projectNumber")}
          />
        </div>

        {/* Details */}
        <SectionTitle title="Details" />
        <Input label="Subject" {...register("subject")} />

        <textarea
          className="w-full p-2 border rounded"
          rows={4}
          {...register("description")}
        />

        {/* TOOLS */}
        <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Tools *
          </label>
          <Controller
            name="tools"
            control={control}
            rules={{ required: "Tools selection required" }}
            render={({ field }) => {
              const options = [
                "TEKLA",
                "SDS2",
                "BOTH",
                "NO_PREFERENCE",
                "OTHER",
              ].map((t) => ({ label: t, value: t }));
              return (
                <Select
                  options={options}
                  value={field.value} // Pass the primitive value directly
                  onChange={(_, val) => field.onChange(val)}
                />
              );
            }}
          />
          {errors.tools && (
            <p className="text-red-500 text-xs mt-1">{errors.tools.message}</p>
          )}
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
        {errors.estimationDate && (
          <p className="text-red-500 text-xs mt-1">
            {errors.estimationDate.message}
          </p>
        )}

        {/* SCOPES */}
        <SectionTitle title="Connection Design Scope" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Toggle values are boolean, so Controller is required */}
          <Controller
            name="connectionDesign"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Main Design"
                checked={!!field.value}
                onChange={(v) => field.onChange(v)}
              />
            )}
          />

          <Controller
            name="miscDesign"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Misc Design"
                checked={!!field.value}
                onChange={(v) => field.onChange(v)}
              />
            )}
          />

          <Controller
            name="customerDesign"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Customer Design"
                checked={!!field.value}
                onChange={(v) => field.onChange(v)}
              />
            )}
          />
        </div>

        <SectionTitle title="Detailing Scope" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Controller
            name="detailingMain"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Main Steel"
                checked={!!field.value}
                onChange={(v) => field.onChange(v)}
              />
            )}
          />

          <Controller
            name="detailingMisc"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Misc Steel"
                checked={!!field.value}
                onChange={(v) => field.onChange(v)}
              />
            )}
          />
        </div>

        {/* FILES */}
        <SectionTitle title="Attach Files" />

        <Controller
          name="files"
          control={control}
          render={({ field }) => (
            <MultipleFileUpload
              onFilesChange={(updatedFiles) => field.onChange(updatedFiles)}
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
