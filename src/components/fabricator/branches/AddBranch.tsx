/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import type { Branch } from "../../../interface";
import Button from "../../fields/Button";
import Service from "../../../api/Service";
import Input from "../../fields/input";
interface AddBranchProps {
  fabricatorId: string;
  onClose: () => void;
  onSubmitSuccess?: (branch: Branch) => void; // optional callback
}

const AddBranch: React.FC<AddBranchProps> = ({ fabricatorId, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Branch>({
    defaultValues: {
      fabricatorId,
      isHeadquarters: false,
    },
  });

  const onSubmit = async (data: Branch) => {
    try {
      console.log("Branch Form Submitted:", data);
      const response = await Service.AddBranchByFabricator(data);
      console.log(response);

      // API Request Example ⬇
      // const response = await Service.AddBranchToFabricator(data);
      // if (response.success) onSubmitSuccess?.(data);

      // reset();
    } catch (err) {
      console.error("Failed to add branch:", err);
    }
  };

  return (
    <>
      <Button onClick={onClose}>Close</Button>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white shadow rounded"
      >
        {/* Hidden fabricatorId */}
        <input
          type="hidden"
          value={fabricatorId}
          {...register("fabricatorId")}
        />
        {/* Name */}
        <div>
          <Input
            label="Headquater/ Branches"
            type="text"
            {...register("name", { required: "Branch name is required" })}
            className="input"
            placeholder="Headquater/ Branches"
          />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Input
            label="email"
            type="email"
            {...register("email", {
              required: "Email required",
              pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
            })}
            className="input"
            placeholder="branch@company.com"
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Input
            label="Phone"
            type="text"
            {...register("phone", { required: "Phone required" })}
            className="input"
            placeholder="+91XXXXXXXXXX"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs">{errors.phone.message}</p>
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <Input
            label="Address"
            type="text"
            {...register("address", { required: "Address required" })}
            className="input"
            placeholder="123 Industrial Area"
          />
          {errors.address && (
            <p className="text-red-500 text-xs">{errors.address.message}</p>
          )}
        </div>

        {/* City */}
        <div>
          <Input
            label="City"
            type="text"
            {...register("city", { required: "City required" })}
            className="input"
            placeholder="Delhi"
          />
          {errors.city && (
            <p className="text-red-500 text-xs">{errors.city.message}</p>
          )}
        </div>

        {/* State */}
        <div>
          <Input
            label="State"
            type="text"
            {...register("state", { required: "State required" })}
            className="input"
            placeholder="UP / KA / MH"
          />
          {errors.state && (
            <p className="text-red-500 text-xs">{errors.state.message}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <Input
            label="Country"
            type="text"
            {...register("country", { required: "Country required" })}
            className="input"
            placeholder="IN"
          />
          {errors.country && (
            <p className="text-red-500 text-xs">{errors.country.message}</p>
          )}
        </div>

        {/* ZipCode */}
        <div>
          <Input
            label="Zipcode"
            type="text"
            {...register("zipCode", { required: "Zip Code required" })}
            className="input"
            placeholder="560001"
          />
          {errors.zipCode && (
            <p className="text-red-500 text-xs">{errors.zipCode.message}</p>
          )}
        </div>

        {/* Is Headquarters */}
        <div className=" flex items-center gap-2 mt-2">
          <Input
            label="Headquater"
            type="checkbox"
            {...register("isHeadquarters")}
          />
        </div>

        {/* Submit */}
        <div className="md:col-span-2">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving..." : "Add Branch"}
          </Button>
        </div>
      </form>
    </>
  );
};

export default AddBranch;
