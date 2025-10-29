/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { DepartmentPayload } from "../../../interface";
import Input from "../../fields/input";
import Button from "../../fields/Button";
import Service from "../../../api/Service";


type ManagerOption = {
  label: string;
  value: string;
};

const AddDepartment: React.FC = () => {
  const [staffs, setStaffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentPayload>({
    defaultValues: {
      name: "",
      managerIds: [], // ← start as empty array
    },
  });

  // ── Fetch admins & department managers ──
  const fetchManagers = async () => {
    try {
      setLoading(true);
      const response = await Service.FetchEmployeeByRole("ADMIN");
      const employees = response?.data?.employees || [];

      // Also fetch department managers if needed
      const deptMgrRes = await Service.FetchEmployeeByRole("DEPT_MANAGER");
      const deptMgrs = deptMgrRes?.data?.employees || [];

      setStaffs([...employees, ...deptMgrs]);
    } catch (err) {
      console.error("Failed to fetch managers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  // ── Build options (ADMIN + DEPT_MANAGER) ──
  const managerOptions: ManagerOption[] = React.useMemo(() => {
    return staffs
      .filter((user) => {
        const role = user.role?.toUpperCase();
        return role === "ADMIN" || role === "DEPT_MANAGER";
      })
      .map((user) => ({
        label: `${user.firstName} ${user.lastName}`.trim(),
        value: user.id,
      }));
  }, [staffs]);

  // ── Watch selected IDs (array) ──
  const selectedManagerIDs: string[] = watch("managerIds") || [];

  // ── Toggle selection ──
  const toggleManager = (id: string) => {
    const updated = selectedManagerIDs.includes(id)
      ? selectedManagerIDs.filter((x) => x !== id)
      : [...selectedManagerIDs, id];

    setValue("managerIds", updated, { shouldValidate: true });
  };

  // ── Submit handler ──
  const onSubmit = async (data: DepartmentPayload) => {
    console.log("Submitted:", data);

    try {
      const response = await Service.AddDepartment({
        name: data.name,
        managerIds: data.managerIds, // ← array!
      });
      console.log("Department created:", response);
      // toast.success("Department created!");
    } catch (err: any) {
      console.error("Error:", err);
      // toast.error(err?.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 mt-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-5">
        Add New Department
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading managers...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* ── Department Name ── */}
          <div>
            <Input
              label="Department Name"
              type="text"
              {...register("name", { required: "Department name is required" })}
              placeholder="e.g. Engineering"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* ── Manager Selection (Multi‑Select Checkbox List) ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Manager(s){" "}
              <span className="text-gray-500">(Optional)</span>
            </label>

            {managerOptions.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No admin or department managers available
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {managerOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedManagerIDs.includes(option.value)}
                      onChange={() => toggleManager(option.value)}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-800">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* ── Submit Button ── */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      className="opacity-75"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Department"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddDepartment;
