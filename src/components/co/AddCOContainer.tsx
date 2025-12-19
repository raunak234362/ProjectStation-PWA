import { useState } from "react";
import AddCO from "./AddCO";
import CoTable from "./CoTable";

interface AddCOContainerProps {
  project?: any;
}

const AddCOContainer = ({ project }: AddCOContainerProps) => {
  const [createdCO, setCreatedCO] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      {!createdCO ? (
        <AddCO
          project={project}
          // CHECK THIS LINE: It must be passed here
          onSuccess={(co) => setCreatedCO(co)} 
        />
      ) : (
        <CoTable coId={createdCO.id || createdCO._id} />
      )}
    </div>
  );
};

export default AddCOContainer;