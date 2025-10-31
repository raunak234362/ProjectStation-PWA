/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/fabricator/EditFabricator.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, X, Check } from "lucide-react";
import type { Fabricator } from "../../../interface";
import Service from "../../../api/Service";
import Input from "../../fields/input";
import Button from "../../fields/Button";

interface EditFabricatorProps {
  fabricatorData: Fabricator;
  onClose: () => void;
  onSuccess?: () => void;
}

type FabricatorFormData = {
  fabName: string;
  website?: string;
  drive?: string;
};

const EditFabricator = ({
  fabricatorData,
  onClose,
  onSuccess,
}: EditFabricatorProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FabricatorFormData>({
    defaultValues: {
      fabName: "",
      website: "",
      drive: "",
    },
  });

  // Pre‑fill form with fabricator data
  useEffect(() => {
    reset({
      fabName: fabricatorData.fabName || "",
      website: fabricatorData.website || "",
      drive: fabricatorData.drive || "",
    });
  }, [fabricatorData, reset]);

  // Submit handler
  const onSubmit = async (data: FabricatorFormData) => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await Service.EditFabricatorByID(
        fabricatorData.id,
        data
      );
      console.log(response);

      onSuccess?.(); // Refresh parent
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update fabricator");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Edit Fabricator</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Fabricator Name */}
          <div>
            <Input
              label="Fabricator Name"
              {...register("fabName")}
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t">
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
