import { useForm } from "react-hook-form"
import type { FabricatorPayload } from "../../../interface"
import Service from "../../../api/Service";
import { toast } from "react-toastify";



const AddFabricator = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FabricatorPayload>({
        defaultValues: {
            fabName: '',
            website: '',
            drive: '',
            files: '',
        },
    });
 
    const onSubmit = async (data: FabricatorPayload) => {
        console.log(data);
        try {
            const response = await Service.AddFabricator(data);
            console.log(response);
            
            toast.success("Fabricator creatded successfully");
        } catch (error) {
            console.log(error);
            
            toast.error("Failed to add the fabricator");
        }
    };


  return (
      <div className="max-w-4 mx-auto bg-white ">
          

    </div>
  )
}

export default AddFabricator