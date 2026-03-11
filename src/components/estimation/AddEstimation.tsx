import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import Input from "../fields/input";
import Select from "../fields/Select";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import Service from "../../api/Service";
import { setRFQData, addEstimation } from "../../store/rfqSlice";
import type { RFQItem, Fabricator } from "../../interface";
import RichTextEditor from "../fields/RichTextEditor";

const EstimationStatusOptions = [
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Approved", value: "APPROVED" },
];

interface AddEstimationProps {
  initialRfqId?: string | null;
  onSuccess?: () => void;
}

interface EstimationFormData {
  rfqId: string;
  estimationNumber: string;
  projectName: string;
  fabricatorId: string;
  description: string;
  estimateDate: string;
  tools: string;
  status: string;
}

const AddEstimation: React.FC<AddEstimationProps> = ({
  initialRfqId = null,
  onSuccess = () => { },
}) => {
  const dispatch = useDispatch();
  const [files, setFiles] = useState<File[]>([]);

  const rfqData = useSelector(
    (state: any) => state.RFQInfos.RFQData || [],
  ) as RFQItem[];
  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo?.fabricatorData || [],
  ) as Fabricator[];

  const userType = sessionStorage.getItem("userRole");

  useEffect(() => {
    const fetchRFQs = async () => {
      if (rfqData.length === 0) {
        try {
          let rfqDetail;
          if (userType === "CLIENT" || userType === "CLIENT_ADMIN") {
            rfqDetail = await Service.RfqSent();
          } else {
            rfqDetail = await Service.RFQRecieved();
          }
          if (rfqDetail?.data) {
            dispatch(setRFQData(rfqDetail.data));
          }
        } catch (error) {
          console.error("Error fetching RFQs:", error);
        }
      }
    };
    fetchRFQs();
  }, [dispatch, rfqData.length, userType]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EstimationFormData>({
    defaultValues: {
      status: "PENDING",
    },
  });

  const selectedRfqId = watch("rfqId");

  // Auto-fill logic — works for BOTH initialRfqId and manual selection
  useEffect(() => {
    if (!selectedRfqId || rfqData.length === 0) return;

    const rfq = rfqData.find((r) => String(r.id) === String(selectedRfqId));
    if (!rfq) return;

    // Auto-fill all fields from selected RFQ
    setValue("projectName", rfq.projectName || "");
    setValue("description", rfq.description || "");
    // @ts-ignore
    setValue("fabricatorId", String(rfq.fabricatorId || ""));
    setValue("tools", rfq.tools || "");
    if (rfq.estimationDate) {
      setValue("estimateDate", String(rfq.estimationDate).split("T")[0]);
    }
  }, [selectedRfqId, rfqData, setValue]);

  // Pre-select RFQ if initialRfqId is passed (runs once on mount)
  useEffect(() => {
    if (initialRfqId && rfqData.length > 0 && !selectedRfqId) {
      const rfqIdStr = String(initialRfqId);
      setValue("rfqId", rfqIdStr);
      // Auto-fill will trigger via the effect above
    }
  }, [initialRfqId, rfqData, selectedRfqId, setValue]);

  const rfqOptions = rfqData
    .filter((rfq) => rfq.wbtStatus === "RECEIVED")
    .map((rfq) => ({
      label: `${rfq.projectName} - ${rfq.sender?.fabricator?.fabName || "N/A"}`,
      value: String(rfq.id),
    }));

  const fabricatorOptions = fabricators.map((fab) => ({
    label: fab.fabName,
    value: String(fab.id),
  }));

  const onSubmit = async (data: EstimationFormData) => {
    try {
      const payload = {
        ...data,
        files,
        status: "DRAFT",
        estimateDate: data.estimateDate
          ? new Date(data.estimateDate).toISOString()
          : null,
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === "files" && Array.isArray(value)) {
          value.forEach((file) => formData.append("files", file));
        } else if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value as string | Blob);
        }
      });

      const response = await Service.AddEstimation(formData);
      const createdEstimation = response.data || response;
      if (createdEstimation) {
        dispatch(addEstimation(createdEstimation));
      }
      toast.success("Estimation created successfully!");
      onSuccess?.();
      reset();
      setFiles([]);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create estimation");
    }
  };

  const isRfqLocked = !!initialRfqId;

  return (
    <div className="w-full mx-auto bg-white rounded-2xl md:rounded-3xl border border-black/10 overflow-hidden shadow-medium transition-all duration-300">
      <div className="bg-gray-50/50 p-6 md:p-8 border-b border-black/5">
        
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-10 space-y-10">
        {/* RFQ Selection */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-black/40 uppercase tracking-widest border-b border-black/5 pb-2">
            Base RFQ Association
          </h3>
          <Controller
            name="rfqId"
            control={control}
            rules={{ required: "RFQ is required" }}
            render={({ field }) => (
              <Select
                label="Referenced Project RFQ *"
                placeholder={
                  isRfqLocked ? "Project Vector Locked" : "Search project RFQ index..."
                }
                options={rfqOptions}
                value={field.value}
                onChange={(_, val) => field.onChange(val ?? "")}
                className="h-14"
              />
            )}
          />
          {errors.rfqId && (
            <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest -mt-2">
              {errors.rfqId.message}
            </p>
          )}
        </section>

        {/* Estimation Details */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-black/40 uppercase tracking-widest border-b border-black/5 pb-2">
            Quantification Identity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Estimation Identifier *"
              {...register("estimationNumber", { required: "Required" })}
              placeholder="e.g. EST-2025-089"
              className="h-14 font-black bg-white rounded-xl border-black/10"
            />
            {errors.estimationNumber && (
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">
                {errors.estimationNumber.message}
              </p>
            )}

            <Input
              label="Engineering Project Name"
              {...register("projectName")}
              placeholder="Auto-synced from RFQ"
              disabled={!!selectedRfqId}
              className="h-14 font-black bg-gray-50 rounded-xl border-black/10"
            />
          </div>

          <div className="space-y-2">
            <Controller
              name="fabricatorId"
              control={control}
              rules={{ required: "Fabricator is required" }}
              render={({ field }) => (
                <Select
                  label="Assign Fabricator Entity *"
                  options={fabricatorOptions}
                  value={field.value}
                  onChange={(_, val) => field.onChange(val ?? "")}
                  className="h-14"
                />
              )}
            />
            {errors.fabricatorId && (
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">
                {errors.fabricatorId.message}
              </p>
            )}
          </div>
        </section>

        {/* Description */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-black/40 uppercase tracking-widest border-b border-black/5 pb-2">
            Technical Specs & Project Narrative
          </h3>
          <div className="rounded-2xl border border-black/10 overflow-hidden bg-white">
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Detail project scope, engineering constraints, and special requirements..."
                />
              )}
            />
          </div>
        </section>

        {/* Timeline & Tools */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-black/40 uppercase tracking-widest border-b border-black/5 pb-2">
            Engineering Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Target Estimation Date *"
              type="date"
              {...register("estimateDate", { required: "Required" })}
              className="h-14 font-black rounded-xl border-black/10"
            />
            <Input
              label="Engineering Environment / Tools"
              {...register("tools")}
              placeholder="TEKLA, SDS/2, AUTOCAD..."
              disabled={!!selectedRfqId}
              className="h-14 font-black bg-white rounded-xl border-black/10"
            />
          </div>
        </section>

        {/* Status */}
        <section className="space-y-4 text-center sm:text-left">
          <h3 className="text-[10px] font-black text-black/40 uppercase tracking-widest border-b border-black/5 pb-2">
            Protocol Status
          </h3>
          <div className="max-w-xs mx-auto sm:mx-0">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  options={EstimationStatusOptions}
                  value={field.value || "PENDING"}
                  onChange={(_, val) => field.onChange(val ?? "PENDING")}
                  className="h-12"
                />
              )}
            />
          </div>
        </section>

        {/* Files */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-black/40 uppercase tracking-widest border-b border-black/5 pb-2">
            Technical Asset Appendices
          </h3>
          <div className="p-1 rounded-2xl border-2 border-dashed border-black/10 hover:border-green-400 bg-gray-50/50 transition-all">
            <MultipleFileUpload onFilesChange={setFiles} />
          </div>
          {files.length > 0 && (
            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">
              {files.length} Technical Asset(s) Pinned
            </p>
          )}
        </section>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-10 border-t border-black/5">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-12 py-4 bg-green-200 text-black border border-black rounded-xl hover:bg-green-300 font-black uppercase text-xs tracking-[0.2em] shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Transmitting Intelligence..." : "Add Estimation"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEstimation;
