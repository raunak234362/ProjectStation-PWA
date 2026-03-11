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
  Save,
  Users,
  Loader2,
} from "lucide-react";

import Input from "../fields/input";
import SectionTitle from "../ui/SectionTitle";
import Service from "../../api/Service";
import ToggleField from "../fields/Toggle";
import type { AddProjectPayload } from "../../interface";
import { updateProject } from "../../store/projectSlice";
import { showDepartment, showTeam, showStaff } from "../../store/userSlice";

interface EditProjectProps {
  projectId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditProject: React.FC<EditProjectProps> = ({
  projectId,
  onCancel,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionDesigners, setConnectionDesigners] = useState<any[]>([]);
  const [wbsTemplates, setWbsTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo?.fabricatorData || [],
  );
  const departmentDatas = useSelector(
    (state: any) => state.userInfo?.departmentData || [],
  );
  const teamDatas = useSelector((state: any) => state.userInfo?.teamData || []);
  const users = useSelector((state: any) => state.userInfo?.staffData || []);

  const { register, handleSubmit, control, watch, reset, formState: { dirtyFields } } =
    useForm<AddProjectPayload>({
      defaultValues: {
        tools: "TEKLA",
        status: "ACTIVE",
        connectionDesign: false,
        miscDesign: false,
        customerDesign: false,
        detailingMain: false,
        detailingMisc: false,
        mailReminder: true,
        submissionMailReminder: true,
      },
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cdRes, projectRes, wbsRes, deptRes, teamRes, staffRes] =
          await Promise.all([
            Service.FetchAllConnectionDesigner(),
            Service.GetProjectById(projectId),
            Service.GetWBSTemplate(),
            departmentDatas.length === 0
              ? Service.AllDepartments()
              : Promise.resolve(null),
            teamDatas.length === 0 ? Service.AllTeam() : Promise.resolve(null),
            users.length === 0
              ? Service.FetchAllEmployee()
              : Promise.resolve(null),
          ]);

        setConnectionDesigners(cdRes?.data || []);
        setWbsTemplates(wbsRes?.data || []);
        if (deptRes) dispatch(showDepartment(deptRes.data || deptRes));
        if (teamRes) dispatch(showTeam(teamRes.data || teamRes));
        if (staffRes) dispatch(showStaff(staffRes.data || staffRes));

        const project = projectRes?.data;
        if (project) {
          const formatDate = (date: any) => date ? new Date(date).toISOString().split("T")[0] : "";

          reset({
            name: project.name,
            projectNumber: project.projectNumber,
            description: project.description,
            fabricatorID: project.fabricatorID,
            managerID: project.managerID,
            departmentID: project.department?.id,
            teamID: project.team?.id,
            tools: project.tools,
            stage: project.stage,
            status: project.status,
            estimatedHours: project.estimatedHours,
            rfqId: project.rfqId,
            CDQuataionID: project.CDQuataionID,
            connectionDesignerID: project.connectionDesignerID,
            detailCheckingHours: project.detailCheckingHours,
            detailingHours: project.detailingHours,
            executionCheckingHours: project.executionCheckingHours,
            executionHours: project.executionHours,
            modelCheckingHours: project.modelCheckingHours,
            modelingHours: project.modelingHours,
            mailReminder: project.mailReminder,
            submissionMailReminder: project.submissionMailReminder,
            approvalDateChangeReason: project.approvalDateChangeReason,
            fabricationDateChangeReason: project.fabricationDateChangeReason,
            startDate: formatDate(project.startDate),
            endDate: formatDate(project.endDate),
            approvalDate: formatDate(project.approvalDate),
            fabricationDate: formatDate(project.fabricationDate),
            connectionDesign: project.connectionDesign,
            miscDesign: project.miscDesign,
            customerDesign: project.customerDesign,
            detailingMain: project.detailingMain,
            detailingMisc: project.detailingMisc,
            wbsTemplateIds: project.projectWbs
              ? project.projectWbs.map((wbs: any) => wbs.templateId).filter(Boolean)
              : [],
          });
        }
      } catch (error) {
        console.error("Failed to load data", error);
        toast.error("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, reset]);

  const options = {
    fabricators: (Array.isArray(fabricators) ? fabricators : []).map(
      (f: any) => ({
        label: f.fabName,
        value: String(f.id),
      }),
    ),
    departments: (Array.isArray(departmentDatas) ? departmentDatas : []).map(
      (d: any) => ({
        label: d.name,
        value: String(d.id),
      }),
    ),
    managers: (Array.isArray(users) ? users : []).map((u: any) => ({
      label: `${u.firstName} ${u.lastName}`,
      value: String(u.id),
    })),
    teams: (Array.isArray(teamDatas) ? teamDatas : []).map((t: any) => ({
      label: t.name,
      value: String(t.id),
    })),
    connectionDesigners: connectionDesigners.map((c: any) => ({
      label: c.connectionDesignerName || c.name,
      value: String(c.id),
    })),
    wbsTemplates: wbsTemplates.map((w: any) => ({
      label: w.name,
      value: String(w.id),
    })),
    tools: [
      { label: "TEKLA", value: "TEKLA" },
      { label: "SDS2", value: "SDS2" },
      { label: "Both (TEKLA + SDS2)", value: "BOTH" },
    ],
    status: [
      { label: "ACTIVE", value: "ACTIVE" },
      { label: "INACTIVE", value: "INACTIVE" },
      { label: "ON HOLD", value: "ONHOLD" },
      { label: "COMPLETE", value: "COMPLETE" },
      { label: "DELAY", value: "DELAY" },
      { label: "ASSIGNED", value: "ASSIGNED" },
    ],
    stage: [
      { label: "IFA - (Issue for Approval)", value: "IFA" },
      { label: "IFC - (Issue for Construction)", value: "IFC" },
      { label: "CO# - (Change Order)", value: "CO#" },
      { label: "RFI - (Request for Information)", value: "RFI" },
      { label: "PLANNING", value: "PLANNING" },
      { label: "IN PROGRESS", value: "IN_PROGRESS" },
      { label: "COMPLETED", value: "COMPLETED" },
    ],
  };

  const onSubmit = async (data: AddProjectPayload) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();

      Object.keys(dirtyFields).forEach((key) => {
        const value = data[key as keyof AddProjectPayload];
        if (value === null || value === undefined) return;
        if (key === "files") return;

        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(`${key}[]`, v));
        } else if (typeof value === "boolean") {
          formData.append(key, value ? "true" : "false");
        } else {
          formData.append(key, String(value));
        }
      });

      const res = await Service.EditProjectById(projectId, formData);
      if (res?.data) {
        dispatch(updateProject(res.data));
      }
      toast.success("Project updated successfully!");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update project");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#6bbd45] mb-4" />
          <div className="text-center font-bold text-gray-700">Loading project details...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border border-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="flex justify-between items-center mb-8 border-b border-black/5 pb-5 sticky top-[-32px] bg-white z-20">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">Edit Project</h2>
            </div>
            <button
              onClick={onCancel}
              className="p-1 bg-red-50 hover:bg-red-100 text-black border border-red-600 hover:text-red-500 rounded-md transition-all"
            >
              CLOSE
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Core Project Info */}
            <div className="space-y-6">
              <SectionTitle title="Core Project Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input
                  label="Project Number"
                  placeholder="PROJ-2025-089"
                  {...register("projectNumber")}
                />
                <Input
                  label="Project Name"
                  placeholder="Empire State Tower - Phase II"
                  {...register("name")}
                />
                <div>
                  <label className="block text-sm font-black text-black uppercase tracking-widest mb-2">Stage</label>
                  <Controller
                    name="stage"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={options.stage}
                        value={options.stage.find((o) => o.value === field.value)}
                        onChange={(o) => field.onChange(o?.value || "IFA")}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-black uppercase tracking-widest mb-2">Status</label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={options.status}
                        value={options.status.find((o) => o.value === field.value)}
                        onChange={(o) => field.onChange(o?.value || "ACTIVE")}
                      />
                    )}
                  />
                </div>
              </div>
            </div>


            {/* Team & Organizational Assignment */}
            <div className="space-y-6">
              <SectionTitle title="Assignments & Organization" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-widest mb-2">
                    <Building2 className="w-4 h-4 text-[#6bbd45]" /> Fabricator
                  </label>
                  <Controller
                    name="fabricatorID"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={options.fabricators}
                        value={options.fabricators.find((o: any) => o.value === field.value)}
                        onChange={(o: any) => field.onChange(o?.value || "")}
                        placeholder="Select fabricator"
                        isSearchable
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-widest mb-2">
                    <HardHat className="w-4 h-4 text-[#6bbd45]" /> Manager
                  </label>
                  <Controller
                    name="managerID"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={options.managers}
                        value={options.managers.find((o: any) => o.value === field.value)}
                        onChange={(o: any) => field.onChange(o?.value || "")}
                        placeholder="Assign manager"
                        isSearchable
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-widest mb-2">
                    <UserCheck className="w-4 h-4 text-[#6bbd45]" /> Department
                  </label>
                  <Controller
                    name="departmentID"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={options.departments}
                        value={options.departments.find((o: any) => o.value === field.value)}
                        onChange={(o: any) => field.onChange(o?.value || "")}
                        placeholder="Department"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-widest mb-2">
                    <Users className="w-4 h-4 text-[#6bbd45]" /> Team
                  </label>
                  <Controller
                    name="teamID"
                    control={control}
                    render={({ field }) => {
                      const selectedDeptId = watch("departmentID");
                      const filteredTeams = (Array.isArray(teamDatas) ? teamDatas : [])
                        .filter((t: any) => !selectedDeptId || String(t.departmentID) === String(selectedDeptId))
                        .map((t: any) => ({ label: t.name, value: String(t.id) }));

                      return (
                        <Select
                          options={filteredTeams}
                          value={filteredTeams.find((o: any) => o.value === field.value)}
                          onChange={(o: any) => field.onChange(o?.value || "")}
                          placeholder="Team"
                          isDisabled={!selectedDeptId}
                        />
                      );
                    }}
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-4">
                  <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-widest mb-2">
                    WBS Templates
                  </label>
                  <Controller
                    name="wbsTemplateIds"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={options.wbsTemplates}
                        value={options.wbsTemplates.filter((o: any) => field.value?.includes(o.value))}
                        onChange={(o: any) => field.onChange(o ? o.map((x: any) => x.value) : [])}
                        isMulti
                        placeholder="Attach WBS templates..."
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Connection Designer Section */}
            <div className="space-y-6">
              <SectionTitle title="Connection Design Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-black text-black uppercase tracking-widest mb-2">Connection Designer</label>
                  <Controller
                    name="connectionDesignerID"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={options.connectionDesigners}
                        value={options.connectionDesigners.find((o: any) => o.value === field.value)}
                        onChange={(o: any) => field.onChange(o?.value || "")}
                        isClearable
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Hours Tracking */}
            <div className="space-y-6">
              <SectionTitle title="Hours Allocation & Tracking" />
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Input label="Estimated Hours" type="number" {...register("estimatedHours")} />
              </div>
            </div>

            {/* Timeline & Milestones */}
            <div className="space-y-6">
              <SectionTitle title="Project Timeline & Deadlines" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Input label="Start Date" type="date" {...register("startDate")} />
                <Input label="End Date" type="date" {...register("endDate")} />
                <Input label="Approval Date" type="date" {...register("approvalDate")} />
                <Input label="Fabrication Date" type="date" {...register("fabricationDate")} />

                <div className="md:col-span-2">
                  <Input label="Approval Date Change Reason" {...register("approvalDateChangeReason")} />
                </div>
                <div className="md:col-span-2">
                  <Input label="Fabrication Date Change Reason" {...register("fabricationDateChangeReason")} />
                </div>
              </div>
            </div>

            {/* Scope Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100 flex flex-col gap-4">
                <h3 className="text-lg font-black text-black uppercase tracking-tight mb-2 border-b border-green-200 pb-2">Design Scope</h3>
                <div className="space-y-3">
                  <Controller name="connectionDesign" control={control} render={({ field }) => <ToggleField label="Main Connection Design" checked={!!field.value} onChange={field.onChange} />} />
                  <Controller name="miscDesign" control={control} render={({ field }) => <ToggleField label="Misc Design" checked={!!field.value} onChange={field.onChange} />} />
                  <Controller name="customerDesign" control={control} render={({ field }) => <ToggleField label="Customer Design" checked={!!field.value} onChange={field.onChange} />} />
                </div>
              </div>
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex flex-col gap-4">
                <h3 className="text-lg font-black text-black uppercase tracking-tight mb-2 border-b border-blue-200 pb-2">Detailing Scope</h3>
                <div className="space-y-3">
                  <Controller name="detailingMain" control={control} render={({ field }) => <ToggleField label="Detailing Main" checked={!!field.value} onChange={field.onChange} />} />
                  <Controller name="detailingMisc" control={control} render={({ field }) => <ToggleField label="Detailing Misc" checked={!!field.value} onChange={field.onChange} />} />
                </div>
              </div>
            </div>

            {/* Tools */}
            <div className="w-full max-w-xs">
              <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-widest mb-2">
                <Wrench className="w-4 h-4 text-[#6bbd45]" /> Detailing Tool
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

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-10  border-black/5   z-20 pb-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-8 py-3 bg-gray-100 text-black border-2 border-black rounded-xl hover:bg-gray-200 transition-all font-black uppercase tracking-wider text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-10 py-3 bg-[#6bbd45]/50 text-black border-2 border-black hover:text-white hover:bg-[#6bbd45] rounded-xl transition-all font-black uppercase tracking-wider text-sm shadow-xl shadow-green-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProject;
