/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useForm } from "react-hook-form";
import type { EmployeePayload } from "../../../interface";
import { toast } from "react-toastify";
import Button from "../../fields/Button";
import Service from "../../../api/Service";
import Input from "../../fields/input";
import Select from "../../fields/Select";
const AddEmployee: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmployeePayload>({
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      middleName: "",
      lastName: "",
      phone: "",
      designation: "",
      role: "STAFF",
      departmentId: "",
    },
  });

  const onSubmit = async (data: EmployeePayload) => {
    console.log(data);
    try {
      const response = await Service.AddEmployee(data);
      console.log(response);
      // reset();

      toast.success("Employee created successfully!");
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error("Failed to create employee");
    }
  };

  const roleOption = [
    { label: "STAFF", value: "STAFF" },
    { label: "ADMIN", value: "ADMIN" },
    { label: "OPERATION_EXECUTIVE", value: "OPERATION_EXECUTIVE" },
    { label: "PROJECT_MANAGER_OFFICER", value: "PMO" },
    { label: "DEPUTY_MANAGER", value: "Deputy Manager" },
    { label: "DEPT_MANAGER", value: "Department Manager" },
    { label: "PROJECT_MANAGER", value: "Project Manager" },
    { label: "TEAM_LEAD", value: "Team Lead" },
    { label: "SALES_MANAGER", value: "Sales Manager" },
    { label: "SALES_PERSON", value: "Sales Person" },
    { label: "SYSTEM_ADMIN", value: "System Admin" },
    { label: "ESTIMATION_HEAD", value: "Estimation Head" },
    { label: "ESTIMATOR", value: "Estimator" },
    { label: "HUMAN_RESOURCE", value: "Humar Resource" },
  ];

  return (
    <div className="w-full mx-auto bg-white rounded-xl shadow-md p-6 mt-6 border border-gray-200">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Username */}
        <div>
          <Input
            label="Username"
            type="text"
            {...register("username", { required: "Username is required" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
            placeholder="Enter username"
          />
          {errors.username && (
            <p className="text-red-500 text-xs mt-1">
              {String(errors.username.message)}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <Input
            label="Email"
            type="email"
            {...register("email", { required: "Email is required" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
            placeholder="Enter email"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {String(errors.email.message)}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Input
            label="Phone"
            type="tel"
            {...register("phone", { required: "Phone number is required" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
            placeholder="+91XXXXXXXXXX"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">
              {String(errors.phone.message)}
            </p>
          )}
        </div>

        {/* First Name */}
        <div>
          <Input
            label="First Name"
            type="text"
            {...register("firstName", { required: "First name is required" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
            placeholder="First name"
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">
              {String(errors.firstName.message)}
            </p>
          )}
        </div>

        {/* Middle Name */}
        <div>
          <Input
            label="Middle Name"
            type="text"
            {...register("middleName")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
            placeholder="Middle name"
          />
        </div>

        {/* Last Name */}
        <div>
          <Input
            label="Last Name"
            type="text"
            {...register("lastName", { required: "Last name is required" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
            placeholder="Last name"
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">
              {String(errors.lastName.message)}
            </p>
          )}
        </div>

        {/* Designation */}
        <div>
          <Input
            label="Designation"
            type="text"
            {...register("designation", {
              required: "Designation is required",
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
            placeholder="Engineer / Manager"
          />
          {errors.designation?.message && (
            <p className="text-red-500 text-xs mt-1">
              {String(errors.designation.message)}
            </p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <Select
            options={roleOption}
            value={watch("role")}
            onChange={(value: string) => setValue("role", value, { shouldValidate: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Department */}
        <div className="md:col-span-2">
          <Input
            label="Department"
            type="text"
            {...register("departmentId")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
            placeholder="Department UUID"
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end mt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
          >
            {isSubmitting ? "Creating..." : "Create Employee"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
