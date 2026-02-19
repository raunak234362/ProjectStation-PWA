import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { FabricatorPayload, SelectOption } from "../../../interface";
import Service from "../../../api/Service";
import { toast } from "react-toastify";
import Input from "../../fields/input";
// import Button from "../../fields/Button";
import MultipleFileUpload from "../../fields/MultipleFileUpload";
import MultiSelect from "../../fields/MultiSelect";
import { useDispatch } from "react-redux";
import { addFabricator } from "../../../store/fabricatorSlice";
import AddBranch from "../branches/AddBranch";
import {
  Globe,
  Link,
  Layers,
  Percent,
  Calendar,
  Check,
  Loader2,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const AddFabricator = () => {
  const dispatch = useDispatch();
  const [addedFabricatorId, setAddedFabricatorId] = useState<string | null>(
    null,
  );
  const [wbtContactOptions, setWbtContactOptions] = useState<SelectOption[]>(
    [],
  );
  const userRole = sessionStorage.getItem("userRole");

  useEffect(() => {
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

        console.log("All Contacts ==========", allContacts);

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

    fetchWBTContacts();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FabricatorPayload>({
    defaultValues: {
      fabStage: "RFQ",
    },
  });

  const onSubmit = async (data: FabricatorPayload) => {
    try {
      const formData = new FormData();
      formData.append("fabName", data.fabName.toUpperCase());
      formData.append("website", data.website || "");
      formData.append("drive", data.drive || "");
      formData.append("fabStage", data.fabStage || "");
      if (
        Array.isArray(data.wbtFabricatorPointOfContact) &&
        data.wbtFabricatorPointOfContact.length > 0
      ) {
        data.wbtFabricatorPointOfContact.forEach((contact: any) => {
          formData.append("wbtFabricatorPointOfContact", String(contact));
        });
      }
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
      if (data.fabricatPercentage !== undefined)
        formData.append(
          "fabricatPercentage",
          String(parseFloat(String(data.fabricatPercentage))),
        );

      if (data.wbtContactId) formData.append("wbtContactId", data.wbtContactId);

      if (Array.isArray(data.files) && data.files.length > 0) {
        data.files.forEach((file: File) => {
          formData.append("files", file);
        });
      }

      const response = await Service.AddFabricator(formData);
      dispatch(addFabricator(response?.data));

      const newFabId =
        response?.data?._id ||
        response?.data?.id ||
        response?._id ||
        response?.id;
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
    <div className="w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden border border-black rounded-[2.5rem]"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-12">
          {/* Identity & Presence */}
          <section className="space-y-8">
            <h3 className="text-[10px] text-black font-black uppercase tracking-[0.2em] flex items-center gap-2">
              Brand Identity & Digital Presence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="block text-xs text-black font-black uppercase tracking-widest">
                  Fabricator Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  label=""
                  {...register("fabName", { required: "Name is mandatory" })}
                  placeholder="e.g. GLOBAL STEELWORKS INC"
                  className="w-full bg-white border-black rounded-2xl focus:bg-white h-14 text-sm font-black placeholder:text-black/30 placeholder:font-bold"
                />
                {errors.fabName && (
                  <p className="text-[10px]  text-rose-600 uppercase tracking-widest">
                    {String(errors.fabName.message)}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                <label className="block text-xs text-black font-black uppercase tracking-widest">
                  Operational Stage <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register("fabStage", { required: "Stage is mandatory" })}
                  className="w-full bg-white border border-black rounded-2xl px-6 h-14 focus:bg-white focus:ring-4 focus:ring-green-500/5 outline-none transition-all text-sm font-black uppercase tracking-widest"
                >
                  <option value="RFQ">RFQ (Initial Engagement)</option>
                  <option value="PRODUCTION">
                    PRODUCTION (Active Partner)
                  </option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="block text-xs text-black font-black uppercase tracking-widest">
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
                      className="border-black rounded-2xl h-14"
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="block text-xs text-black font-black uppercase tracking-widest flex items-center gap-2">
                  <Globe size={14} className="text-black/40" />
                  Official Website
                </label>
                <Input
                  label=""
                  type="url"
                  {...register("website")}
                  placeholder="https://partner-portal.com"
                  className="w-full bg-white border-black rounded-2xl focus:bg-white h-12 text-sm font-black placeholder:text-black/30 placeholder:font-bold"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-xs text-black font-black uppercase tracking-widest flex items-center gap-2">
                  <Link size={14} className="text-black/40" />
                  Documentation Repository (Drive)
                </label>
                <Input
                  label=""
                  type="url"
                  {...register("drive")}
                  placeholder="Cloud storage link..."
                  className="w-full bg-white border-black rounded-2xl focus:bg-white h-12 text-sm font-black placeholder:text-black/30 placeholder:font-bold"
                />
              </div>
            </div>
          </section>

          {/* Operational Metrics */}
          {(userRole === "ADMIN" || userRole === "PROJECT_MANAGER_OFFICER") && (
            <section className="space-y-8 pt-10 border-t border-black/10">
              <h3 className="text-[10px] text-black font-black uppercase tracking-[0.2em] flex items-center gap-2">
                Commercial & Operational Governance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <label className="block text-xs text-black font-black uppercase tracking-widest flex items-center gap-2">
                    <Percent size={14} className="text-black/40" />
                    Approval Percentage
                  </label>
                  <Input
                    label=""
                    type="number"
                    {...register("approvalPercentage", { valueAsNumber: true })}
                    placeholder="0"
                    className="bg-white border-black rounded-2xl h-12 text-sm font-black placeholder:text-black/30 placeholder:font-bold"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-xs text-black font-black uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} className="text-black/40" />
                    Fabrication Percentage
                  </label>
                  <Input
                    label=""
                    type="number"
                    {...register("fabricatPercentage", { valueAsNumber: true })}
                    placeholder="0"
                    className="bg-white border-black rounded-2xl h-12 text-sm font-black placeholder:text-black/30 placeholder:font-bold"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-xs text-black font-black uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} className="text-black/40" />
                    Payment Cycle (Days)
                  </label>
                  <Input
                    label=""
                    type="number"
                    {...register("paymenTDueDate", { valueAsNumber: true })}
                    placeholder="30"
                    className="bg-white border-black rounded-2xl h-12 text-sm font-black placeholder:text-black/30 placeholder:font-bold"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Assets */}
          <section className="space-y-8 pt-10 border-t border-black/10">
            <h3 className="text-[10px] text-black font-black uppercase tracking-[0.2em] flex items-center gap-2">
              Digital Assets & Compliance Media
            </h3>
            <div className="bg-white p-8 rounded-3xl border border-black shadow-sm">
              <Controller
                name="files"
                control={control}
                render={({ field }) => (
                  <MultipleFileUpload
                    onFilesChange={(files) => {
                      field.onChange(files);
                    }}
                  />
                )}
              />
            </div>
          </section>

          {/* Form Actions */}
          <div className="pt-10 w-full flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-4 bg-green-200 text-black border border-black font-black rounded-2xl shadow-sm transition-all hover:bg-green-300 active:scale-95 flex items-center gap-4 text-[10px] uppercase tracking-[0.15em]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Synchronizing Entity...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" strokeWidth={3} />
                  Deploy Fabricator Profile
                </>
              )}
            </button>
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
                  <h3 className="text-xl  uppercase tracking-tight">
                    Entity Created Successfully
                  </h3>
                  <p className="text-[10px]  text-emerald-100 uppercase tracking-widest">
                    Mandatory Action: Initialize Primary Branch Infrastructure
                  </p>
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
