/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/fabricator/EditFabricator.tsx
import { useEffect, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { Loader2, X, Check, Trash2, Paperclip } from "lucide-react";
import { motion } from "motion/react";
import type { Fabricator, SelectOption } from "../../../interface";
import Service from "../../../api/Service";
import Input from "../../fields/input";
import Button from "../../fields/Button";
import MultipleFileUpload from "../../fields/MultipleFileUpload";
import MultiSelect from "../../fields/MultiSelect";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { incrementModalCount, decrementModalCount } from "../../../store/uiSlice";

// --- File Interfaces (matching your fabricatorData.files structure) ---
interface FabricatorFile {
  id: string;
  filename: string;
  url: string;
  // Add other file properties if needed (e.g., mimeType, size)
}

interface EditFabricatorProps {
  fabricatorData: Fabricator; // Use FabricatorWithFiles for clarity
  onClose: () => void;
  onSuccess?: () => void;
}

type FabricatorFormData = {
  fabName: string;
  website?: string;
  drive?: string;
  fabStage?: "RFQ" | "PRODUCTION";
  accountId?: string;
  SAC?: string;
  wbtFabricatorPointOfContact?: any[];
  fabricatPercentage?: number;
  approvalPercentage?: number;
  paymenTDueDate?: number;
  currencyType?: string;
  // Change files to File[] to match what RHF and MultipleFileUpload handle
  files?: File[] | null;
};

const EditFabricator = ({
  fabricatorData,
  onClose,
  onSuccess,
}: EditFabricatorProps) => {
  const userRole = sessionStorage.getItem("userRole");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [fetchingAccounts, setFetchingAccounts] = useState(false);
  const [wbtContactOptions, setWbtContactOptions] = useState<SelectOption[]>(
    [],
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(incrementModalCount());
    return () => {
      dispatch(decrementModalCount());
    };
  }, [dispatch]);

  // State to manage existing files that the user decides to KEEP
  const [filesToKeep, setFilesToKeep] = useState<FabricatorFile[]>(
    (fabricatorData.files as FabricatorFile[]) || [],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FabricatorFormData>({
    defaultValues: {
      fabName: "",
      website: "",
      drive: "",
      fabStage: undefined,
      accountId: "",
      SAC: "",
      fabricatPercentage: 0,
      approvalPercentage: 0,
      paymenTDueDate: 0,
      currencyType: "",
      files: null, // Initialize new files to null
    },
  });

  // Fetch accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      setFetchingAccounts(true);
      try {
        const response = await Service.GetBankAccounts();
        const data = response?.data || response || [];
        setAccounts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      } finally {
        setFetchingAccounts(false);
      }
    };

    const fetchWBTContacts = async () => {
      try {
        const [admins, sales, managers] = await Promise.all([
          Service.FetchEmployeeByRole("ADMIN"),
          Service.FetchEmployeeByRole("SALES_PERSON"),
          Service.FetchEmployeeByRole("SALES_MANAGER"),
        ]);

        const allContacts = [
          ...(Array.isArray(admins?.data?.employees)
            ? admins.data.employees
            : []),
          ...(Array.isArray(sales?.data?.employees)
            ? sales.data.employees
            : []),
          ...(Array.isArray(managers?.data?.employees)
            ? managers.data.employees
            : []),
        ];

        // Remove duplicates if any
        const uniqueContacts = Array.from(
          new Map(allContacts.map((item: any) => [item.id, item])).values(),
        );

        const options = uniqueContacts.map((u: any) => ({
          label: `${u.firstName} ${u.lastName} (${u.role})`,
          value: u.id,
        }));

        setWbtContactOptions(options);
      } catch (error) {
        console.error("Failed to fetch WBT contacts", error);
      }
    };

    fetchAccounts();
    fetchWBTContacts();
  }, []);

  // Pre‑fill form with fabricator data and initialize filesToKeep
  useEffect(() => {
    reset({
      fabName: fabricatorData.fabName || "",
      website: fabricatorData.website || "",
      drive: fabricatorData.drive || "",
      fabStage: fabricatorData.fabStage,
      accountId: (fabricatorData as any).accountId || "",
      SAC: fabricatorData.SAC || "",
      fabricatPercentage: fabricatorData.fabricatPercentage || 0,
      approvalPercentage: fabricatorData.approvalPercentage || 0,
      paymenTDueDate: fabricatorData.paymenTDueDate || 0,
      currencyType: fabricatorData.currencyType || "",
      wbtFabricatorPointOfContact:
        fabricatorData.wbtFabricatorPointOfContact || [],
      files: null,
    });
    setFilesToKeep((fabricatorData.files as FabricatorFile[]) || []);
  }, [fabricatorData, reset]);

  // Handler to remove an existing file from the 'filesToKeep' list
  const handleRemoveExistingFile = (fileId: string, fileName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the file: ${fileName}? This change will take effect on save.`,
      )
    ) {
      setFilesToKeep((prev) => prev.filter((file) => file.id !== fileId));
      toast.info(`File '${fileName}' marked for deletion.`);
    }
  };

  // Submit handler
  const onSubmit: SubmitHandler<FabricatorFormData> = async (data) => {
    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();

      // 1. Append Text Fields (only if they have values)
      if (data.fabName) formData.append("fabName", data.fabName);
      if (data.website) formData.append("website", data.website);
      if (data.drive) formData.append("drive", data.drive);
      if (data.wbtFabricatorPointOfContact)
        formData.append(
          "wbtFabricatorPointOfContact",
          JSON.stringify(data.wbtFabricatorPointOfContact),
        );
      if (data.fabStage) formData.append("fabStage", data.fabStage);
      if (data.accountId) formData.append("accountId", data.accountId);
      if (data.SAC) formData.append("SAC", data.SAC);
      if (data.fabricatPercentage !== undefined)
        formData.append(
          "fabricatPercentage",
          String(parseFloat(String(data.fabricatPercentage))),
        );
      if (data.approvalPercentage !== undefined)
        formData.append(
          "approvalPercentage",
          String(parseFloat(String(data.approvalPercentage))),
        );
      if (data.paymenTDueDate !== undefined)
        formData.append(
          "paymenTDueDate",
          String(parseFloat(String(data.paymenTDueDate))),
        );
      if (data.currencyType) formData.append("currencyType", data.currencyType);

      // 2. Append IDs of files to KEEP (only if not empty)
      const fileIdsToKeep = filesToKeep.map((file) => file.id);
      if (fileIdsToKeep.length > 0) {
        formData.append("files", JSON.stringify(fileIdsToKeep));
      }

      // 3. Append New Files (only if not empty)
      if (Array.isArray(data.files) && data.files.length > 0) {
        data.files.forEach((file: File) => {
          formData.append("files", file);
        });
      }

      // API Call
      const response = await Service.EditFabricatorByID(
        fabricatorData.id,
        formData,
      );
      console.log(response);

      toast.success("Fabricator updated successfully!");
      onSuccess?.(); // Refresh parent
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update fabricator");
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to update fabricator",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative border border-white/20 dark:border-slate-800"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-10 py-8 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-3xl  text-slate-900 dark:text-white tracking-tight leading-none mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                <Check className="w-6 h-6" />
              </div>
              Edit Engineering Partner
            </h2>
            <p className="text-xs  text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Update global fabricator intelligence and credentials
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-90"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body (Scrollable form) */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-10 py-8 space-y-10 overflow-y-auto flex-1 custom-scrollbar"
        >
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 rounded-2xl text-sm  animate-in slide-in-from-top-2">
              Error: {error}
            </div>
          )}

          {/* Section 1: Identity */}
          <section className="space-y-6">
            <h3 className="text-[10px]  text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              Core Identity & Access
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">
                  Partner Name
                </label>
                <Input
                  label=""
                  {...register("fabName", {
                    required: "Fabricator name is required",
                  })}
                  placeholder="e.g. SteelWorks Global"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-700 transition-all"
                />
                {errors.fabName && (
                  <p className="mt-2 text-[10px]  text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    {errors.fabName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">
                  Partner Stage
                </label>
                <select
                  {...register("fabStage", { required: "Stage is required" })}
                  className="w-full h-[46px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-2 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all shadow-sm  text-slate-800 dark:text-white"
                >
                  <option value="">Select Stage</option>
                  <option value="RFQ">RFQ Analysis</option>
                  <option value="PRODUCTION">Full Production</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-xs text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">
                WBT Point of Contact
              </label>
              <Controller
                name="wbtFabricatorPointOfContact"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    options={wbtContactOptions}
                    label="Select Point of Contact"
                    value={field.value || []}
                    onChange={(_, val) => field.onChange(val)}
                  />
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">
                  Digital Hub (URL)
                </label>
                <Input
                  label=""
                  {...register("website")}
                  type="url"
                  placeholder="https://engineering.hub"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl"
                />
              </div>
              <div>
                <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">
                  Shared Repository (Cloud)
                </label>
                <Input
                  label=""
                  {...register("drive")}
                  type="url"
                  placeholder="https://drive.repository"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Financials & Compliance */}
          {(userRole === "ADMIN" || userRole === "PROJECT_MANAGER_OFFICER") && (
            <section className="space-y-6 pt-10 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-[10px]  text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                Financial Compliance & Policy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">
                    SAC Code
                  </label>
                  <Input
                    label=""
                    {...register("SAC")}
                    placeholder="e.g. 998311"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl"
                  />
                </div>
                <div>
                  <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">
                    Primary Currency
                  </label>
                  <select
                    {...register("currencyType")}
                    className="w-full h-[46px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-2 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all shadow-sm  text-slate-800 dark:text-white"
                  >
                    <option value="">Select Currency</option>
                    <option value="USD">USD (Dollar)</option>
                    <option value="CAD">CAD (Dollar)</option>
                    <option value="INR">INR (Rupee)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">
                    Vault Settlement
                  </label>
                  <select
                    {...register("accountId")}
                    className="w-full h-[46px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-2 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all shadow-sm  text-slate-800 dark:text-white"
                    disabled={fetchingAccounts}
                  >
                    <option value="">Select Account</option>
                    {accounts.map((account) => (
                      <option
                        key={account._id || account.id}
                        value={account._id || account.id}
                      >
                        {account.accountName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">
                    Approval %
                  </label>
                  <Input
                    label=""
                    type="number"
                    {...register("approvalPercentage", { valueAsNumber: true })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl"
                  />
                </div>
                <div>
                  <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">
                    Fabrication %
                  </label>
                  <Input
                    label=""
                    type="number"
                    {...register("fabricatPercentage", { valueAsNumber: true })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl"
                  />
                </div>
                <div>
                  <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">
                    Settlement Cycle
                  </label>
                  <div className="relative">
                    <Input
                      label=""
                      type="number"
                      {...register("paymenTDueDate", { valueAsNumber: true })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px]  text-slate-400 dark:text-slate-500">
                      DAYS
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Section 3: Assets */}
          <section className="space-y-6 pt-10 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-[10px]  text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              Compliance Vault (Files)
            </h3>

            {/* Existing Files */}
            {filesToKeep.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filesToKeep.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 group transition-all hover:bg-white dark:hover:bg-slate-700 hover:shadow-lg hover:shadow-slate-500/5"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-green-500 transition-colors" />
                      <span className="text-xs  text-slate-700 dark:text-white truncate">
                        {file?.filename}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveExistingFile(file.id, file.filename)
                      }
                      className="p-2 bg-white dark:bg-slate-800 rounded-xl text-slate-300 hover:text-rose-600 hover:shadow-sm transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Upload Area */}
            <div className="md:col-span-2">
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
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-10 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 pb-6 mt-10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-8 py-3 text-[10px]  uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all active:scale-95"
            >
              Cancel Edit
            </button>
            <Button
              type="submit"
              disabled={submitting}
              className="px-10 py-3 bg-green-600 dark:bg-green-600 text-white text-[10px]  uppercase tracking-widest rounded-2xl shadow-xl shadow-green-100 dark:shadow-none transition-all active:scale-95 flex items-center gap-3 border-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Intel...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Commit Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditFabricator;
