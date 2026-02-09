import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import type { Branch } from "../../../interface";
import Button from "../../fields/Button";
import Service from "../../../api/Service";
import Input from "../../fields/input";
import { toast } from "react-toastify";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import { X, Plus, Check, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface AddBranchProps {
  fabricatorId: string;
  onClose: () => void;
  onSubmitSuccess?: (branch: Branch) => void;
}

const AddBranch: React.FC<AddBranchProps> = ({
  fabricatorId,
  onClose,
  onSubmitSuccess
}) => {
  const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
  const [cityOptions, setCityOptions] = useState<{ label: string; value: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Branch>({
    defaultValues: {
      fabricatorId,
      isHeadquarters: false,
      country: "IN",
    },
  });

  const selectedCountry = watch("country");
  const selectedState = watch("state");
  const zipCode = watch("zipCode");

  useEffect(() => {
    if (selectedCountry) {
      const statesData = State.getStatesOfCountry(selectedCountry) || [];
      setStateOptions(statesData.map((s) => ({ label: s.name, value: s.isoCode })));
    } else {
      setStateOptions([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      const citiesData = City.getCitiesOfState(selectedCountry, selectedState) || [];
      setCityOptions(citiesData.map((c) => ({ label: c.name, value: c.name })));
    } else {
      setCityOptions([]);
    }
  }, [selectedCountry, selectedState]);

  const handleZipCodeBlur = async () => {
    if (zipCode && zipCode.length === 6 && selectedCountry === "IN") {
      try {
        const response = await axios.get(`https://api.postalpincode.in/pincode/${zipCode}`);
        const data = response.data[0];
        if (data.Status === "Success") {
          const postOffice = data.PostOffice[0];
          const stateName = postOffice.State;
          const cityName = postOffice.District;
          const states = State.getStatesOfCountry("IN");
          const stateObj = states.find((s) => s.name.toLowerCase() === stateName.toLowerCase());
          if (stateObj) {
            setValue("state", stateObj.isoCode);
            setTimeout(() => { setValue("city", cityName); }, 100);
          }
          toast.success("Geo-data extrapolated from pincode");
        }
      } catch (error) {
        console.error("Pincode fetch failed:", error);
      }
    }
  };

  const onSubmit = async (data: Branch) => {
    try {
      await Service.AddBranchByFabricator(data);
      toast.success("Infrastructure entry created");
      reset();
      if (onSubmitSuccess) onSubmitSuccess(data);
      if (onClose) onClose();
    } catch (err) {
      console.error("Failed to add branch:", err);
      toast.error("Failed to register branch");
    }
  };

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
          <h2 className="text-3xl  text-slate-900 dark:text-white tracking-tight leading-none mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
              <Plus className="w-6 h-6" />
            </div>
            Initialize New Branch
          </h2>
          <p className="text-xs  text-slate-400 dark:text-slate-500 uppercase tracking-widest">Registering a new geographic node in the partner network</p>
        </div>
        <button
          onClick={onClose}
          className="p-3 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-90"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-10 py-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
        {/* Core Info */}
        <section className="space-y-6">
          <h3 className="text-[10px]  text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            Branch Identity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Branch Designation</label>
              <Input
                label=""
                {...register("name", { required: "Branch name is required" })}
                placeholder="e.g. Asia-Pacific Headquarters"
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-700"
              />
              {errors.name && <p className="mt-2 text-[10px]  text-rose-600 dark:text-rose-400 uppercase tracking-wider">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Official Email</label>
              <Input
                label=""
                type="email"
                {...register("email", {
                  required: "Email required",
                  pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
                })}
                placeholder="logistics@partner.corp"
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-700"
              />
              {errors.email && <p className="mt-2 text-[10px]  text-rose-600 dark:text-rose-400 uppercase tracking-wider">{errors.email.message}</p>}
            </div>
          </div>
        </section>

        {/* Contact info */}
        <section className="space-y-6 pt-8 border-t border-slate-50 dark:border-slate-800">
          <h3 className="text-[10px]  text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            Communications Hub
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Direct Phone</label>
              <Input
                label=""
                {...register("phone", { required: "Phone required" })}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-700"
              />
              {errors.phone && <p className="mt-2 text-[10px]  text-rose-600 dark:text-rose-400 uppercase tracking-wider">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Extension</label>
              <Input
                label=""
                {...register("extension")}
                placeholder="808"
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-700"
              />
            </div>
          </div>
        </section>

        {/* Geography */}
        <section className="space-y-6 pt-8 border-t border-slate-50 dark:border-slate-800">
          <h3 className="text-[10px]  text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            Geographic Presence
          </h3>
          <div className="grid grid-cols-1 gap-8">
            <div>
              <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Physical Address</label>
              <Input
                label=""
                {...register("address", { required: "Address required" })}
                placeholder="Building 4, Sector 12, Industrial Area"
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-700"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Pincode</label>
              <Input
                label=""
                {...register("zipCode", { required: "Zip Code required", onBlur: handleZipCodeBlur })}
                placeholder="560001"
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">Country</label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select
                    options={Country.getAllCountries().map(c => ({ label: c.name, value: c.isoCode }))}
                    value={Country.getAllCountries().filter(c => c.isoCode === field.value).map(c => ({ label: c.name, value: c.isoCode }))[0]}
                    onChange={(opt) => { field.onChange(opt?.value); setValue("state", ""); setValue("city", ""); }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '16px',
                        padding: '4px',
                        backgroundColor: 'var(--tw-bg-slate-50)',
                        border: '1px solid var(--tw-border-slate-200)',
                        boxShadow: 'none',
                        '&:hover': { border: '1px solid var(--tw-border-slate-300)' }
                      }),
                      menu: (base) => ({ ...base, borderRadius: '16px', overflow: 'hidden', zIndex: 9999, backgroundColor: 'var(--tw-bg-white)' }),
                      singleValue: (base) => ({ ...base, color: 'inherit' }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? 'var(--tw-bg-slate-100)' : 'transparent',
                        color: 'inherit',
                        '&:active': { backgroundColor: 'var(--tw-bg-slate-200)' }
                      })
                    }}
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">State</label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Select
                    options={stateOptions}
                    value={stateOptions.find(opt => opt.value === field.value)}
                    onChange={(opt) => { field.onChange(opt?.value); setValue("city", ""); }}
                    isDisabled={!selectedCountry}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '16px',
                        padding: '4px',
                        backgroundColor: 'var(--tw-bg-slate-50)',
                        border: '1px solid var(--tw-border-slate-200)'
                      }),
                      menu: (base) => ({ ...base, borderRadius: '16px', overflow: 'hidden', zIndex: 9999, backgroundColor: 'var(--tw-bg-white)' }),
                      singleValue: (base) => ({ ...base, color: 'inherit' }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? 'var(--tw-bg-slate-100)' : 'transparent',
                        color: 'inherit',
                        '&:active': { backgroundColor: 'var(--tw-bg-slate-200)' }
                      })
                    }}
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-2">City</label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Select
                    options={cityOptions}
                    value={cityOptions.find(opt => opt.value === field.value)}
                    onChange={(opt) => field.onChange(opt?.value)}
                    isDisabled={!selectedState}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '16px',
                        padding: '4px',
                        backgroundColor: 'var(--tw-bg-slate-50)',
                        border: '1px solid var(--tw-border-slate-200)'
                      }),
                      menu: (base) => ({ ...base, borderRadius: '16px', overflow: 'hidden', zIndex: 9999, backgroundColor: 'var(--tw-bg-white)' }),
                      singleValue: (base) => ({ ...base, color: 'inherit' }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? 'var(--tw-bg-slate-100)' : 'transparent',
                        color: 'inherit',
                        '&:active': { backgroundColor: 'var(--tw-bg-slate-200)' }
                      })
                    }}
                  />
                )}
              />
            </div>
          </div>
        </section>

        {/* System Settings */}
        <section className="pt-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="isHeadquarters"
              {...register("isHeadquarters")}
              className="w-6 h-6 rounded-lg text-green-600 border-slate-200 dark:border-slate-700 focus:ring-green-500 transition-all dark:bg-slate-800"
            />
            <label htmlFor="isHeadquarters" className="text-xs  text-slate-700 dark:text-slate-200 uppercase tracking-widest cursor-pointer">Set as Global Headquarters</label>
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 pt-10 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 text-[10px]  uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all active:scale-95"
          >
            Cancel Initialization
          </button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white text-[10px]  uppercase tracking-widest rounded-2xl shadow-xl shadow-green-100 dark:shadow-none transition-all active:scale-95 flex items-center gap-3 border-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Provisioning...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Deploy Branch
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddBranch;
