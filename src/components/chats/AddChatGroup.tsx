import { useForm } from "react-hook-form";
import Input from "../fields/input";
import Button from "../fields/Button";
import Service from "../../api/Service";

interface AddGroupFormValues {
  name: string;
}

interface AddChatGroupProps {
  onClose: () => void;
  onCreated?: () => void;
}

const AddChatGroup: React.FC<AddChatGroupProps> = ({ onClose, onCreated }) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AddGroupFormValues>();
  const onSubmit = async (data: AddGroupFormValues) => {
    try {
      const response = await Service.AddGroup(data);
      console.log(response);
      onCreated?.();
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-r-2xl">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">
          Create Chat Group
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-600 hover:text-gray-900 transition"
        >
          Close
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Group Name"
            type="text"
            {...register("name", { required: true })}
            placeholder="Group Name"
          />
          <Button type="submit" disabled={isSubmitting}>
            Create
          </Button>
        </form>
        
      </div>
    </div>
  );
};

export default AddChatGroup;
