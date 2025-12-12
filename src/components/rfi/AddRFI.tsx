import {useEffect, useState} from "react";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Input from "../fields/input";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import Service from "../../api/Service";
import type { Fabricator, SelectOption, RFIPayload } from "../../interface";
import SectionTitle from "../ui/SectionTitle";
import Select from "react-select";


const AddRFI:React.FC<{project: any}> = ({project}) => {
console.log(project);

 const userDetail = useSelector((state: any) => state.userInfo.userDetail);
  const userRole = userDetail?.role; // CLIENT | ADMIN | STAFF etc.
  const fabricators = useSelector((state: any) => state.fabricatorInfo.fabricatorData);
  const staff = useSelector((state: any) => state.userInfo.staffData);
  const project_id = project?.id;
  const fabricatorID=project?.fabricatorID;
  console.log("Fabricators from Redux:", fabricators);

const {
    register,
    setValue,
    handleSubmit,
     control,
    watch,
    reset,
  } = useForm<RFIPayload>();
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
//   const fabricatorId = userDetail?.FabricatorPointOfContacts[0]?.fabricatorId;


//      const fabricatorOptions: SelectOption[] =
//     fabricators?.map((fab: Fabricator) => ({
//       label: fab.fabName,
//       value: String(fab.id),
//     })) ?? [];

//     console.log(fabricatorId);
    

//      const selectedFabricator = fabricators?.find((f: Fabricator) => String(f.id) === String(fabricatorId));
//   const pocOptions: SelectOption[] =
//     selectedFabricator?.FabricatorPointOfContacts.map((p: any) => ({
//       label: `${p.firstName} ${.middleName ?? ""}${p.lastName}`,
//       value: String(p.id),
//     })) ?? [];

// Fabricator dropdown options
const fabricatorOptions: SelectOption[] =
  fabricators?.map((fab: Fabricator) => ({
    label: fab.fabName,
    value: String(fab.id),
  })) ?? [];

// Match selected fabricator
const selectedFabricator = fabricators?.find(
  (f: Fabricator) => String(f.id) === String(fabricatorID)
);
// Correct POC mapping
const pocOptions: SelectOption[] =
  selectedFabricator?.pointOfContact?.map((p: any) => ({
   label: `${p.firstName} ${p.middleName ?? ""} ${p.lastName}`,

    value: String(p.id),
  })) ?? [];

const projectOptions: SelectOption[] =
  selectedFabricator?.project?.map((p: any) => ({
    label: p.projectName || p.name,
    value: String(p.id),
  })) ?? [];


    const recipientOptions: SelectOption[] =
    staff
      ?.filter((s: any) => ["ADMIN", "SALES"].includes(s.role))
      .map((s: any) => ({
        label: `${s.firstName} ${s.lastName}`,
        value: String(s.id),
      })) ?? [];

        const onSubmit = async (data: RFIPayload) => {
    try {
      const payload: RFIPayload = {
        ...data,
        project_id: project_id,
        fabricator_id: fabricatorID,
        recepient_id: data.recepient_id,
        sender_id: userDetail?.id, // always user
        status: true,
        isAproovedByAdmin: "PENDING",
        description,
        files,
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === "files" && Array.isArray(files)) {
          files.forEach((f) => formData.append("files", f));
        } else {
          formData.append(key, value as any);
        }
      });

      await Service.addRFI(formData);
      toast.success("RFI Submitted");
      reset();
      setDescription("");
      setFiles([]);

    } catch (err) {
      console.error(err);
      toast.error("Failed to create RFI");
    }
  };

  useEffect(() => {
  if (userRole === "CLIENT") {
    setValue("sender_id", String(userDetail?.id)); // auto-select logged-in client
  }
}, [userRole]);
useEffect(() => {
  if (userRole === "CLIENT" && selectedFabricator) {
    setValue("fabricator_id", String(selectedFabricator.id));
    setValue("sender_id", String(userDetail?.id));
  }
}, [userRole, selectedFabricator]);
useEffect(() => {
  if (userRole === "CLIENT" && projectOptions.length > 0) {
    setValue("project_id", String(projectOptions[0].value)); 
  }
}, [userRole, projectOptions]);



  return (

    <div className="w-full mx-auto bg-white p-2 rounded-xl shadow">

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <SectionTitle title="Fabrication & Routing" />

        {userRole !== "CLIENT" && (
          <>

            {/* CLIENT CONTACT */}
            <Controller
              name="sender_id"
              control={control}
              render={({ field }) => (
                <Select<SelectOption, false>
                  placeholder="Fabricator Contact"
                  options={pocOptions}
                  value={pocOptions.find((o) => o.value === field.value) ?? null}
                  onChange={(option) => field.onChange(option ? option.value : null)}
                />
              )}
            />
          </>
        )}

        {/* WBT RECIPIENT */}
        <Controller
          name="recepient_id"
          control={control}
          rules={{ required: "Recipient required" }}
          render={({ field }) => (
            <Select<SelectOption, false>
              placeholder="WBT Contact *"
              options={recipientOptions}
              value={recipientOptions.find((o) => o.value === field.value) ?? null}
              onChange={(option) => field.onChange(option ? option.value : null)}
            />
          )}
        />

        <SectionTitle title="Details" />

        <Input
          label="Subject"
          placeholder="Enter subject"
          {...register("subject", { required: true })}
        />

        <textarea
          className="w-full border rounded-md p-2"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter RFI description..."
        />

        <SectionTitle title="Files" />

        <MultipleFileUpload onFilesChange={setFiles} />

        <div className="flex justify-end">
          <Button type="submit">Submit RFI</Button>
        </div>
      </form>
    </div>
  );
};

  
export default AddRFI;