import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { FabricatorPayload } from "../../../interface";
import Service from "../../../api/Service";
import { toast } from "react-toastify";
import Input from "../../fields/input";
import Button from "../../fields/Button";
import MultipleFileUpload from "../../fields/MultipleFileUpload";
import { useDispatch } from "react-redux";
import { addFabricator } from "../../../store/fabricatorSlice";
import AddBranch from "../branches/AddBranch";
import { Plus, Globe, Link, Layers, Percent, Calendar, Check, Loader2, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const AddFabricator = () => {
  const dispatch = useDispatch();
  const [addedFabricatorId, setAddedFabricatorId] = useState<string | null>(null);
  const userRole = sessionStorage.getItem("userRole");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FabricatorPayload>({
    defaultValues: {
      fabStage: "RFQ"
    }
  });

  const onSubmit = async (data: FabricatorPayload) => {
    try {
      const formData = new FormData();
      formData.append("fabName", data.fabName.toUpperCase());
      formData.append("website", data.website || "");
      formData.append("drive", data.drive || "");
      formData.append("fabStage", data.fabStage || "");

      if (data.approvalPercentage !== undefined)
        formData.append("approvalPercentage", String(parseFloat(String(data.approvalPercentage))));
      if (data.paymenTDueDate !== undefined)
        formData.append("paymenTDueDate", String(parseFloat(String(data.paymenTDueDate))));
      if (data.fabricatPercentage !== undefined)
        formData.append("fabricatPercentage", String(parseFloat(String(data.fabricatPercentage))));

      if (Array.isArray(data.files) && data.files.length > 0) {
        data.files.forEach((file: File) => {
          formData.append("files", file);
        });
      }

      const response = await Service.AddFabricator(formData);
      dispatch(addFabricator(response?.data));

      const newFabId = response?.data?._id || response?.data?.id || response?._id || response?.id;
      if (newFabId) {
        setAddedFabricatorId(newFabId);
      }

      toast.success("New Fabricator entity created");
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to initialize fabricator node");
    }
  };

  return (
    <div className="w-full mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Header Section */}
        <div className="px-10 py-12 bg-slate-50/50 border-b border-slate-100">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-100">
              <Plus className="w-7 h-7" />
            </div>
            Enlist Fabricator
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-16">Establishing a new manufacturing partnership in the ecosystem</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-12">
          {/* Identity & Presence */}
          <section className="space-y-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              Brand Identity & Digital Presence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest">Fabricator Legal Name <span className="text-rose-500">*</span></label>
                <Input
                  label=""
                  {...register("fabName", { required: "Name is mandatory" })}
                  placeholder="e.g. GLOBAL STEELWORKS INC"
                  className="w-full bg-slate-50 border-slate-200 rounded-2xl focus:bg-white h-14 text-lg font-bold"
                />
                {errors.fabName && <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">{String(errors.fabName.message)}</p>}
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest">Operational Stage <span className="text-rose-500">*</span></label>
                <select
                  {...register("fabStage", { required: "Stage is mandatory" })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 h-14 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold text-slate-600"
                >
                  <option value="RFQ">RFQ (Initial Engagement)</option>
                  <option value="PRODUCTION">PRODUCTION (Active Partner)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={14} className="text-slate-400" />
                  Official Website
                </label>
                <Input
                  label=""
                  type="url"
                  {...register("website")}
                  placeholder="https://partner-portal.com"
                  className="w-full bg-slate-50 border-slate-200 rounded-2xl focus:bg-white h-12"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <Link size={14} className="text-slate-400" />
                  Documentation Repository (Drive)
                </label>
                <Input
                  label=""
                  type="url"
                  {...register("drive")}
                  placeholder="Cloud storage link..."
                  className="w-full bg-slate-50 border-slate-200 rounded-2xl focus:bg-white h-12"
                />
              </div>
            </div>
          </section>

          {/* Operational Metrics */}
          {(userRole === "ADMIN" || userRole === "PROJECT_MANAGER_OFFICER") && (
            <section className="space-y-8 pt-10 border-t border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                Commercial & Operational Governance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Percent size={14} className="text-slate-400" />
                    Approval Weight
                  </label>
                  <Input
                    label=""
                    type="number"
                    {...register("approvalPercentage", { valueAsNumber: true })}
                    placeholder="0"
                    className="bg-slate-50 border-slate-200 rounded-2xl h-12"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} className="text-slate-400" />
                    Fabrication Weight
                  </label>
                  <Input
                    label=""
                    type="number"
                    {...register("fabricatPercentage", { valueAsNumber: true })}
                    placeholder="0"
                    className="bg-slate-50 border-slate-200 rounded-2xl h-12"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    Payment Cycle (Days)
                  </label>
                  <Input
                    label=""
                    type="number"
                    {...register("paymenTDueDate", { valueAsNumber: true })}
                    placeholder="30"
                    className="bg-slate-50 border-slate-200 rounded-2xl h-12"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Assets */}
          <section className="space-y-8 pt-10 border-t border-slate-50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              Digital Assets & Compliance Media
            </h3>
            <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
              <Controller
                name="files"
                control={control}
                render={({ field }) => (
                  <MultipleFileUpload
                    onFilesChange={(files) => { field.onChange(files); }}
                  />
                )}
              />
            </div>
          </section>

          {/* Form Actions */}
          <div className="pt-10 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] shadow-2xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3 border-none text-xs font-black uppercase tracking-widest"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Synchronizing Entity...
                </>
              ) : (
                <>
                  <Check className="w-6 h-6" />
                  Deploy Fabricator Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Post-Creation Success State (Branch Initialization) */}
      <AnimatePresence>
        {addedFabricatorId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
          >
            <div className="w-full max-w-5xl">
              <div className="bg-emerald-600 text-white p-6 rounded-t-[40px] flex items-center gap-4 border-b border-emerald-500 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Entity Created Successfully</h3>
                  <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Mandatory Action: Initialize Primary Branch Infrastructure</p>
                </div>
              </div>
              <div className="bg-white rounded-b-[40px] overflow-hidden shadow-2xl">
                <AddBranch
                  fabricatorId={addedFabricatorId}
                  onClose={() => setAddedFabricatorId(null)}
                  onSubmitSuccess={() => {
                    toast.success("Network node established");
                    setAddedFabricatorId(null);
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddFabricator;
