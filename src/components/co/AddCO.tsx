import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Input from "../fields/input";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import Service from "../../api/Service";
import type { changeOrdersPayload, SelectOption, Fabricator } from "../../interface";
import SectionTitle from "../ui/SectionTitle";
import Select from "react-select";
import RichTextEditor from "../fields/RichTextEditor";

interface AddCOProps {
  project?: any;
  onSuccess?: (co: any) => void;
}

const AddCO: React.FC<AddCOProps> = ({ project, onSuccess }) => {
  const userDetail = useSelector((state: any) => state.userInfo.userDetail);
  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo.fabricatorData,
  );
  // const staff = useSelector((state: any) => state.userInfo.staffData);

  const fabricatorID = project?.fabricatorID;

  // Match the project's fabricator and get their points of contact
  const selectedFabricator = fabricators?.find(
    (f: Fabricator) => String(f.id) === String(fabricatorID),
  );

  // Fabricator POC options (mirrors AddRFI's sender_id)
  const pocOptions: SelectOption[] =
    selectedFabricator?.pointOfContact?.map((p: any) => ({
      label: `${p.firstName} ${p.middleName ?? ""} ${p.lastName}`.replace(/\s+/g, " ").trim(),
      value: String(p.id),
    })) ?? [];

  // WBT staff options (mirrors AddRFI's recepient_id)
  // const recipientOptions: SelectOption[] =
  //   staff
  //     ?.filter((s: any) => ["ADMIN", "SALES"].includes(s.role))
  //     .map((s: any) => ({
  //       label: `${s.firstName} ${s.lastName}`,
  //       value: String(s.id),
  //     })) ?? [];

  const { register, handleSubmit, control, reset } =
    useForm<changeOrdersPayload>();
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const onSubmit = async (data: changeOrdersPayload) => {
    try {
      const formData = new FormData();
      formData.append("project", project?.id);
      formData.append("sender", userDetail.id);
      formData.append("recipients", data.recipients);
      // if (data.fabricator_contact) {
      //   formData.append("fabricator_contact", data.fabricator_contact);
      // }
      formData.append("changeOrderNumber", data.changeOrderNumber);
      formData.append("remarks", data.remarks);
      formData.append("reason", data.reason || "");
      formData.append("link", data.link || "");
      formData.append("description", description);
      formData.append("sentOn", new Date().toISOString());
      formData.append("isAproovedByAdmin", "PENDING");

      files.forEach((file) => formData.append("files", file));

      const response = await Service.ChangeOrder(formData);
      const createdCO = response.data?.data ?? response.data;

      if (createdCO) {
        toast.success("Change Order Created!");
        if (typeof onSuccess === "function") {
          onSuccess(createdCO);
        } else {
          console.error("onSuccess prop was not passed to AddCO component");
        }
      }
      reset();
      setDescription("");
      setFiles([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create Change Order");
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SectionTitle title="Fabrication & Routing" />

        {/* Two separate boxes mirroring AddRFI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BOX 1: Fabricator Contact (POC) */}
          <div>
            <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">
              Fabricator Contact
            </label>
            <Controller
              name="recipients"
              control={control}
              render={({ field }) => (
                <Select<SelectOption, false>
                  placeholder="Select Fabricator Contact"
                  options={pocOptions}
                  value={pocOptions.find((o) => o.value === field.value) ?? null}
                  onChange={(option) => field.onChange(option ? option.value : null)}
                  noOptionsMessage={() =>
                    fabricatorID
                      ? "No contacts found for this fabricator"
                      : "No fabricator linked to this project"
                  }
                />
              )}
            />
          </div>

          {/* BOX 2: WBT Recipient */}
          {/* <div>
            <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">
              WBT Contact <span className="text-red-500">*</span>
            </label>
            <Controller
              name="recipients"
              control={control}
              rules={{ required: "WBT recipient is required" }}
              render={({ field }) => (
                <Select<SelectOption, false>
                  placeholder="Select WBT Contact *"
                  options={recipientOptions}
                  value={recipientOptions.find((o) => o.value === field.value) ?? null}
                  onChange={(option) => field.onChange(option ? option.value : null)}
                />
              )}
            />
          </div> */}
        </div>

        <SectionTitle title="Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="CO Number *"
            {...register("changeOrderNumber", { required: true })}
          />
          <Input
            label="Remarks *"
            {...register("remarks", { required: true })}
          />
          <Input label="Reason" {...register("reason")} />
          <Input label="Reference Link" {...register("link")} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Detailed description..."
          />
        </div>

        <SectionTitle title="Files" />
        <MultipleFileUpload onFilesChange={setFiles} />

        <div className="flex justify-center w-full pt-4">
          <Button
            type="submit"
            className="w-full bg-green-100 border border-black hover:bg-green-200 text-black px-8 py-2 rounded-lg transition-all"
          >
            Save & Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddCO;
