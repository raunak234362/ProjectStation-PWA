/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { EmployeePayload } from "../../../interface";
import { toast } from "react-toastify";
import Button from "../../fields/Button";
import Service from "../../../api/Service";
import Input from "../../fields/input";
import Select from "../../fields/Select";
import { useDispatch } from "react-redux";
import { addStaff } from "../../../store/userSlice";

const AddEmployee: React.FC = () => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmployeePayload>();

  const onSubmit = async (data: EmployeePayload) => {
    const payload = {
      ...data,
      username: data?.username?.toUpperCase(),
    };

    try {
      const response = await Service.AddEmployee(payload);
      console.log("Employee created:", response);
      dispatch(addStaff(response?.data?.user));
      toast.success("Employee created successfully!");
    } catch (error: any) {
      console.error("Error creating employee:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create employee",
      );
    }
  };

  const roleOptions = [
    { label: "STAFF", value: "STAFF" },
    { label: "ADMIN", value: "ADMIN" },
    { label: "OPERATION_EXECUTIVE", value: "OPERATION_EXECUTIVE" },
    { label: "PROJECT_MANAGER_OFFICER", value: "PROJECT_MANAGER_OFFICER" },
    { label: "DEPUTY_MANAGER", value: "DEPUTY_MANAGER" },
    { label: "DEPT_MANAGER", value: "DEPT_MANAGER" },
    { label: "PROJECT_MANAGER", value: "PROJECT_MANAGER" },
    { label: "TEAM_LEAD", value: "TEAM_LEAD" },
    { label: "SALES_MANAGER", value: "SALES_MANAGER" },
    { label: "SALES_PERSON", value: "SALES_PERSON" },
    { label: "SYSTEM_ADMIN", value: "SYSTEM_ADMIN" },
    { label: "ESTIMATION_HEAD", value: "ESTIMATION_HEAD" },
    { label: "ESTIMATOR", value: "ESTIMATOR" },
    { label: "HUMAN_RESOURCE", value: "HUMAN_RESOURCE" },
  ];

  // Watch current role value (string)
  const selectedRole = watch("role");

  // Find the full option object for display
  const selectedRoleOption =
    roleOptions.find((opt) => opt.value === selectedRole) || null;

  const [departmentOptions, setDepartmentOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await Service.AllDepartments();
        const data = Array.isArray(res) ? res : res?.data || [];
        const options = data.map((dept: any) => ({
          label: dept.name,
          value: dept.id,
        }));
        setDepartmentOptions(options);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  return (
    <div className="w-full bg-white rounded-[2.5rem] p-6 sm:p-10 border border-black/5">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black text-black uppercase tracking-tight">
          Add New Employee
        </h2>
        <p className="text-black/60 text-sm font-bold tracking-wide mt-2">
          Onboard a new member to the organization
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8"
      >
        {/* Username */}
        <div className="space-y-2">
          <Input
            label="Username"
            type="text"
            {...register("username", { required: "Username is required" })}
            placeholder="ENTER USERNAME"
            className="w-full font-bold uppercase tracking-wide placeholder:font-normal placeholder:lowercase"
          />
          {errors.username && (
            <p className="text-red-500 text-[10px] font-black uppercase ml-1">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Input
            label="Email"
            type="email"
            {...register("email", { required: "Email is required" })}
            placeholder="employee@company.com"
            className="w-full font-bold tracking-wide placeholder:font-normal"
          />
          {errors.email && (
            <p className="text-red-500 text-[10px] font-black uppercase ml-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone & Extension */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              label="Phone"
              type="tel"
              {...register("phone", { required: "Phone number is required" })}
              placeholder="+1 XXX XXX XXXX"
              className="w-full font-bold tracking-wide placeholder:font-normal"
            />
            {errors.phone && (
              <p className="text-red-500 text-[10px] font-black uppercase ml-1">
                {errors.phone.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              label="Extension"
              type="text"
              {...register("extension")}
              placeholder="EXT"
              className="w-full font-bold uppercase tracking-wide placeholder:font-normal placeholder:lowercase"
            />
          </div>
        </div>

        {/* Names Grid */}
        <div className="grid grid-cols-3 gap-4 md:col-span-1">
          <div className="space-y-2">
            <Input
              label="First Name"
              type="text"
              {...register("firstName", { required: "Required" })}
              placeholder="FIRST"
              className="w-full font-bold uppercase tracking-wide placeholder:font-normal placeholder:lowercase"
            />
          </div>
          <div className="space-y-2">
            <Input
              label="Middle"
              type="text"
              {...register("middleName")}
              placeholder="M."
              className="w-full font-bold uppercase tracking-wide placeholder:font-normal placeholder:lowercase"
            />
          </div>
          <div className="space-y-2">
            <Input
              label="Last Name"
              type="text"
              {...register("lastName", { required: "Required" })}
              placeholder="LAST"
              className="w-full font-bold uppercase tracking-wide placeholder:font-normal placeholder:lowercase"
            />
          </div>
        </div>

        {/* Designation */}
        <div className="space-y-2">
          <Input
            label="Designation"
            type="text"
            {...register("designation", {
              required: "Designation is required",
            })}
            placeholder="e.g. Lead Developer"
            className="w-full font-bold uppercase tracking-wide placeholder:font-normal placeholder:lowercase"
          />
          {errors.designation && (
            <p className="text-red-500 text-[10px] font-black uppercase ml-1">
              {errors.designation.message}
            </p>
          )}
        </div>

        {/* Role */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-black uppercase tracking-[0.15em] ml-1">
            Role
          </label>
          <Select
            options={roleOptions}
            {...register("role")}
            value={selectedRoleOption?.value}
            onChange={(_, value) => setValue("role", value as string)}
            placeholder="Select role..."
            className="w-full"
          />
          {errors.role && (
            <p className="text-red-500 text-[10px] font-black uppercase ml-1">
              {errors.role.message}
            </p>
          )}
        </div>

        {/* Department */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-black uppercase tracking-[0.15em] ml-1">
            Department
          </label>
          <Select
            options={departmentOptions}
            {...register("departmentId")}
            value={watch("departmentId")}
            onChange={(_, value) => setValue("departmentId", value as string)}
            placeholder="Select Department..."
            className="w-full"
          />
        </div>

        {/* Submit */}
        <div className="md:col-span-2 pt-10 border-t border-black/5">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-soft border flex items-center justify-center gap-3 ${isSubmitting
                ? "bg-gray-100 text-black/20 border-black/5 cursor-not-allowed"
                : "bg-green-100/80 text-black border-black hover:bg-green-200/80 active:scale-95"
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-black/20 border-t-black"></div>
                Processing...
              </>
            ) : (
              "Create Employee"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
