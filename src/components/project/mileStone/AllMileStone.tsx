/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import Button from "../../fields/Button";
import AddMileStone from "./AddMileStone";
import Service from "../../../api/Service";
import DataTable from "../../ui/table";
import GetMilestoneByID from "./GetMilestoneByID";
import type { ColumnDef } from "@tanstack/react-table";

interface AllMileStoneProps {
  project: any;
  onUpdate?: () => void;
}

const AllMileStone = ({ project, onUpdate }: AllMileStoneProps) => {
  const [addMileStoneModal, setAddMileStoneModal] = useState(false);
  const [milestones, setMilestones] = useState<any[]>([]);

  const fetchMileStone = async () => {
    try {
      const response = await Service.GetProjectMilestoneById(project.id);
      if (response && response.data) {
        setMilestones(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMileStone();
  }, [project.id]);

  const handleOpenAddMileStone = () => setAddMileStoneModal(true);
  const handleCloseAddMileStone = () => setAddMileStoneModal(false);

  const handleSuccess = () => {
    fetchMileStone();
    if (onUpdate) onUpdate();
  };




      const columns: ColumnDef<any>[] = [
          { accessorKey: "subject", header: "Subject" },
          { accessorKey: "description", header: "Description" },
          { accessorKey: "approvalDate", header: "Approval Date" },
          { accessorKey: "status", header: "Status" },
        ];
      const handleRowClick = (row: any) => {
      const milestonesId = (row as any).id ?? (row as any).fabId ?? "";
      console.debug("Selected milestones:", milestonesId);
    };


  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={handleOpenAddMileStone} className="text-sm py-1 px-3 bg-teal-600 text-white">
          + Add Milestone
        </Button>
      </div>
        {milestones && milestones.length > 0 ? (
           <DataTable
                 columns={columns}
                 data={milestones}
                 onRowClick={handleRowClick}
                 detailComponent={GetMilestoneByID}
                 searchPlaceholder="Search projects..."
                 pageSizeOptions={[5, 10, 25]}
               />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mb-2 text-gray-300" />
            <p>No milestones added yet.</p>
          </div>
        )}

      {addMileStoneModal && (
        <AddMileStone
          projectId={project.id}
          fabricatorId={project.fabricator?.id || ""}
          onClose={handleCloseAddMileStone}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default AllMileStone;
