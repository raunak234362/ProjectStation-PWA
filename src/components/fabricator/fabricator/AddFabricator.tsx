import { Controller, useForm } from "react-hook-form";
import type { FabricatorPayload } from "../../../interface";
import Service from "../../../api/Service";
import { toast } from "react-toastify";
import Input from "../../fields/input";
import Button from "../../fields/Button";
import MultipleFileUpload from "../../fields/MultipleFileUpload"; // Make sure this path is correct
import { useDispatch } from "react-redux";
import { addFabricator } from "../../../store/fabricatorSlice";

const AddFabricator = () => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FabricatorPayload>();

  const onSubmit = async (data: FabricatorPayload) => {
    try {
      const formData = new FormData();
      formData.append("fabName", data.fabName);
      formData.append("website", data.website || "");
      formData.append("drive", data.drive || "");

      if (Array.isArray(data.files) && data.files.length > 0) {
        // Append each file to the FormData
        // The backend should be set up to receive an array for the 'files' field
        data.files.forEach((file: File) => {
          formData.append("files", file);
        });
      }

      const response = await Service.AddFabricator(formData);
      dispatch(addFabricator(response?.data));
      console.log("Fabricator added:", response);
      toast.success("Fabricator created successfully");
      reset(); // Reset form to default values
    } catch (error) {
      console.error(error);
      toast.error("Failed to add the fabricator");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 mt-8 border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Add New Fabricator
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Fabricator Name */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Fabricator Name <span className="text-red-500">*</span>
          </label>
          <Input
            label=""
            type="text"
            {...register("fabName", {
              required: "Fabricator name is required",
            })}
            placeholder="Enter Fabricator Name"
            className="w-full border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
          />
          {errors.fabName && (
            <p className="text-red-500 text-xs mt-1">
              {String(errors.fabName.message)}
            </p>
          )}
        </div>

        {/* Website */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Website (optional)
          </label>
          <Input
            label=""
            type="url"
            {...register("website")}
            placeholder="https://example.com"
            className="w-full border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Drive Link */}
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-semibold mb-1">
            Drive Link (optional)
          </label>
          <Input
            label=""
            type="url"
            {...register("drive")}
            placeholder="https://drive.google.com/..."
            className="w-full border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* File Upload - FIXED */}
        {/* This container div was missing, and there was a stray </div> */}
        <div className="md:col-span-2">
          <Controller
            name="files"
            control={control}
            render={({ field }) => (
              <MultipleFileUpload
                // When files change, update RHF's state
                onFilesChange={(files) => {
                  field.onChange(files);
                }}
              />
            )}
          />
          {errors.files && (
            <p className="text-red-500 text-xs mt-1">
              {String(errors.files.message)}
            </p>
          )}
        </div>
        {/* The stray </div> that was here is now removed */}

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end mt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-8 py-2.5 rounded-lg hover:opacity-90 shadow-md transition"
          >
            {isSubmitting ? "Creating..." : "Create Fabricator"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddFabricator;
