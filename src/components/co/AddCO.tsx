import {useEffect, useState} from "react";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Input from "../fields/input";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import Service from "../../api/Service";
import type { changeOrdersPayload,  SelectOption} from "../../interface";
import SectionTitle from "../ui/SectionTitle";
import Select from "react-select";


const AddCO :React.FC<{project?: any}> = ({project}) => {


 const userDetail = useSelector((state: any) => state.userInfo.userDetail);
  const userRole = userDetail?.role; 
  const staff = useSelector((state: any) => state.userInfo.staffData);
  const project_id = project?.id
 

const {
    register,
    setValue,
    handleSubmit,
     control,
    reset,
  } = useForm<changeOrdersPayload>();
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);



    const recipientOptions: SelectOption[] =
    staff
      ?.filter((s: any) => ["ADMIN", "SALES"].includes(s.role))
      .map((s: any) => ({
        label: `${s.firstName} ${s.lastName}`,
        value: String(s.id),
      })) ?? [];
const onSubmit = async (data: changeOrdersPayload) => {
  console.log(data);
  
  try {
    const payload: changeOrdersPayload = {
      project: project_id,
      sender: userDetail.id,
      recipients: data.recipients,
      changeOrderNumber: data.changeOrderNumber,
      remarks: data.remarks,
      reason: data.reason,
      link: data.link,
      description,
      sentOn: new Date().toISOString(),
      isAproovedByAdmin: "PENDING",
      files,
    };

    const formData = new FormData();
    console.log(payload);
    
    

    Object.entries(payload).forEach(([key, value]) => {
      if (key === "files" && Array.isArray(value)) {
        value.forEach(file => formData.append("files", file));
      } else {
        formData.append(key, value as any);
      }
    });

    await Service.ChangeOrder(formData);

    toast.success("Change Order Submitted");
    reset();
    setDescription("");
    setFiles([]);
  } catch (err) {
    console.error(err);
    toast.error("Failed to create Change Order");
  }
};




  return (

    <div className="w-full mx-auto bg-white p-2 rounded-xl shadow">

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <SectionTitle title="Fabrication & Routing" />

       

        <Controller
  name="recipients"
  control={control}
  rules={{ required: true }}
  render={({ field }) => (
    <Select<SelectOption, false>
      placeholder="WBT Recipient *"
      options={recipientOptions}
      value={recipientOptions.find(o => o.value === field.value) ?? null}
      onChange={(option) => field.onChange(option?.value)}
    />
  )}
/>


        <SectionTitle title="Details" />

              <Input
  label="Change-Order Number "
  placeholder="Change-Order Number  "
  {...register("changeOrderNumber", { required: true })}
/>

       <Input
  label="Remarks"
  placeholder="Short remarks"
  {...register("remarks", { required: true })}
/>

<Input
  label="Reason (optional)"
  placeholder="Reason for change"
  {...register("reason")}
/>
<Input
  label="Reference Link"
  placeholder="https://..."
  {...register("link")}
/>
<textarea
  className="w-full border rounded-md p-2"
  rows={4}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Describe the change order..."
/>


        <SectionTitle title="Files" />

        <MultipleFileUpload onFilesChange={setFiles} />

        <div className="flex justify-end">
          <Button type="submit">Submit Change Order</Button>
        </div>
      </form>
    </div>
  );
};

  
export default AddCO;