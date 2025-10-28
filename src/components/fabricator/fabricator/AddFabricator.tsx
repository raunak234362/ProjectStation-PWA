import { useForm } from "react-hook-form";
import type { FabricatorPayload } from "../../../interface";
import Service from "../../../api/Service";
import { toast } from "react-toastify";
import Input from "../../fields/input";
import Button from "../../fields/Button";

const AddFabricator = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FabricatorPayload>({
    defaultValues: {
      fabName: "",
      website: "",
      drive: "",
      files: "",
    },
  });

  const onSubmit = async (data: FabricatorPayload) => {
    try {
     
      const formData = new FormData();
      formData.append("fabName", data.fabName);
      formData.append("website", data.website || "");
      formData.append("drive", data.drive || "");


      if (data.files instanceof FileList && data.files.length > 0) {
        formData.append("files", data.files[0]); // first file
      } else if (data.files instanceof File) {
        formData.append("files", data.files);
      }

      const response = await Service.AddFabricator(formData);

      console.log("Fabricator added:", response);
      toast.success("Fabricator created successfully");
      reset();
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
        <Input label=""
                      
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
          <Input label=""
            type="url"
            {...register("drive")}
            placeholder="https://drive.google.com/..."
            className="w-full border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* File Upload */}
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-semibold mb-1">
            Upload File (optional)
          </label>
          <input
            type="file"
            {...register("files")}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

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
