/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useForm } from "react-hook-form";
import type { EmployeePayload, Fabricator } from "../../../interface";
import { toast } from "react-toastify";
import Button from "../../fields/Button";
import Service from "../../../api/Service";
import Input from "../../fields/input";
import { useDispatch } from "react-redux";
import { addStaff } from "../../../store/userSlice";
import Select from "../../fields/Select";
import { X, UserPlus, Check, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface AddClientProps {
  fabricator: Fabricator;
  onClose: () => void;
}

const AddClients: React.FC<AddClientProps> = ({
  fabricator,
  onClose,
}) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmployeePayload>({
    defaultValues: {
      role: "CLIENT"
    }
  });

  const onSubmit = async (data: EmployeePayload) => {
    const payload = {
      ...data,
      username: data?.username?.toUpperCase(),
    };

    try {
      const response = await Service.AddClientByFabricator(
        fabricator.id,
        payload,
      );
      dispatch(addStaff(response?.data?.user));
      toast.success("Stakeholder profile synchronized!");
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Error creating employee:", error);
      toast.error(error?.response?.data?.message || "Failed to create employee");
    }
  };

  const roleOptions = [
    { label: "Partner Client", value: "CLIENT" },
    { label: "Partner Administrator", value: "CLIENT_ADMIN" },
    { label: "Project Coordinator", value: "CLIENT_PROJECT_COORDINATOR" },
    { label: "General Constructor", value: "CLIENT_GENERAL_CONSTRUCTOR" },
  ];

  const selectedRole = watch("role");
  const selectedRoleOption = roleOptions.find((opt) => opt.value === selectedRole) || null;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative border border-slate-100 dark:border-slate-800"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-10 py-8 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <UserPlus className="w-6 h-6" />
            </div>
            Onboard Stakeholder
          </h2>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Registering a new point of contact for {fabricator.fabName}</p>
        </div>
        <button
          onClick={onClose}
          className="p-3 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-90"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-10 py-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
        {/* Core Identity */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            Authentication & Role
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Unique Identifier (Username)</label>
              <Input
                label=""
                {...register("username", { required: "Username is required" })}
                placeholder="e.g. JDOE_STEELWORKS"
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-700"
              />
              {errors.username && <p className="mt-2 text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">{errors.username.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">System Role</label>
              <Select
                options={roleOptions}
                {...register("role")}
                value={selectedRoleOption?.value}
                onChange={(_, value) => setValue("role", value as string)}
                placeholder="Select role..."
                className="mt-0"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Assigned Branch</label>
              <Select
                label=""
                placeholder="Select location node"
                options={fabricator.branches
                  .filter((branch) => branch.id !== undefined)
                  .map((branch) => ({
                    label: branch.name,
                    value: String(branch.id),
                  }))}
                {...register("branchId")}
                onChange={(_, value) => setValue("branchId", value as string)}
                className="mt-0"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Corporate Email</label>
              <Input
                label=""
                type="email"
                {...register("email", { required: "Email is required" })}
                placeholder="stakeholder@partner.corp"
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-700"
              />
            </div>
          </div>
        </section>

        {/* Profile Details */}
        <section className="space-y-6 pt-8 border-t border-slate-50 dark:border-slate-800">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            Personal Intelligence
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">First Name</label>
              <Input label="" {...register("firstName", { required: "Required" })} placeholder="John" className="bg-slate-50 dark:bg-slate-800 rounded-2xl" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Middle Initial</label>
              <Input label="" {...register("middleName")} placeholder="M." className="bg-slate-50 dark:bg-slate-800 rounded-2xl" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Last Name</label>
              <Input label="" {...register("lastName")} placeholder="Doe" className="bg-slate-50 dark:bg-slate-800 rounded-2xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Telephone</label>
              <div className="flex gap-2">
                <Input label="" {...register("phone", { required: "Required" })} placeholder="+1 XXX..." className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl" />
                <Input label="" {...register("extension")} placeholder="Ext" className="w-24 bg-slate-50 dark:bg-slate-800 rounded-2xl" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Designation</label>
              <Input label="" {...register("designation", { required: "Required" })} placeholder="e.g. Lead Procurement" className="bg-slate-50 dark:bg-slate-800 rounded-2xl" />
            </div>
          </div>
        </section>

        {/* Org Unit */}
        <section className="space-y-6 pt-8 border-t border-slate-50 dark:border-slate-800">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            Organizational Context
          </h3>
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Department Token (Optional)</label>
            <Input label="" {...register("departmentId")} placeholder="UUID or Code" className="bg-slate-50 dark:bg-slate-800 rounded-2xl" />
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 pt-10 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all active:scale-95"
          >
            Discard Draft
          </button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 flex items-center gap-3 border-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Synchronizing...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Create Stakeholder
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddClients;
