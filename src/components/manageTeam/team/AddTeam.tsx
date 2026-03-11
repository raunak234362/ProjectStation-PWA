/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import type { TeamPayload } from "../../../interface";
import Button from "../../fields/Button";
import Input from "../../fields/input";
import { useEffect, useMemo, useState } from "react";
import Service from "../../../api/Service";
import Select from "../../fields/Select";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

type ManagerOption = {
  label: string;
  value: string;
};

const AddTeam = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeamPayload>();

  const [loading, setLoading] = useState(true);
  const [staffs, setStaffs] = useState<any[]>([]);

  const departments = useSelector(
    (state: any) => state.userInfo.departmentData || [],
  );

  // ── Safely fetch managers (no errors shown) ──
  const fetchManagers = async () => {
    try {
      setLoading(true);

      const rolesToFetch = [
        "ADMIN",
        "DEPT_MANAGER",
        "PROJECT_MANAGER",
        "PROJECT_MANAGER_OFFICER",
      ];

      const promises = rolesToFetch.map((role) =>
        Service.FetchEmployeeByRole(role).catch(() => ({
          data: { employees: [] },
        })),
      );

      const responses = await Promise.all(promises);
      const allStaffs = responses
        .flatMap((res) => res?.data?.employees || [])
        .filter(Boolean);

      setStaffs(allStaffs);
    } catch (err) {
      console.warn("Managers not available (this is okay)", err);
      setStaffs([]); // Silent fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  // ── Build manager options safely ──
  const managerOptions: ManagerOption[] = useMemo(() => {
    if (!Array.isArray(staffs) || staffs.length === 0) {
      return [{ label: "No managers available", value: "" }];
    }

    return staffs
      .filter((user) => {
        const role = user.role?.toUpperCase();
        return [
          "ADMIN",
          "DEPT_MANAGER",
          "PROJECT_MANAGER",
          "PROJECT_MANAGER_OFFICER",
          "TEAM_LEAD",
        ].includes(role);
      })
      .map((user) => ({
        label:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          "Unnamed Manager",
        value: user.id || "",
      }))
      .filter((opt) => opt.value);
  }, [staffs]);

  // ── Department options (safe) ──
  const departmentOptions = useMemo(() => {
    if (!Array.isArray(departments) || departments.length === 0) {
      return [{ label: "No departments found", value: "" }];
    }
    return departments.map((dept: any) => ({
      label: dept.name || "Unnamed Dept",
      value: dept.id || "",
    }));
  }, [departments]);

  // ── Form submit ──
  const addTeam = async (data: TeamPayload) => {
    if (!data.managerID || !data.departmentID) {
      toast.warning("Please select a manager and department");
      return;
    }

    try {
      await Service.AddTeam(data);
      toast.success("Team created successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create team");
    }
  };

  // ── Early loading UI ──
  if (loading) {
    return (
      <div className="w-full mx-auto bg-white rounded-[2.5rem] shadow-soft p-20 border border-black/5 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-black/5 border-t-black"></div>
          <span className="text-black font-black uppercase tracking-widest text-[10px]">Loading team setup...</span>
        </div>
      </div>
    );
  }

  const hasManagers = managerOptions.some((opt) => opt.value);
  const hasDepartments = departmentOptions.some((opt) => opt.value);

  return (
    <div className="w-full bg-white rounded-[2.5rem] p-6 sm:p-10 border border-black/5">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black text-black uppercase tracking-tight">
          Create New Team
        </h2>
   
      </div>

      <form onSubmit={handleSubmit(addTeam)} className="max-w-2xl mx-auto space-y-8">
        {/* Team Name */}
        <div className="space-y-2">
          <Input
            label="Team Name"
            type="text"
            placeholder="e.g. Alpha Squad"
            {...register("name", { required: "Team name is required" })}
            className="w-full font-bold uppercase tracking-wide placeholder:font-normal placeholder:lowercase"
          />
          {errors.name && (
            <p className="text-red-500 text-[10px] font-black uppercase ml-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Manager Select */}
          <div className="space-y-2">
            <Select
              label="Team Manager"
              placeholder={
                hasManagers ? "Choose a manager" : "No managers available"
              }
              options={managerOptions}
              {...register("managerID")}
              onChange={(_, value) => setValue("managerID", value as string)}
            />
            {!hasManagers && (
              <p className="text-amber-600 font-bold text-[10px] uppercase tracking-widest mt-1 ml-1">
                Managers will appear once added.
              </p>
            )}
          </div>

          {/* Department Select */}
          <div className="space-y-2">
            <Select
              label="Department"
              placeholder={
                hasDepartments ? "Choose a department" : "No departments found"
              }
              options={departmentOptions}
              {...register("departmentID")}
              onChange={(_, value) => setValue("departmentID", value as string)}
            />
            {!hasDepartments && (
              <p className="text-amber-600 font-bold text-[10px] uppercase tracking-widest mt-1 ml-1">
                Create departments first.
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-black/5">
          <Button
            type="submit"
            disabled={isSubmitting || !hasManagers || !hasDepartments}
            className={`w-full px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-soft border ${isSubmitting || !hasManagers || !hasDepartments
                ? "bg-gray-100 text-black/20 border-black/5 cursor-not-allowed"
                : "bg-green-100/80 text-black border-black hover:bg-green-200/80 active:scale-95"
              }`}
          >
            {isSubmitting ? "Processing..." : "Create Team"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTeam;
