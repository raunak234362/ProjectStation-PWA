/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Button from "../fields/Button";
import Select from "../fields/Select";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import SectionTitle from "../ui/SectionTitle";

import Service from "../../api/Service";
import Input from "../fields/input";

interface AddProjectForm {
  projectNumber: string;
  name: string;
  description: string;
  fabricatorID: string;
  departmentID: string;
  managerID: string;
  teamID: string;
  tools: string;
  startDate: string;
  endDate: string;
  files?: File[];
}

const AddProject: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // Example selectors (replace with actual store structure)
  const fabricators = useSelector((state: any) => state.fabricatorInfo?.fabricatorData || []);
  const departments = useSelector((state: any) => state.departmentInfo?.departmentData || []);
  const teams = useSelector((state: any) => state.teamInfo?.teamData || []);
  const users = useSelector((state: any) => state.userInfo?.staffData || []);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddProjectForm>({
    defaultValues: {
      tools: "TEKLA",
    },
  });

  const onSubmit = async (data: AddProjectForm) => {
    try {
      setLoading(true);

      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value as string);
        }
      });

      if (files.length > 0) {
        files.forEach((file) => formData.append("files", file));
      }

      await Service.AddProject(formData);
      toast.success("Project added successfully!");
      reset();
      setFiles([]);
    } catch (error: any) {
      console.error("Error adding project:", error);
      toast.error(error?.response?.data?.message || "Failed to add project");
    } finally {
      setLoading(false);
    }
  };

  const selectOptions = {
    fabricatorOptions:
      fabricators.map((f: any) => ({ label: f.fabName, value: f.id })) || [],
    departmentOptions:
      departments.map((d: any) => ({ label: d.departmentName, value: d.id })) || [],
    managerOptions:
      users.map((u: any) => ({
        label: `${u.firstName} ${u.lastName}`,
        value: u.id,
      })) || [],
    teamOptions:
      teams.map((t: any) => ({ label: t.name, value: t.id })) || [],
  };

  return (
    <div className="w-full mx-auto bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-8 my-6">
      <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
        Add New Project
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ─────────────── Project Info ─────────────── */}
        <SectionTitle title="Project Information" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Project Number *"
            placeholder="PRJ-001"
            {...register("projectNumber", {
              required: "Project number is required",
            })}
          />
          {errors.projectNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.projectNumber.message}</p>
          )}

          <Input
            label="Project Name *"
            placeholder="Enter project name"
            {...register("name", {
              required: "Project name is required",
            })}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}

          <Input
            label="Description"
            placeholder="Enter project description"
            {...register("description")}
          />
        </div>

        {/* ─────────────── Associations ─────────────── */}
        <SectionTitle title="Associations" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fabricator */}
          <Controller
            name="fabricatorID"
            control={control}
            rules={{ required: "Fabricator is required" }}
            render={({ field }) => (
              <Select
                placeholder="Select Fabricator"
                options={selectOptions.fabricatorOptions}
                value={field.value}
                onChange={(_, val) => field.onChange(val ?? "")}
              />
            )}
          />
          {errors.fabricatorID && (
            <p className="text-red-500 text-xs mt-1">{errors.fabricatorID.message}</p>
          )}

          {/* Department */}
          <Controller
            name="departmentID"
            control={control}
            rules={{ required: "Department is required" }}
            render={({ field }) => (
              <Select
                placeholder="Select Department"
                options={selectOptions.departmentOptions}
                value={field.value}
                onChange={(_, val) => field.onChange(val ?? "")}
              />
            )}
          />
          {errors.departmentID && (
            <p className="text-red-500 text-xs mt-1">{errors.departmentID.message}</p>
          )}

          {/* Manager */}
          <Controller
            name="managerID"
            control={control}
            rules={{ required: "Manager is required" }}
            render={({ field }) => (
              <Select
                placeholder="Select Project Manager"
                options={selectOptions.managerOptions}
                value={field.value}
                onChange={(_, val) => field.onChange(val ?? "")}
              />
            )}
          />
          {errors.managerID && (
            <p className="text-red-500 text-xs mt-1">{errors.managerID.message}</p>
          )}

          {/* Team */}
          <Controller
            name="teamID"
            control={control}
            rules={{ required: "Team is required" }}
            render={({ field }) => (
              <Select
                placeholder="Select Team"
                options={selectOptions.teamOptions}
                value={field.value}
                onChange={(_, val) => field.onChange(val ?? "")}
              />
            )}
          />
          {errors.teamID && (
            <p className="text-red-500 text-xs mt-1">{errors.teamID.message}</p>
          )}
        </div>

        {/* ─────────────── Tools & Dates ─────────────── */}
        <SectionTitle title="Schedule & Tools" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Controller
            name="tools"
            control={control}
            render={({ field }) => (
              <Select
                placeholder="Select Tools"
                options={[
                  { label: "TEKLA", value: "TEKLA" },
                  { label: "SDS2", value: "SDS2" },
                  { label: "BOTH", value: "BOTH" },
                ]}
                value={field.value}
                onChange={(_, val) => field.onChange(val ?? "")}
              />
            )}
          />

          <Input
            label="Start Date *"
            type="date"
            {...register("startDate", { required: "Start Date is required" })}
          />

          <Input
            label="End Date *"
            type="date"
            {...register("endDate", { required: "End Date is required" })}
          />
        </div>

        {/* ─────────────── File Upload ─────────────── */}
        <SectionTitle title="Attachments" />

        <MultipleFileUpload onFilesChange={setFiles} />
        {files.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">{files.length} file(s) attached</p>
        )}

        {/* ─────────────── Actions ─────────────── */}
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
