/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Input from "../../fields/input";
import Select from "react-select";
import Button from "../../fields/Button";
import { State, City } from "country-state-city";
import type { ConnectionDesignerForm } from "../../../interface";
import { toast } from "react-toastify";
import Service from "../../../api/Service";
// import Service from "../../../api/Service";

const AddConnectionDesigner: React.FC = () => {
  const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
  const [cityOptions, setCityOptions] = useState<{ label: string; value: string }[]>([]);

  const countryMap: Record<string, string> = {
    "United States": "US",
    Canada: "CA",
    India: "IN",
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConnectionDesignerForm>({
    defaultValues: {
      headquater: {
        country: "",
        states: [],
        city: "",
      },
    },
  });

  const country = watch("headquater.country");
  const selectedStates = watch("headquater.states");

  // --- Load states when country changes ---
  useEffect(() => {
    if (country && countryMap[country]) {
      const countryCode = countryMap[country];
      const statesData = State.getStatesOfCountry(countryCode) || [];
      setStateOptions(statesData.map((s) => ({ label: s.name, value: s.name })));

      setValue("headquater.states", []);
      setValue("headquater.city", "");
      setCityOptions([]);
    } else {
      setStateOptions([]);
      setCityOptions([]);
      setValue("headquater.states", []);
      setValue("headquater.city", "");
    }
  }, [country, setValue]);

  // --- Load cities for all selected states ---
  useEffect(() => {
    if (selectedStates.length > 0 && country && countryMap[country]) {
      const countryCode = countryMap[country];
      const allCities: { label: string; value: string }[] = [];

      selectedStates.forEach((stateName) => {
        const stateObj = State.getStatesOfCountry(countryCode).find(
          (s) => s.name === stateName
        );
        if (stateObj) {
          const cities = City.getCitiesOfState(countryCode, stateObj.isoCode) || [];
          allCities.push(...cities.map((c) => ({ label: c.name, value: c.name })));
        }
      });

      setCityOptions(allCities);
    } else {
      setCityOptions([]);
    }
  }, [selectedStates, country]);

  // --- Submit Form ---
  const onSubmit = async (data: ConnectionDesignerForm) => {
    try {
      const payload = {
        name: data.connectionDesignerName.trim(),
        state: data.headquater.states, // JSON array
        contactInfo: data.contactInfo || "",
        websiteLink: data.website || "",
        email: data.email || "",
        location: data.headquater.city
          ? `${data.headquater.city}, ${data.headquater.country}`
          : data.headquater.country,
      };

      console.log("🚀 Payload to send:", payload);
      await Service.AddConnectionDesigner(payload); // ✅ Send to backend
      toast.success("Connection Designer created successfully!");
      reset();
    } catch (error) {
      console.error("❌ Failed to create designer:", error);
      toast.error("Failed to create Connection Designer");
    }
  };

  return (
    <div className="w-full h-auto mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 mt-8 border border-gray-200 overflow-visible">
 
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Connection Designer Name */}
        <Input
          label="Connection Designer Name *"
          type="text"
          {...register("connectionDesignerName", {
            required: "Connection Designer name is required",
          })}
          placeholder="Enter Connection Designer Name"
        />
        {errors.connectionDesignerName && (
          <p className="text-red-500 text-xs mt-1">
            {errors.connectionDesignerName.message}
          </p>
        )}

        {/* Contact Info & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Contact Info (optional)"
            type="text"
            {...register("contactInfo")}
            placeholder="+91 9876543210"
          />
          <Input
            label="Email (optional)"
            type="email"
            {...register("email")}
            placeholder="info@example.com"
          />
        </div>

        {/* Website & Drive Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Website (optional)"
            type="url"
            {...register("website")}
            placeholder="https://example.com"
          />
          <Input
            label="Drive Link (optional)"
            type="url"
            {...register("drive")}
            placeholder="https://drive.google.com/..."
          />
        </div>

        {/* Country, Multi-State, City */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Country */}
          <Controller
            name="headquater.country"
            control={control}
            rules={{ required: "Country is required" }}
            render={({ field }) => (
              <Select
                placeholder="Select Country"
                options={Object.keys(countryMap).map((c) => ({
                  label: c,
                  value: c,
                }))}
                value={field.value ? { label: field.value, value: field.value } : null}
                onChange={(option) => field.onChange(option?.value || "")}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            )}
          />

          {/* Multi-State */}
          <Controller
            name="headquater.states"
            control={control}
            rules={{ required: "Select at least one state" }}
            render={({ field }) => (
              <Select
                isMulti
                placeholder="Select State(s)"
                options={stateOptions}
                value={stateOptions.filter((opt) => field.value.includes(opt.value))}
                onChange={(options) => {
                  const selected = options ? options.map((opt) => opt.value) : [];
                  field.onChange(selected);
                  setValue("headquater.city", "");
                }}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            )}
          />

          {/* City (Optional) */}
          <Controller
            name="headquater.city"
            control={control}
            render={({ field }) => (
              <Select
                placeholder="Select City (Optional)"
                options={cityOptions}
                value={field.value ? { label: field.value, value: field.value } : null}
                onChange={(option) => field.onChange(option?.value || "")}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-linear-to-r from-teal-600 to-emerald-500 text-white px-8 py-2.5 rounded-lg hover:opacity-90 shadow-md transition"
          >
            {isSubmitting ? "Creating..." : "Create Connection Designer"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddConnectionDesigner;
