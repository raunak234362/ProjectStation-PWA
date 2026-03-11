/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import type { Department, DepartmentPayload } from "../../../interface";
import Service from "../../../api/Service";
import { AlertCircle, Loader2, Pencil, X, Check } from "lucide-react";
import Button from "../../fields/Button";
import Input from "../../fields/input";
import { formatDate } from "../../../utils/dateUtils";

interface GetDepartmentByIdProps {
  id: string;
}

type ManagerOption = {
  label: string;
  value: string;
};

const GetDepartmentById = ({ id }: GetDepartmentByIdProps) => {
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Edit state ──
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [selectedManagerIDs, setSelectedManagerIDs] = useState<string[]>([]);
  const [managerOptions, setManagerOptions] = useState<ManagerOption[]>([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchDepartment = async () => {
    if (!id) {
      setError("Invalid department ID");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await Service.FetchDepartmentByID(id);
      console.log(response);
      setDepartment(response?.data || null);
    } catch (err) {
      setError("Failed to load department details");
      console.error("Error fetching department:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartment();
  }, [id]);

  // ── Fetch managers when edit opens ──
  const openEdit = async () => {
    setIsEditing(true);
    setSaveError(null);

    // Pre-fill name
    setEditName(department?.name || "");

    // Pre-fill manager IDs from the current display data
    const currentManagers = department?.managerIds;
    const currentIds: string[] = [];
    if (Array.isArray(currentManagers)) {
      currentManagers.forEach((m: any) => {
        if (typeof m === "string") currentIds.push(m);
        else if (m?.id) currentIds.push(m.id);
      });
    }
    setSelectedManagerIDs(currentIds);

    // Fetch manager options
    if (managerOptions.length === 0) {
      setManagersLoading(true);
      try {
        const [adminRes, deptMgrRes, pmoRes] = await Promise.all([
          Service.FetchEmployeeByRole("ADMIN"),
          Service.FetchEmployeeByRole("DEPT_MANAGER"),
          Service.FetchEmployeeByRole("PROJECT_MANAGER_OFFICER"),
        ]);
        const all = [
          ...(adminRes?.data?.employees || []),
          ...(deptMgrRes?.data?.employees || []),
          ...(pmoRes?.data?.employees || []),
        ];
        setManagerOptions(
          all.map((u: any) => ({
            label: `${u.firstName} ${u.lastName}`.trim(),
            value: u.id,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch managers:", err);
      } finally {
        setManagersLoading(false);
      }
    }
  };

  const toggleManager = (id: string) => {
    setSelectedManagerIDs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      setSaveError("Department name is required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload: DepartmentPayload = {
        name: editName.trim(),
        managerIds: selectedManagerIDs,
      };
      await Service.EditDepartment(id, payload);
      setIsEditing(false);
      await fetchDepartment(); // refresh
    } catch (err: any) {
      setSaveError(
        err?.response?.data?.message || "Failed to update department."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-700">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading department details...
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error || "Department not found"}
      </div>
    );
  }

  const managers = department.managerIds || [];

  return (
    <div className="bg-gray-50/50 p-10 rounded-3xl border border-black/5 shadow-inner">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-black/5 pb-4">
        <h3 className="text-2xl font-black text-black uppercase tracking-tight">
          {department.name}
        </h3>
      </div>

      {!isEditing ? (
        /* ── View Mode ── */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-sm">
            {/* Left Column */}
            <div className="space-y-4">
              <InfoRow label="Department Name" value={department.name} />
              <InfoRow label="Created" value={formatDate(department?.createdAt)} />
              <InfoRow label="Updated" value={formatDate(department?.updatedAt)} />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex justify-between items-center py-1">
                <span className="text-black/40 font-black uppercase tracking-[0.15em] text-[10px]">
                  Managers
                </span>
                <div className="text-black font-black text-sm tracking-tight text-right max-w-[200px]">
                  {Array.isArray(managers) && managers?.length > 0
                    ? managers
                      .map(
                        (m: {
                          firstName?: string;
                          middleName?: string;
                          lastName?: string;
                        }) =>
                          `${m.firstName || ""} ${m.middleName || ""} ${m.lastName || ""
                            }`
                            .replace(/\s+/g, " ")
                            .trim()
                      )
                      .join(", ")
                    : "No Managers Assigned"}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-black/5">
            <Button
              onClick={openEdit}
              className="flex items-center gap-2 px-8 py-3 bg-green-100/80 border border-black rounded-2xl text-black font-black text-xs uppercase tracking-widest hover:bg-green-200/80 transition-all shadow-sm"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Department
            </Button>
            <Button className="flex items-center gap-2 px-8 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all shadow-sm">
              Archive Department
            </Button>
          </div>
        </>
      ) : (
        /* ── Edit Mode ── */
        <div className="space-y-6">
          {/* Department Name */}
          <div className="space-y-2">
            <Input
              label="Department Name"
              type="text"
              value={editName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditName(e.target.value)
              }
              placeholder="e.g. Engineering"
              className="w-full font-bold uppercase tracking-wide placeholder:font-normal placeholder:lowercase"
            />
            {saveError && !editName.trim() && (
              <p className="text-red-500 text-[10px] font-black uppercase ml-1">
                {saveError}
              </p>
            )}
          </div>

          {/* Manager Selection */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-black uppercase tracking-[0.15em] ml-1">
              Select Manager(s){" "}
              <span className="text-black/20">(Optional)</span>
            </label>

            {managersLoading ? (
              <div className="flex items-center gap-2 py-4 text-black/40 text-xs font-bold">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading managers...
              </div>
            ) : managerOptions.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-black/10">
                <p className="text-xs text-black/40 font-bold italic">
                  No admin or department managers available
                </p>
              </div>
            ) : (
              <div className="space-y-1 max-h-56 overflow-y-auto border border-black/5 rounded-2xl p-4 bg-gray-50/50 custom-scrollbar">
                {managerOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-4 p-3 hover:bg-white rounded-xl cursor-pointer transition-all group border border-transparent hover:border-black/5 hover:shadow-sm"
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedManagerIDs.includes(option.value)}
                        onChange={() => toggleManager(option.value)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-black/10 transition-all checked:bg-black"
                      />
                      <svg
                        className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-black group-hover:text-black transition-colors uppercase tracking-tight">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Save error */}
          {saveError && editName.trim() && (
            <p className="text-red-500 text-[10px] font-black uppercase">
              {saveError}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-black/5">
            <Button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm border ${saving
                  ? "bg-gray-100 text-black/20 border-black/5 cursor-not-allowed"
                  : "bg-green-100/80 border-black text-black hover:bg-green-200/80 active:scale-95"
                }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setSaveError(null);
              }}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-white border border-black/10 rounded-2xl text-black/60 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable info row
const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-black/40 font-black uppercase tracking-[0.15em] text-[10px]">
      {label}
    </span>
    <span className="text-black font-black text-sm tracking-tight">{value}</span>
  </div>
);

export default GetDepartmentById;
