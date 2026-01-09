import React from "react";
import { X as CloseIcon } from "lucide-react";
import GetProjectById from "../../project/GetProjectById";

interface ProjectDetailsModalProps {
  project: any | null;
  onClose: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  onClose,
}) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-[80%] max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-700">Project Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-700"
          >
            <CloseIcon size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <GetProjectById id={project.id || project._id} />
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
