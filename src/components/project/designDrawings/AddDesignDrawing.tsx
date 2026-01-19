/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import Service from "../../../api/Service";
import Button from "../../fields/Button";
import { Loader2, Upload } from "lucide-react";

interface AddDesignDrawingProps {
  projectId: string;
  onSuccess: () => void;
}

const AddDesignDrawing = ({ projectId, onSuccess }: AddDesignDrawingProps) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [files, setFiles] = useState<FileList | null>(null);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("stage", data.stage);
      formData.append("description", data.description);

      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
      }

      await Service.CreateDesignDrawing(formData);
      reset();
      setFiles(null);
      onSuccess();
    } catch (error) {
      console.error("Error creating design drawing:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 rounded-xl shadow-md space-y-4"
    >
      <h3 className="text-xl font-semibold text-green-700">
        Add Design Drawing
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700">Stage</label>
        <select
          {...register("stage", { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
        >
          <option value="">Select Stage</option>
          <option value="IFA">IFA</option>
          <option value="IFC">IFC</option>
          <option value="CO#">CO#</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register("description", { required: true })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          placeholder="Enter description..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Files</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                <span>Upload files</span>
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(e) => setFiles(e.target.files)}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">
              {files
                ? `${files.length} files selected`
                : "PNG, JPG, PDF up to 10MB"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            "Create Design Drawing"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddDesignDrawing;
