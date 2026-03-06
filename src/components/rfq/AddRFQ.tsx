/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Input from "../fields/input";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import Service from "../../api/Service";

import type { Fabricator, SelectOption, RFQpayload } from "../../interface";

import { Loader2, Building2, Layers, Globe, Percent, Calendar } from "lucide-react";

import Select from "../fields/Select";
import Toggle from "../fields/Toggle";
import RichTextEditor from "../fields/RichTextEditor";
import { addRFQ } from "../../store/rfqSlice";
import { motion } from "motion/react";

interface AddRFQProps {
  onSuccess?: () => void;
}

const AddRFQ: React.FC<AddRFQProps> = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo?.fabricatorData,
  ) as Fabricator[];

  // const staffData = useSelector((state: any) => state.userInfo.staffData);

  // const userType =
  typeof window !== "undefined" ? sessionStorage.getItem("userType") : null;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RFQpayload>({
    defaultValues: {
      tools: "NO_PREFERENCE",
    },
  });

  const selectedFabricatorId = watch("fabricatorId");

  const [description, setDescription] = useState("");

  // --- FETCH STAFF ONCE ---
  useEffect(() => {
    const loadStaff = async () => {
      try {
        await Service.FetchEmployeeByRole("CLIENT");
      } catch (err) {
        console.error("Staff Fetch Failed:", err);
      }
    };
    loadStaff();
  }, []);

  // --- WBT RECIPIENT OPTIONS ---
  // const recipientOption: SelectOption[] =
  //   staffData
  //     ?.filter(
  //       (u: { role: string }) =>
  //         u.role === "ADMIN" ||
  //         u.role === "SALES" ||
  //         u.role === "SALES_MANAGER",
  //     )
  //     .map(
  //       (u: {
  //         firstName: string;
  //         middleName?: string;
  //         lastName: string;
  //         id: number;
  //       }) => ({
  //         label: `${u.firstName} ${u.middleName ?? ""} ${u.lastName}`,
  //         value: String(u.id),
  //       }),
  //     ) ?? [];
  // useEffect(() => {
  //   if (tools !== "OTHER") setValue("otherTool", "");
  // }, [tools, setValue]);

  // --- FABRICATOR OPTIONS ---
  const fabOptions: SelectOption[] =
    fabricators?.map((fab) => ({
      label: fab.fabName,
      value: String(fab.id),
    })) ?? [];

  const selectedFabricator = fabricators?.find(
    (fab) => String(fab.id) === String(selectedFabricatorId),
  );

  const clientOptions: SelectOption[] =
    selectedFabricator?.pointOfContact?.map((client) => ({
      label: `${client.firstName} ${client.middleName ?? ""} ${client.lastName
        }`,
      value: String(client.id),
    })) ?? [];

  // selector for the user

  const userDetail = useSelector((state: any) => state.userInfo.userDetail);
  const userRole = userDetail?.role;
  const fabricatorId = userDetail?.FabricatorPointOfContacts[0]?.id;
  console.log(userDetail);

  // --- SUBMIT ---
  const onSubmit: SubmitHandler<RFQpayload> = async (data) => {
    try {
      const basePayload = {
        projectNumber: data.projectNumber || "",
        projectName: data.projectName,
        subject: data.subject || "",
        description,
        tools: data.tools,
        location: data.location,
        bidPrice: data.bidPrice,
        estimationDate: data.estimationDate
          ? new Date(data.estimationDate).toISOString()
          : null,
        status: "IN_REVIEW",
        wbtStatus: "RECEIVED",
        connectionDesign: data.connectionDesign,
        miscDesign: data.miscDesign,
        customerDesign: data.customerDesign,
        detailingMain: data.detailingMain,
        detailingMisc: data.detailingMisc,

        files: data.files ?? [],
      };

      let payload;

      if (userRole === "CLIENT" || userRole === "CLIENT_ADMIN") {
        payload = {
          ...basePayload,
          senderId: userDetail?.id,
          fabricatorId: fabricatorId,
          recipientId: data.recipientId || "", // must exist
          salesPersonId: null, // client doesn't assign
        };
      } else {
        payload = {
          ...basePayload,
          senderId: data.senderId,
          recipientId: data.recipientId,
          fabricatorId: data.fabricatorId,
          salesPersonId: data.salesPersonId ?? null,
        };
      }

      // Convert to FormData
      const formData = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        if (key === "files" && Array.isArray(value)) {
          value.forEach((file) => formData.append("files", file));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      }

      const response = await Service.addRFQ(formData);
      const createdRFQ = response.data || response.rfq || response;

      if (createdRFQ) {
        // Enrich with form data for immediate display in the table
        const selectedFab = fabricators?.find(
          (f) => String(f.id) === String(data.fabricatorId),
        );
        const selectedSender = clientOptions?.find(
          (c) => String(c.value) === String(data.senderId),
        );

        const enrichedRFQ = {
          ...createdRFQ,
          projectName: data.projectName,
          projectNumber: data.projectNumber,
          status: "IN_REVIEW",
          estimationDate: data.estimationDate,
          tools: data.tools,
          fabricator: selectedFab || createdRFQ.fabricator,
          sender: selectedSender
            ? {
              firstName: selectedSender.label.split(" ")[0],
              lastName: selectedSender.label.split(" ").slice(1).join(" "),
            }
            : userDetail,
        };
        dispatch(addRFQ(enrichedRFQ));
      }
      toast.success("RFQ Created Successfully");
      setDescription("");
      reset();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create RFQ");
    }
  };

  const selectedFabricatorOption =
    fabOptions.find((opt) => opt.value === selectedFabricatorId) || null;

  return (
    <div className="w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden border-0 md:border md:border-black rounded-2xl md:rounded-[2.5rem] bg-white transition-all duration-500"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 md:p-10 space-y-8 md:space-y-12">
          {/* Identity & Presence */}
          <section className="space-y-6 md:space-y-8">
            <h3 className="text-[10px] text-black font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Building2 size={14} className="text-black/40" />
              RFQ Identity & Classification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              {/* FABRICATOR (HIDDEN FOR CLIENTS) */}
              {userRole !== "CLIENT" && userRole !== "CLIENT_ADMIN" && (
                <>
                  <div className="space-y-4">
                    <label className="block text-xs text-black font-black uppercase tracking-widest">
                      Fabricator Partner <span className="text-rose-500">*</span>
                    </label>

                    <Controller
                      name="fabricatorId"
                      control={control}
                      disabled={
                        userRole === "CLIENT" || userRole === "CLIENT_ADMIN"
                      }
                      rules={{ required: "Fabricator is required" }}
                      render={({ field }) => {
                        const normalizedValue =
                          field.value ??
                          selectedFabricatorOption?.value ??
                          undefined;
                        const stringValue =
                          typeof normalizedValue === "number"
                            ? String(normalizedValue)
                            : normalizedValue;
                        return (
                          <Select
                            name={field.name}
                            options={fabOptions}
                            value={stringValue}
                            className="border-black rounded-2xl h-14"
                            onChange={(_, value) => {
                              const sanitized = value ?? "";
                              field.onChange(sanitized);
                              setValue("fabricatorId", sanitized);
                            }}
                          />
                        );
                      }}
                    />
                    {errors.fabricatorId && (
                      <p className="text-[10px] text-rose-600 uppercase tracking-widest">
                        {errors.fabricatorId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs text-black font-black uppercase tracking-widest">
                      Fabricator Contact <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                      name="senderId"
                      control={control}
                      disabled={
                        userRole === "CLIENT" || userRole === "CLIENT_ADMIN"
                      }
                      rules={{ required: "Fabricator contact is required" }}
                      render={({ field }) => (
                        <Select
                          name={field.name}
                          options={clientOptions}
                          className="border-black rounded-2xl h-14"
                          value={field.value ? String(field.value) : undefined}
                          onChange={(_, value) => field.onChange(value ?? "")}
                        />
                      )}
                    />

                    {errors.senderId && (
                      <p className="text-[10px] text-rose-600 uppercase tracking-widest">
                        {errors.senderId.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* CONTACT */}
              {/* <div className="md:col-span-2">
            <label className="font-semibold text-gray-700 mb-1 block">
              WBT Point of Contact *
            </label>

            <Controller
              name="recipientId"
              control={control}
              rules={{ required: "WBT contact is required" }}
              render={({ field }) => (
                <Select
                  name={field.name}
                  options={recipientOption}
                  value={field.value ? String(field.value) : undefined}
                  onChange={(_, value) => field.onChange(value ?? "")}
                />
              )}
            />

            {errors.recipientId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.recipientId.message}
              </p>
            )}
          </div> */}

              <div className="md:col-span-2 space-y-4">
                <label className="block text-xs text-black font-black uppercase tracking-widest flex items-center gap-2">
                  <Layers size={14} className="text-black/40" />
                  Project Designation <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...register("projectName", {
                    required: "Project name is required",
                  })}
                  placeholder="e.g. SKYLINE COMMERCE CENTER PH-II"
                  className="w-full bg-white border-black rounded-2xl focus:bg-white h-14 text-sm font-black placeholder:text-black/20"
                />
                {errors.projectName && (
                  <p className="text-[10px] text-rose-600 uppercase tracking-widest">
                    {errors.projectName.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-xs text-black font-black uppercase tracking-widest">
                  Project Number
                </label>
                <Input
                  {...register("projectNumber")}
                  placeholder="JOB# 2024-X"
                  className="w-full bg-white border-black rounded-2xl focus:bg-white h-14 text-sm font-black placeholder:text-black/20"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-xs text-black font-black uppercase tracking-widest flex items-center gap-2">
                  <Globe size={14} className="text-black/40" />
                  Geographic Location
                </label>
                <Input
                  {...register("location")}
                  placeholder="HOUSTON, TX"
                  className="w-full bg-white border-black rounded-2xl focus:bg-white h-14 text-sm font-black placeholder:text-black/20"
                />
              </div>
            </div>
          </section>

          {/* Technical Specs Section */}
          <section className="space-y-6 md:space-y-8 pt-8 md:pt-10 border-t border-black/10">
            <h3 className="text-[10px] text-black font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Building2 size={14} className="text-black/40" />
              Scope of Work & Technical specs
            </h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-xs text-black font-black uppercase tracking-widest">
                  Manifest Subject
                </label>
                <Input
                  {...register("subject")}
                  placeholder="e.g. Structural Steel Detail Estimate"
                  className="w-full bg-white border-black rounded-2xl focus:bg-white h-14 text-sm font-black"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-xs text-black font-black uppercase tracking-widest">
                  Project Scope & Detailed Description
                </label>
                <div className="border border-black rounded-2xl overflow-hidden min-h-[200px] bg-white">
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Enter exhaustive project scope..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                <div className="space-y-4">
                  <label className="block text-xs text-black font-black uppercase tracking-widest">
                    Preferred Modeling Tools <span className="text-rose-500">*</span>
                  </label>
                  <Controller
                    name="tools"
                    control={control}
                    rules={{ required: "Tools selection is required" }}
                    render={({ field }) => (
                      <Select
                        name={field.name}
                        options={[
                          { label: "TEKLA", value: "TEKLA" },
                          { label: "SDS2", value: "SDS2" },
                          { label: "BOTH", value: "BOTH" },
                          { label: "NO PREFERENCE", value: "NO_PREFERENCE" },
                          { label: "OTHER", value: "OTHER" },
                        ]}
                        className="border-black rounded-2xl h-14"
                        value={field.value}
                        onChange={(_, value) => field.onChange(value ?? "")}
                      />
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-xs text-black font-black uppercase tracking-widest flex items-center gap-2">
                    <Percent size={14} className="text-black/40" />
                    Bid Price ({selectedFabricator?.currencyType || "USD"})
                  </label>
                  <Input
                    type="number"
                    {...register("bidPrice")}
                    placeholder="0.00"
                    className="w-full bg-white border-black rounded-2xl focus:bg-white h-14 text-sm font-black"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-xs text-black font-black uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} className="text-black/40" />
                    Response Due Date <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="date"
                    {...register("estimationDate", {
                      required: "Due date is required",
                    })}
                    className="w-full bg-white border-black rounded-2xl focus:bg-white h-14 text-sm font-black"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Service Matrix Section */}
          <section className="space-y-6 md:space-y-8 pt-8 md:pt-10 border-t border-black/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="text-[10px] text-black font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  Connection Design Matrix
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Toggle label="Main Design" {...register("connectionDesign")} />
                  <Toggle label="Misc Design" {...register("miscDesign")} />
                  <Toggle label="Customer Design" {...register("customerDesign")} />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] text-black font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  Detailing Deliverables
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Toggle label="Main Steel" {...register("detailingMain")} />
                  <Toggle label="Misc Steel" {...register("detailingMisc")} />
                </div>
              </div>
            </div>
          </section>

          {/* Assets Section */}
          <section className="space-y-6 md:space-y-8 pt-8 md:pt-10 border-t border-black/10">
            <h3 className="text-[10px] text-black font-black uppercase tracking-[0.2em] flex items-center gap-2">
              Project Attachments & Compliance media
            </h3>
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl border border-black shadow-sm">
              <Controller
                name="files"
                control={control}
                render={({ field }) => (
                  <MultipleFileUpload
                    onFilesChange={(files) => {
                      field.onChange(files);
                    }}
                  />
                )}
              />
            </div>
          </section>

          {/* Action Footer */}
          <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-black/10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-12 py-5 bg-green-200 text-black border border-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-green-300 transition-all shadow-medium active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Synchronizing RFQ Data...
                </>
              ) : (
                "Initiate Project RFQ"
              )}
            </button>
            <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest text-center md:text-right max-w-xs leading-relaxed">
              * By initiating this RFQ, you agree to our standard service level agreements and technical processing terms.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddRFQ;
