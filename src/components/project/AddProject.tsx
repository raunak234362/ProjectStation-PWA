/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import {
  Building2,
  UserCheck,
  HardHat,
  Wrench,
  Sparkles,
  Zap,
  Layers,
  Users,
} from "lucide-react";

import Input from "../fields/input";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import SectionTitle from "../ui/SectionTitle";
import Service from "../../api/Service";
import ToggleField from "../fields/Toggle";
import type { AddProjectPayload } from "../../interface";
import { addProject } from "../../store/projectSlice";

const AddProject: React.FC = () => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionDesigners, setConnectionDesigners] = useState<any[]>([]);

  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo?.fabricatorData || []
  );
  const departmentDatas = useSelector(
    (state: any) => state.userInfo?.departmentData || []
  );
  const teamDatas = useSelector((state: any) => state.userInfo?.teamData || []);
  const users = useSelector((state: any) => state.userInfo?.staffData || []);
  const rfqData = useSelector((state: any) => state.RFQInfos?.RFQData || []);

  const { register, handleSubmit, control, watch, setValue } =
    useForm<AddProjectPayload>({
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

  useEffect(() => {
    Service.FetchAllConnectionDesigner()
      .then((res) => setConnectionDesigners(res?.data || []))
      .catch(() => toast.error("Failed to load connection designers"));
  }, []);

  const options = {
    rfqs: rfqData.map((r: any) => ({
      label: `${r.projectName} • ${r.fabricator?.fabName}`,
      value: String(r.id),
    })) as { label: string; value: string }[],
    fabricators: fabricators.map((f: any) => ({
      label: f.fabName,
      value: String(f.id),
    })) as { label: string; value: string }[],
    departments: departmentDatas.map((d: any) => ({
      label: d.name,
      value: String(d.id),
    })) as { label: string; value: string }[],
    managers: users.map((u: any) => ({
      label: `${u.firstName} ${u.lastName}`,
      value: String(u.id),
    })) as { label: string; value: string }[],
    teams: teamDatas.map((t: any) => ({
      label: t.name,
      value: String(t.id),
    })) as { label: string; value: string }[],
    connectionDesigners: connectionDesigners.map((c: any) => ({
      label: c.connectionDesignerName || c.name,
      value: String(c.id),
    })) as { label: string; value: string }[],
    tools: [
      { label: "TEKLA", value: "TEKLA" },
      { label: "SDS2", value: "SDS2" },
      { label: "Both (TEKLA + SDS2)", value: "BOTH" },
    ],
  };

  const selectedRfqId = watch("rfqId");
  const selectedRfq = rfqData.find(
    (r: any) => String(r.id) === String(selectedRfqId)
  );

  useEffect(() => {
    if (!selectedRfq) return;

    setValue("name", selectedRfq.projectName || "");
    setValue(
      "projectNumber",
      selectedRfq.projectNumber ||
        `PROJ-${new Date().getFullYear()}-${String(
          rfqData.indexOf(selectedRfq) + 1
        ).padStart(3, "0")}`
    );
    setValue("description", selectedRfq.description || "");
    setValue("fabricatorID", String(selectedRfq.fabricatorId || ""));
    setValue("tools", selectedRfq.tools || "TEKLA");

    setValue("connectionDesign", !!selectedRfq.connectionDesign);
    setValue("miscDesign", !!selectedRfq.miscDesign);
    setValue("customerDesign", !!selectedRfq.customerDesign);
    setValue("detailingMain", !!selectedRfq.detailingMain);
    setValue("detailingMisc", !!selectedRfq.detailingMisc);

    toast.success("RFQ data auto-filled!", {
      icon: <Sparkles className="w-5 h-5" />,
    });
  }, [selectedRfq, setValue, rfqData]);

  const onSubmit = async (data: AddProjectPayload) => {
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

      const res = await Service.AddProject(formData);
      if (res?.data) {
        dispatch(addProject(res.data));
      }
      toast.success("Project launched successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 ">
      <div className="w-full mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-14">
            {/* Link RFQ — Hero Section */}
            <div className="relative ">
              <Controller
                name="rfqId"
                control={control}
                render={({ field }) => (
                  <Select
                    options={options.rfqs}
                    value={
                      options.rfqs.find((o) => o.value === field.value) || null
                    }
                    onChange={(opt) => field.onChange(opt?.value || "")}
                    placeholder="Search RFQ by project name or fabricator..."
                    isClearable
                    isSearchable
                    className="text-gray-700"
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: "white",
                        borderRadius: "16px",
                        padding: "8px",
                      }),
                    }}
                  />
                )}
              />
            </div>

            {/* RFQ Preview */}
            {selectedRfq && (
              <div className="bg-linear-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-8 -mt-6 mb-10 shadow-inner">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-7 h-7 text-emerald-600" />
                  <h3 className="text-2xl font-bold text-emerald-900">
                    RFQ Auto-Filled
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  <div className="bg-white/70 p-4 rounded-xl">
                    <p className="text-gray-700">Project</p>
                    <p className="font-bold text-gray-700 truncate">
                      {selectedRfq.projectName}
                    </p>
                  </div>
                  <div className="bg-white/70 p-4 rounded-xl">
                    <p className="text-gray-700">Fabricator</p>
                    <p className="font-bold">
                      {selectedRfq.fabricator?.fabName}
                    </p>
                  </div>
                  <div className="bg-white/70 p-4 rounded-xl">
                    <p className="text-gray-700">Tool</p>
                    <p className="font-bold text-purple-700">
                      {selectedRfq.tools || "TEKLA"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Project Info */}
            <SectionTitle title="Project Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input
                label="Project Number *"
                placeholder="PROJ-2025-089"
                {...register("projectNumber", { required: "Required" })}
              />
              <Input
                label="Project Name *"
                placeholder="Empire State Tower - Phase II"
                {...register("name", { required: "Required" })}
              />
              <div className="md:col-span-2">
                <Input
                  label="Description *"
                  placeholder="Full structural steel detailing for 40-story commercial building..."
                  {...register("description", { required: "Required" })}
                />
              </div>
            </div>

            {/* Team Assignment */}
            <SectionTitle title="Team & Assignments" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                  <Building2 className="w-5 h-5 text-blue-600" /> Fabricator *
                </label>
                <Controller
                  name="fabricatorID"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      options={options.fabricators}
                      value={options.fabricators.find(
                        (o) => o.value === field.value
                      )}
                      onChange={(o) => field.onChange(o?.value || "")}
                      placeholder="Select..."
                      isSearchable
                    />
                  )}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                  <HardHat className="w-5 h-5 text-amber-600" /> Project Manager
                  *
                </label>
                <Controller
                  name="managerID"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      options={options.managers}
                      value={options.managers.find(
                        (o) => o.value === field.value
                      )}
                      onChange={(o) => field.onChange(o?.value || "")}
                      placeholder="Assign manager"
                      isSearchable
                    />
                  )}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                  <UserCheck className="w-5 h-5 text-green-600" /> Department *
                </label>
                <Controller
                  name="departmentID"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      options={options.departments}
                      value={options.departments.find(
                        (o) => o.value === field.value
                      )}
                      onChange={(o) => field.onChange(o?.value || "")}
                      placeholder="Select dept"
                    />
                  )}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                  <Users className="w-5 h-5 text-purple-600" /> Team
                </label>
                <Controller
                  name="teamID"
                  control={control}
                  render={({ field }) => {
                    const selectedDeptId = watch("departmentID");
                    const filteredTeams = teamDatas
                      .filter(
                        (t: any) =>
                          !selectedDeptId || t.departmentID === selectedDeptId
                      )
                      .map((t: any) => ({
                        label: t.name,
                        value: String(t.id),
                      }));

                    return (
                      <Select
                        options={filteredTeams}
                        value={filteredTeams.find(
                          (o: any) => o.value === field.value
                        )}
                        onChange={(o: any) => field.onChange(o?.value || "")}
                        placeholder="Select team"
                        isClearable
                        isDisabled={!selectedDeptId}
                      />
                    );
                  }}
                />
              </div>
            </div>

            {/* Scope: Connection Design */}
            <div className="bg-linear-to-r from-cyan-50 to-blue-50 rounded-3xl p-2 border-2 border-cyan-200">
              <div className="flex items-center gap-4 mb-8">
                <Layers className="w-5 h-5 text-cyan-600" />
                <div>
                  <h3 className="text-xl font-bold text-cyan-900">
                    Connection Design Scope
                  </h3>
                  <p className="text-cyan-700">
                    Define connection engineering deliverables
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  "connectionDesign::Main Connection Design",
                  "miscDesign::Misc Design",
                  "customerDesign::Customer Design",
                ].map((item) => {
                  const [key, label] = item.split("::");
                  return (
                    <Controller
                      key={key}
                      name={key as keyof AddProjectPayload}
                      control={control}
                      render={({ field }) => (
                        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-cyan-100">
                          <ToggleField
                            label={label}
                            checked={!!field.value}
                            onChange={field.onChange}
                          />
                        </div>
                      )}
                    />
                  );
                })}
              </div>
            </div>

            {/* Scope: Detailing */}
            <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-3xl p-2 border-2 border-amber-200">
              <div className="flex items-center gap-4 mb-8">
                <Wrench className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-xl font-bold text-amber-900">
                    Detailing Scope
                  </h3>
                  <p className="text-amber-700">
                    Shop & erection drawing deliverables
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  "detailingMain::Detailing Main",
                  "detailingMisc::Detailing Misc",
                ].map((item) => {
                  const [key, label] = item.split("::");
                  return (
                    <Controller
                      key={key}
                      name={key as keyof AddProjectPayload}
                      control={control}
                      render={({ field }) => (
                        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-amber-100">
                          <ToggleField
                            label={label}
                            checked={!!field.value}
                            onChange={field.onChange}
                          />
                        </div>
                      )}
                    />
                  );
                })}
              </div>
            </div>

            {/* Tools & Timeline */}
            <SectionTitle title="Tools & Timeline" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                  <Wrench className="w-5 h-5 text-purple-600" /> Tool
                </label>
                <Controller
                  name="tools"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={options.tools}
                      value={options.tools.find((o) => o.value === field.value)}
                      onChange={(o) => field.onChange(o?.value || "TEKLA")}
                    />
                  )}
                />
              </div>
              <Input
                label="Estimated Hours"
                type="number"
                placeholder="1200"
                {...register("estimatedHours")}
              />
              <Input
                label="Start Date *"
                type="date"
                {...register("startDate", { required: "Required" })}
              />
              <Input
                label="Target End Date"
                type="date"
                {...register("endDate")}
              />
            </div>

            {/* Attachments */}
            <SectionTitle title="Project Attachments" />
            <div className="bg-gray-50/70 border-2 border-dashed border-gray-300 rounded-3xl p-10 text-center">
              <Controller
                name="files"
                control={control}
                render={({ field }) => (
                  <MultipleFileUpload
                    onFilesChange={(files) => field.onChange(files)}
                  />
                )}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-6 pt-10 border-t-2 border-gray-200">
              <Button
                className=" flex items-center gap-3"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Creating Project...</>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProject;
