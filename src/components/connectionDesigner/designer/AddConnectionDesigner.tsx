/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Input from "../../fields/input";
import Select from "react-select";
import Button from "../../fields/Button";
import { State, City } from "country-state-city";
import type { ConnectionDesignerForm } from "../../../interface";

const AddConnectionDesigner: React.FC = () => {
  const [stateOptions, setStateOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [cityOptions, setCityOptions] = useState<
    { label: string; value: string }[]
  >([]);

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
      const options = statesData.map((s) => ({ label: s.name, value: s.name }));
      setStateOptions(options);

      // Reset dependent fields
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

  // --- Load cities (combined from selected states) ---
  useEffect(() => {
    if (selectedStates.length > 0 && country && countryMap[country]) {
      const countryCode = countryMap[country];
      const allCities: { label: string; value: string }[] = [];

      selectedStates.forEach((stateName) => {
        const stateObj = State.getStatesOfCountry(countryCode).find(
          (s) => s.name === stateName
        );
        if (stateObj) {
          const cities =
            City.getCitiesOfState(countryCode, stateObj.isoCode) || [];
          allCities.push(
            ...cities.map((c) => ({ label: c.name, value: c.name }))
          );
        }
      });

      setCityOptions(allCities);
    } else {
      setCityOptions([]);
    }
  }, [selectedStates, country]);

  const onSubmit = async (data: ConnectionDesignerForm) => {
    console.log("✅ Submitted Data:", data);
    // Example payload shape:
    // {
    //   connectionDesignerName: "XYZ",
    //   website: "",
    //   drive: "",
    //   headquater: {
    //     country: "India",
    //     states: ["Uttar Pradesh", "Delhi"],
    //     city: "Lucknow"
    //   }
    // }
  };

  return (
    <div className="w-full h-auto mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 mt-8 border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Add New Connection Designer
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        {/* Connection Designer Name */}
        <div>
          <label
            htmlFor="connectionDesignerName"
            className="block text-gray-700 font-semibold mb-1"
          >
            Connection Designer Name <span className="text-red-500">*</span>
          </label>
          <Input
            label=""
            type="text"
            {...register("connectionDesignerName", {
              required: "Connection Designer name is required",
            })}
            placeholder="Enter Connection Designer Name"
            className="w-full border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
          />
          {errors.connectionDesignerName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.connectionDesignerName.message}
            </p>
          )}
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
                value={
                  field.value
                    ? { label: field.value, value: field.value }
                    : null
                }
                onChange={(option) => field.onChange(option?.value || "")}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
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
                value={stateOptions.filter((opt) =>
                  field.value.includes(opt.value)
                )}
                onChange={(options) => {
                  const selected = options
                    ? options.map((opt) => opt.value)
                    : [];
                  field.onChange(selected);
                  setValue("headquater.city", "");
                }}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
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
                value={
                  field.value
                    ? { label: field.value, value: field.value }
                    : null
                }
                onChange={(option) => field.onChange(option?.value || "")}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end mt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-8 py-2.5 rounded-lg hover:opacity-90 shadow-md transition"
          >
            {isSubmitting ? "Creating..." : "Create Connection Designer"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddConnectionDesigner;
