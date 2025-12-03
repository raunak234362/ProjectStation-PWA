/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Select from "react-select";

import Input from "../fields/input";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import SectionTitle from "../ui/SectionTitle";
import Service from "../../api/Service";
import ToggleField from "../fields/Toggle";
import type { AddProjectPayload } from "../../interface";

const AddProject: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionDesigners, setConnectionDesigners] = useState<any[]>([]);

  // Redux data
  const fabricators = useSelector((state: any) => state.fabricatorInfo?.fabricatorData || []);
  const departmentDatas = useSelector((state: any) => state.userInfo?.departmentData || []);
  const teamDatas = useSelector((state: any) => state.userInfo?.teamData || []);
  const users = useSelector((state: any) => state.userInfo?.staffData || []);
  const rfqData = useSelector((state: any) => state.RFQInfos?.RFQData || []);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddProjectPayload>({
    defaultValues: {
      tools: "TEKLA",
      connectionDesign: false,
      miscDesign: false,
      customerDesign: false,
      detailingMain: false,
      detailingMisc: false,
      files: [],
    },
  });

  // Fetch Connection Designers
  useEffect(() => {
    Service.FetchAllConnectionDesigner()
      .then((res) => setConnectionDesigners(res?.data || []))
      .catch(() => toast.error("Failed to load connection designers"));
  }, []);

  // Options for react-select
  const options = {
    fabricators: fabricators.map((f: any) => ({ label: f.fabName, value: String(f.id) })),
    departments: departmentDatas.map((d: any) => ({ label: d.name, value: String(d.id) })),
    managers: users.map((u: any) => ({ label: `${u.firstName} ${u.lastName}`, value: String(u.id) })),
    teams: teamDatas.map((t: any) => ({ label: t.name, value: String(t.id) })),
    connectionDesigners: connectionDesigners.map((c: any) => ({
      label: c.connectionDesignerName || c.name,
      value: String(c.id),
    })),
    rfqs: rfqData.map((rfq: any) => ({ label: rfq.projectName, value: String(rfq.id) })),
    tools: [
      { label: "TEKLA", value: "TEKLA" },
      { label: "SDS2", value: "SDS2" },
      { label: "BOTH", value: "BOTH" },
    ],
  };

  const onSubmit = async (data: AddProjectPayload) => {
    console.log("Form Submitted:", data); // You will see this!

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        if (key === "files" && Array.isArray(value)) {
          value.forEach((file) => formData.append("files", file));
        } else if (typeof value === "boolean") {
          formData.append(key, value ? "true" : "false");
        } else {
          formData.append(key, String(value));
        }
      });
      
      formData.append("status", "ACTIVE");
      formData.append("stage", "IFA");

      await Service.AddProject(formData);
      toast.success("Project created successfully!");
      reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-10 my-10">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">Create New Project</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">

        {/* Project Info */}
        <SectionTitle title="Project Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Input
              label="Project Number *"
              placeholder="e.g. PROJ-2025-001"
              {...register("projectNumber", { required: "Project number is required" })}
            />
            {errors.projectNumber && <p className="text-red-500 text-sm mt-1">{errors.projectNumber.message}</p>}
          </div>

          <div>
            <Input
              label="Project Name *"
              placeholder="Enter full project name"
              {...register("name", { required: "Project name is required" })}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div className="md:col-span-2">
            <Input
              label="Description *"
              placeholder="Brief description of the project scope..."
              {...register("description", { required: "Description is required" })}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>
        </div>

        {/* Associations */}
        <SectionTitle title="Project Associations" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fabricator *</label>
            <Controller
              name="fabricatorID"
              control={control}
              rules={{ required: "Fabricator is required" }}
              render={({ field }) => (
                <Select
                  options={options.fabricators}
                  value={options.fabricators.find((o: any) => o.value === field.value) || null}
                  onChange={(opt) => field.onChange(opt?.value || "")}
                  placeholder="Select fabricator..."
                  isSearchable
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              )}
            />
            {errors.fabricatorID && <p className="text-red-500 text-sm mt-1">{errors.fabricatorID.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
            <Controller
              name="departmentID"
              control={control}
              rules={{ required: "Department is required" }}
              render={({ field }) => (
                <Select
                  options={options.departments}
                  value={options.departments.find((o: any) => o.value === field.value) || null}
                  onChange={(opt) => field.onChange(opt?.value || "")}
                  placeholder="Select department..."
                  isSearchable
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Manager *</label>
            <Controller
              name="managerID"
              control={control}
              rules={{ required: "Manager is required" }}
              render={({ field }) => (
                <Select
                  options={options.managers}
                  value={options.managers.find((o: any) => o.value === field.value) || null}
                  onChange={(opt) => field.onChange(opt?.value || "")}
                  placeholder="Select manager..."
                  isSearchable
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
            <Controller
              name="teamID"
              control={control}
              render={({ field }) => (
                <Select
                  options={options.teams}
                  value={options.teams.find((o: any) => o.value === field.value) || null}
                  onChange={(opt) => field.onChange(opt?.value || "")}
                  placeholder="Select team (optional)"
                  isClearable
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Linked RFQ</label>
            <Controller
              name="rfqId"
              control={control}
              render={({ field }) => (
                <Select
                  options={options.rfqs}
                  value={options.rfqs.find((o: any) => o.value === field.value) || null}
                  onChange={(opt) => field.onChange(opt?.value || "")}
                  placeholder="Link to RFQ (optional)"
                  isClearable
                  isSearchable
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Connection Designer</label>
            <Controller
              name="connectionDesignerID"
              control={control}
              render={({ field }) => (
                <Select
                  options={options.connectionDesigners}
                  value={options.connectionDesigners.find((o: any) => o.value === field.value) || null}
                  onChange={(opt) => field.onChange(opt?.value || "")}
                  placeholder="Select designer"
                  isClearable
                  isLoading={connectionDesigners.length === 0}
                />
              )}
            />
          </div>
        </div>

        {/* Schedule & Tools */}
        <SectionTitle title="Schedule & Tools" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Modeling Tool</label>
            <Controller
              name="tools"
              control={control}
              render={({ field }) => (
                <Select
                  options={options.tools}
                  value={options.tools.find((o) => o.value === field.value) || options.tools[0]}
                  onChange={(opt) => field.onChange(opt?.value || "TEKLA")}
                />
              )}
            />
          </div>

          <Input label="Start Date *" type="date" {...register("startDate", { required: "Required" })} />
          <Input label="End Date *" type="date" {...register("endDate", { required: "Required" })} />
          <Input label="Approval Date" type="date" {...register("approvalDate")} />
        </div>

        {/* Design Scope */}
        <SectionTitle title="Design Scope" />
        <div className="bg-gray-50 p-6 rounded-xl space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              { key: "connectionDesign", label: "Main Connection Design" },
              { key: "miscDesign", label: "Misc Design" },
              { key: "customerDesign", label: "Customer Design" },
              { key: "detailingMain", label: "Detailing Main" },
              { key: "detailingMisc", label: "Detailing Misc" },
            ].map((item) => (
              <Controller
                key={item.key}
                name={item.key as keyof AddProjectPayload}
                control={control}
                render={({ field }) => (
                  <ToggleField
                    label={item.label}
                    checked={!!field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            ))}
          </div>
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

        {/* Submit */}
        <div className="flex justify-end gap-4 pt-10 border-t-2 border-gray-200">
          <Button type="button" onClick={() => reset()}>
            Reset Form
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating Project..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProject;