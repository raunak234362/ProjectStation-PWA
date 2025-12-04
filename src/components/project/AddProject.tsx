/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import Input from "../fields/input";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import SectionTitle from "../ui/SectionTitle";
import Service from "../../api/Service";
import Select from "../fields/Select";
import type { AddProjectPayload } from "../../interface";
import ToggleField from "../fields/Toggle";

const AddProject: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Redux selectors
  const fabricators = useSelector((state: any) => state.fabricatorInfo?.fabricatorData || []);
  const departmentDatas = useSelector((state: any) => state?.userInfo?.departmentData || []);
  const teamDatas = useSelector((state: any) => state?.userInfo?.teamData || []);
  const users = useSelector((state: any) => state.userInfo?.staffData || []);
  
  const [connectionDesigners, setConnectionDesigners] = useState<any[]>([]);
console.log(connectionDesigners);

  React.useEffect(() => {
    const fetchConnectionDesigners = async () => {
      const data = await Service.FetchAllConnectionDesigner();
      if (data) setConnectionDesigners(data?.data);
    };
    fetchConnectionDesigners();
  }, []);

  // react-hook-form setup
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddProjectPayload>({
    defaultValues: {
      tools: "TEKLA",
      status: "ACTIVE",
      stage: "PLANNING",
      connectionDesign: false,
      miscDesign: false,
      customerDesign: false,
      detailingMain: false,
      detailingMisc: false,
      mailReminder: false,
      submissionMailReminder: false,
    },
  });

  const onSubmit = async (data: AddProjectPayload) => {
    console.log(data);
    
    try {
      setLoading(true);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => formData.append(key, v));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      await Service.AddProject(formData);
      toast.success("Project added successfully!");
    } catch (error: any) {
      console.error("Error adding project:", error);
      toast.error(error?.response?.data?.message || "Failed to add project");
    } finally {
      setLoading(false);
    }
  };

  // Dropdown options
  const selectOptions = {
    fabricatorOptions: fabricators.map((f: any) => ({ label: f.fabName, value: f.id })),
    departmentOptions: departmentDatas.map((d: any) => ({ label: d.name, value: d.id })),
    managerOptions: users.map((u: any) => ({
      label: `${u.firstName} ${u.lastName}`,
      value: u.id,
    })),
    teamOptions: teamDatas.map((t: any) => ({ label: t.name, value: t.id })),
    connectionDesignerOptions: connectionDesigners?.map((c: any) => ({ label: c.name, value: c.id })),
  };

  return (
    <div className="w-full mx-auto bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Project Info */}
        <SectionTitle title="Project Information" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Project Number *"
            {...register("projectNumber", { required: "Project number is required" })}
          />
          {errors.projectNumber && (
            <p className="text-red-500 text-xs">{errors.projectNumber.message}</p>
          )}

          <Input
            label="Project Name *"
            {...register("name", { required: "Project name is required" })}
          />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}

          <Input label="Description *" {...register("description", { required: "Description is required" })} />
        </div>

        {/* Associations */}
        <SectionTitle title="Associations" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="fabricatorID"
            control={control}
            rules={{ required: "Fabricator is required" }}
            render={({ field }) => (
              <Select
                label="Fabricator"
                options={selectOptions.fabricatorOptions}
                value={field.value}
                onChange={(_, selected) => field.onChange(selected || "")}
              />
            )}
          />
          <Controller
            name="departmentID"
            control={control}
            rules={{ required: "Department is required" }}
            render={({ field }) => (
              <Select
                label="Department"
                options={selectOptions.departmentOptions}
                value={field.value}
                onChange={(_, selected) => field.onChange(selected || "")}
              />
            )}
          />
          <Controller
            name="managerID"
            control={control}
            rules={{ required: "Manager is required" }}
            render={({ field }) => (
              <Select
                label="Manager"
                options={selectOptions.managerOptions}
                value={field.value}
                onChange={(_, selected) => field.onChange(selected || "")}
              />
            )}
          />
          <Controller
            name="teamID"
            control={control}
            render={({ field }) => (
              <Select
                label="Team"
                options={selectOptions.teamOptions}
                value={field.value}
                onChange={(_, selected) => field.onChange(selected || "")}
              />
            )}
          />
          <Input label="RFQ ID" {...register("rfqId")} />
          <Input label="CD Quotation ID" {...register("CDQuataionID")} />
          <Controller
            name="connectionDesignerID"
            control={control}
            render={({ field }) => (
              <Select
                label="Connection Designer"
                options={selectOptions.connectionDesignerOptions}
                value={field.value}
                onChange={(_, selected) => field.onChange(selected || "")}
              />
            )}
          />
        </div>

        {/* Tools & Schedule */}
        <SectionTitle title="Schedule & Tools" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Controller
            name="tools"
            control={control}
            render={({ field }) => (
              <Select
                label="Tools"
                options={[
                  { label: "TEKLA", value: "TEKLA" },
                  { label: "SDS2", value: "SDS2" },
                  { label: "BOTH", value: "BOTH" },
                ]}
                value={field.value}
                onChange={(_, selected) => field.onChange(selected || "")}
              />
            )}
          />

          <Input
            label="Start Date *"
            type="date"
            {...register("startDate", { required: "Start date is required" })}
          />
          <Input
            label="End Date *"
            type="date"
            {...register("endDate", { required: "End date is required" })}
          />
          <Input
            label="Approval Date"
            type="date"
            {...register("approvalDate")}
          />
          <Input
            label="Fabrication Date"
            type="date"
            {...register("fabricationDate")}
          />
        </div>

        {/* Design Scopes */}
        <SectionTitle title="Connection Design Scope" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ToggleField label="Main Design" {...register("connectionDesign")} />
          <ToggleField label="Misc Design" {...register("miscDesign")} />
          <ToggleField label="Customer Design" {...register("customerDesign")} />
          <ToggleField label="Detailing Main" {...register("detailingMain")} />
          <ToggleField label="Detailing Misc" {...register("detailingMisc")} />
        </div>

        {/* Hours Section */}
        <SectionTitle title="Estimation Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input label="Estimated Hours" type="number" {...register("estimatedHours")} />
          <Input label="Modeling Hours" type="number" {...register("modelingHours")} />
          <Input label="Detailing Hours" type="number" {...register("detailingHours")} />
          <Input label="Detail Checking Hours" type="number" {...register("detailCheckingHours")} />
          <Input label="Execution Checking Hours" type="number" {...register("executionCheckingHours")} />
          <Input label="Execution Hours" type="number" {...register("executionHours")} />
          <Input label="Model Checking Hours" type="number" {...register("modelCheckingHours")} />
        </div>

        {/* File Upload */}
        <SectionTitle title="Attachments" />
        <Controller
          name="files"
          control={control}
          render={({ field }) => (
            <MultipleFileUpload onFilesChange={(files) => field.onChange(files)} />
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={() => reset()}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting || loading}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProject;
