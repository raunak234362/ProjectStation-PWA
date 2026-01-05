/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/fabricator/EditFabricator.tsx
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2, X, Check, Trash2, Paperclip } from "lucide-react"; // Added Trash2, Paperclip
import type { Fabricator } from "../../../interface";
import Service from "../../../api/Service";
import Input from "../../fields/input";
import Button from "../../fields/Button";
import MultipleFileUpload from "../../fields/MultipleFileUpload"; // Component for new file selection
import { toast } from "react-toastify"; // Assume toast is available

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
  accountId?: string;
  // Change files to File[] to match what RHF and MultipleFileUpload handle
  files?: File[] | null;
};

const EditFabricator = ({
  fabricatorData,
  onClose,
  onSuccess,
}: EditFabricatorProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [fetchingAccounts, setFetchingAccounts] = useState(false);

  // State to manage existing files that the user decides to KEEP
  const [filesToKeep, setFilesToKeep] = useState<FabricatorFile[]>(
    (fabricatorData.files as FabricatorFile[]) || []
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
      accountId: "",
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
    fetchAccounts();
  }, []);

  // Pre‑fill form with fabricator data and initialize filesToKeep
  useEffect(() => {
    reset({
      fabName: fabricatorData.fabName || "",
      website: fabricatorData.website || "",
      drive: fabricatorData.drive || "",
      accountId: (fabricatorData as any).accountId || "",
      files: null,
    });
    setFilesToKeep((fabricatorData.files as FabricatorFile[]) || []);
  }, [fabricatorData, reset]);

  // Handler to remove an existing file from the 'filesToKeep' list
  const handleRemoveExistingFile = (fileId: string, fileName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the file: ${fileName}? This change will take effect on save.`
      )
    ) {
      setFilesToKeep((prev) => prev.filter((file) => file.id !== fileId));
      toast.info(`File '${fileName}' marked for deletion.`);
    }
  };

  // Submit handler
  const onSubmit = async (data: FabricatorFormData) => {
    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();

      // 1. Append Text Fields (only if they have values)
      if (data.fabName) formData.append("fabName", data.fabName);
      if (data.website) formData.append("website", data.website);
      if (data.drive) formData.append("drive", data.drive);
      if (data.accountId) formData.append("accountId", data.accountId);

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
        formData
      );
      console.log(response);

      toast.success("Fabricator updated successfully!");
      onSuccess?.(); // Refresh parent
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update fabricator");
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to update fabricator"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-gray-50 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Edit Fabricator</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Scrollable form) */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-5 space-y-5 overflow-y-auto flex-1"
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Fabricator Name */}
          <div>
            <Input
              label="Fabricator Name"
              {...register("fabName", {
                required: "Fabricator name is required",
              })}
              placeholder="e.g. SteelWorks Inc."
              className="w-full"
            />
            {errors.fabName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.fabName.message}
              </p>
            )}
          </div>

          {/* Website */}
          <div>
            <Input
              label="Website"
              {...register("website", {
                pattern: {
                  value:
                    /^$|^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i,
                  message: "Please enter a valid URL",
                },
              })}
              type="url"
              placeholder="https://example.com"
              className="w-full"
            />
            {errors.website && (
              <p className="mt-1 text-xs text-red-600">
                {errors.website.message}
              </p>
            )}
          </div>

          {/* Drive Link */}
          <div>
            <Input
              label="Drive Link"
              {...register("drive", {
                pattern: {
                  value:
                    /^$|^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i,
                  message: "Please enter a valid URL",
                },
              })}
              type="url"
              placeholder="https://drive.google.com/..."
              className="w-full"
            />
            {errors.drive && (
              <p className="mt-1 text-xs text-red-600">
                {errors.drive.message}
              </p>
            )}
          </div>

          {/* Bank Account Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Account
            </label>
            <select
              {...register("accountId")}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-white"
              disabled={fetchingAccounts}
            >
              <option value="">-- Select Bank Account --</option>
              {accounts.map((account) => (
                <option
                  key={account._id || account.id}
                  value={account._id || account.id}
                >
                  {account.accountName} ({account.accountNumber})
                </option>
              ))}
            </select>
          </div>

          {/* --- Existing Files Display/Deletion --- */}
          {filesToKeep.length > 0 && (
            <div className="p-3 border rounded-lg bg-gray-50">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Existing Files
              </p>
              <ul className="space-y-2">
                {filesToKeep.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between p-2 border bg-white rounded-md"
                  >
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline text-sm truncate mr-4"
                    >
                      <Paperclip className="w-4 h-4 mr-2 shrink-0 text-gray-500" />
                      {file?.filename}
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveExistingFile(file.id, file.filename)
                      }
                      className="text-red-500 hover:text-red-700 p-1 rounded transition"
                      aria-label={`Delete existing file ${file.filename}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* New File Upload (via Controller and MultipleFileUpload) */}
          <div className="md:col-span-2">
            <Controller
              name="files"
              control={control}
              render={({ field }) => (
                <MultipleFileUpload
                  // Assuming MultipleFileUpload takes an onFilesChange prop
                  onFilesChange={(files) => {
                    // Update RHF state with the new File[]
                    field.onChange(files);
                  }}
                  // You might need to pass the existing files here if MultipleFileUpload handles both
                  // For this structure, we're assuming it only handles *new* selections.
                  // existingFiles={filesToKeep}
                />
              )}
            />
            {errors.files && (
              <p className="text-red-500 text-xs mt-1">
                {String(errors.files.message)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t flex-shrink-0">
            <Button type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-teal-600 text-white hover:bg-teal-700 flex items-center gap-2 disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFabricator;
