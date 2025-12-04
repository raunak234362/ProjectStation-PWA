/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { CheckCircle, Clock } from "lucide-react";
import Button from "../../fields/Button";
import AddMileStone from "./AddMileStone";
import type { ProjectData } from "../../../interface";
import Service from "../../../api/Service";

interface AllMileStoneProps {
  project: ProjectData;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-800 border-green-200";
      case "COMPLETED": return "bg-blue-100 text-blue-800 border-blue-200";
      case "IN_PROGRESS": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-teal-700 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> Project Milestones
        </h4>
        <Button onClick={handleOpenAddMileStone} className="text-sm py-1 px-3 bg-teal-600 text-white">
          + Add Milestone
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        {milestones && milestones.length > 0 ? (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Target Date</th>
                <th className="px-4 py-3">Approval Date</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {milestones.map((milestone: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{milestone.subject}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={milestone.description}>
                    {milestone.description}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {milestone.date ? new Date(milestone.date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {milestone.approvalDate ? new Date(milestone.approvalDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(milestone.status)}`}>
                      {milestone.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mb-2 text-gray-300" />
            <p>No milestones added yet.</p>
          </div>
        )}
      </div>

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
