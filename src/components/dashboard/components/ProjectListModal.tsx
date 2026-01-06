import React from "react";
import { X as CloseIcon, Files } from "lucide-react";

interface ProjectListModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: string;
  projects: any[];
  onProjectSelect: (project: any) => void;
}

const ProjectListModal: React.FC<ProjectListModalProps> = ({
  isOpen,
  onClose,
  status,
  projects,
  onProjectSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <div
                className={`w-2 h-6 rounded-full ${
                  status === "ACTIVE"
                    ? "bg-green-500"
                    : status === "COMPLETED"
                    ? "bg-blue-500"
                    : "bg-orange-500"
                }`}
              ></div>
              {status.replace("_", " ")} Projects
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Showing {projects.length} projects
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {projects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-2 font-semibold">Project Name</th>
                    <th className="px-4 py-2 font-semibold">Stage</th>
                    <th className="px-4 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, index) => (
                    <tr
                      key={index}
                      className="bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl group cursor-pointer"
                      onClick={() => onProjectSelect(project)}
                    >
                      <td className="px-4 py-4 rounded-l-xl font-medium text-gray-800">
                        {project.name}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {project.stage || "N/A"}
                      </td>
                      <td className="px-4 py-4 rounded-r-xl">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            project.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : project.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Files size={48} className="mb-4 opacity-20" />
              <p>No projects found with this status.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-lg shadow-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectListModal;
