import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

import Input from "../fields/input";
import Select from "../fields/Select";
import Button from "../fields/Button";
import SectionTitle from "../ui/SectionTitle";
import Service from "../../api/Service";
import type { Fabricator, EstimationPayload } from "../../interface";
import RichTextEditor from "../fields/RichTextEditor";

const EstimationStatusOptions = [
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Draft", value: "DRAFT" },
];

interface EditEstimationProps {
  id: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditEstimation: React.FC<EditEstimationProps> = ({
  id,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(true);
  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo?.fabricatorData || []
  ) as Fabricator[];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EstimationPayload>();

  useEffect(() => {
    const fetchEstimation = async () => {
      try {
        setLoading(true);
        const response = await Service.GetEstimationById(id);
        if (response?.data) {
          const data = response.data;
          reset({
            estimationNumber: data.estimationNumber,
            projectName: data.projectName,
            fabricatorId: String(data.fabricatorId || ""),
            description: data.description,
            estimateDate: data.estimateDate
              ? String(data.estimateDate).split("T")[0]
              : "",
            tools: data.tools,
            status: data.status,
          });
        }
      } catch (error) {
        console.error("Error fetching estimation:", error);
        toast.error("Failed to load estimation details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEstimation();
    }
  }, [id, reset]);

  const fabricatorOptions = fabricators.map((fab) => ({
    label: fab.fabName,
    value: String(fab.id),
  }));

  const onSubmit = async (data: EstimationPayload) => {
    try {
      const payload = {
        ...data,
        estimateDate: data.estimateDate
          ? new Date(data.estimateDate).toISOString()
          : null,
      };

      await Service.UpdateEstimationById(id, payload);
      toast.success("Estimation updated successfully!");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update estimation");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <span className="ml-3 text-gray-600">Loading estimation data...</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-800">Edit Estimation</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8">
          <form
            id="edit-estimation-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {/* Estimation Details */}
            <SectionTitle title="Estimation Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Estimation Number *"
                {...register("estimationNumber", { required: "Required" })}
                placeholder="e.g. EST-2025-089"
              />
              {errors.estimationNumber && (
                <p className="text-red-500 text-xs">
                  {errors.estimationNumber.message}
                </p>
              )}

              <Input
                label="Project Name"
                {...register("projectName")}
                placeholder="Project Name"
              />
            </div>

            <Controller
              name="fabricatorId"
              control={control}
              rules={{ required: "Fabricator is required" }}
              render={({ field }) => (
                <Select
                  label="Fabricator *"
                  options={fabricatorOptions}
                  value={field.value}
                  onChange={(_, val) => field.onChange(val ?? "")}
                />
              )}
            />
            {errors.fabricatorId && (
              <p className="text-red-500 text-xs">
                {errors.fabricatorId.message}
              </p>
            )}

            <SectionTitle title="Description" />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Project scope, special requirements..."
                />
              )}
            />

            <SectionTitle title="Timeline & Tools" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Estimate Date *"
                type="date"
                {...register("estimateDate", { required: "Required" })}
              />
              <Input
                label="Tools / Software"
                {...register("tools")}
                placeholder="TEKLA, SDS/2, AutoCAD..."
              />
            </div>

            <SectionTitle title="Status" />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  options={EstimationStatusOptions}
                  value={field.value || "PENDING"}
                  onChange={(_, val) => field.onChange(val ?? "PENDING")}
                />
              )}
            />
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            form="edit-estimation-form"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Estimation"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditEstimation;
