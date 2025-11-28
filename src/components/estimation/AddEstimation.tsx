/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";

import { toast } from "react-toastify";

import Input from "../fields/input";
import Select from "../fields/Select";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import SectionTitle from "../ui/SectionTitle";

import Service from "../../api/Service";
import type { EstimationPayload, Fabricator, SelectOption } from "../../interface";
import { useSelector } from "react-redux";

const EstimationStatusOptions = [
  { label: "PENDING", value: "PENDING" },
  { label: "IN_PROGRESS", value: "IN_PROGRESS" },
  { label: "COMPLETED", value: "COMPLETED" },
  { label: "APPROVED", value: "APPROVED" },
];

const AddEstimation: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
    const rfqData = useSelector((state: any) => state.RFQInfos.RFQData);
  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo?.fabricatorData
  ) as Fabricator[];

  const staffData = useSelector((state: any) => state.userInfo?.staffData);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EstimationPayload>({
    defaultValues: {
      status: "PENDING",
    },
  });

  const selectedRfqId = watch("rfqId");

  React.useEffect(() => {
    if (selectedRfqId) {
      const selectedRfq = rfqData?.find((rfq: any) => rfq.id === selectedRfqId);
      if (selectedRfq) {
        setValue("projectName", selectedRfq.projectName);
        setValue("description", selectedRfq.description);
        setValue("fabricatorId", selectedRfq.fabricatorId);
        setValue("tools", selectedRfq.tools);
        if (selectedRfq.estimationDate) {
          setValue("estimateDate", selectedRfq.estimationDate.split("T")[0]);
        }
      }
    }
  }, [selectedRfqId, rfqData, setValue]);

  // --- RFQ Options ---
  const rfqOptions: SelectOption[] =
    rfqData
      ?.filter((rfq: any) => rfq.wbtStatus === "RECEIVED")
      .map((rfq: any) => ({
        label: rfq.projectName + " - " + rfq.fabricator?.fabName,
        value: String(rfq.id),
      })) ?? [];

  // --- Fabricator Options ---
  const fabricatorOptions: SelectOption[] =
    fabricators?.map((fab) => ({
      label: fab.fabName,
      value: String(fab.id),
    })) ?? [];

  // --- On Submit ---
  const onSubmit: SubmitHandler<EstimationPayload> = async (data) => {
    try {
      const payload = {
        ...data,
        files,
        status: "DRAFT",
        estimateDate: data.estimateDate
          ? new Date(data.estimateDate).toISOString()
          : null,
        startDate: data.startDate
          ? new Date(data.startDate).toISOString()
          : null,
      };

      const formData = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        if (key === "files" && Array.isArray(value)) {
          value.forEach((file) => formData.append("files", file));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      }

      await Service.AddEstimation(formData); // ✅ your backend endpoint
      toast.success("Estimation created successfully");
      reset();
      setFiles([]);
    } catch (error) {
      console.error("Estimation creation failed:", error);
      toast.error("Failed to create estimation");
    }
  };

  return (
    <div className="w-full mx-auto bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-8 my-6">
      <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
        Add New Estimation
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 🔹 Basic Info */}
        <SectionTitle title="Estimation Info" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">

              <h4 className="text-sm font-semibold text-gray-600">RFQ</h4> <Controller
            name="rfqId"
            control={control}
            // rules={{ required: "Fabricator is required" }}
            render={({ field }) => (
              <Select
              label="RFQ "
                name={field.name}
                options={rfqOptions}
                value={field.value}
                onChange={(_, value) => field.onChange(value ?? "")}
              />
            )}
          />
              </div>
          <Input
            label="Estimation Number *"
            {...register("estimationNumber")}
            placeholder="Enter estimation number"
          />
          {errors.estimationNumber && (
            <p className="text-red-500 text-xs mt-1">
              {errors.estimationNumber.message}
            </p>
          )}

          <Input
            label="Project Name *"
            {...register("projectName")}
            placeholder="Enter project name"
          />
          {errors.projectName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.projectName.message}
            </p>
          )}
          <div className="space-y-2">

          <h4 className="text-sm font-semibold text-gray-600">Fabricator</h4>
          <Controller
            name="fabricatorId"
            control={control}
            rules={{ required: "Fabricator is required" }}
            render={({ field }) => (
              <Select
              label="Fabricator *"
                name={field.name}
                options={fabricatorOptions}
                value={field.value}
                onChange={(_, value) => field.onChange(value ?? "")}
              />
            )}
          />
          {errors.fabricatorId && (
            <p className="text-red-500 text-xs mt-1">
              {errors.fabricatorId.message}
            </p>
          )}
          </div>
        </div>

        {/* 🔹 Description */}
        <SectionTitle title="Description" />
        <textarea
          className="w-full border rounded-md p-2"
          rows={4}
          placeholder="Enter description..."
          {...register("description")}
        />

        {/* 🔹 Dates */}
        <SectionTitle title="Dates" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Estimate Date *"
            type="date"
            {...register("estimateDate")}
          />
          {errors.estimateDate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.estimateDate.message}
            </p>
          )}
      
        </div>

        {/* 🔹 Status, Tools & RFQ */}
        <SectionTitle title="Details" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
<h4 className="text-sm font-semibold text-gray-600">Status</h4>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                name={field.name}
                options={EstimationStatusOptions}
                value={field.value}
                onChange={(_, value) => field.onChange(value ?? "")}
              />
            )}
          />
            </div>

          <Input label="Tools" {...register("tools")} placeholder="e.g. TEKLA" />

        </div>

        {/* 🔹 Files */}
        <SectionTitle title="Attach Files" />
        <Controller
          name="files"
          control={control}
          render={({ field }) => (
            <MultipleFileUpload
              onFilesChange={(newFiles) => {
                setFiles(newFiles);
                field.onChange(newFiles);
              }}
            />
          )}
        />

        {/* 🔹 Submit */}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Estimation"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEstimation;
