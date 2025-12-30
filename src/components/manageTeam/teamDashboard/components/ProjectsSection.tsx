import React from "react";
import { FolderKanban, ExternalLink } from "lucide-react";

interface ProjectsSectionProps {
  projects: any[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <FolderKanban size={20} className="text-teal-600" />
          Active Projects
        </h3>
        <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full border border-teal-100">
          {projects.length} Total
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400">
          <FolderKanban size={48} className="mb-4 opacity-20" />
          <p>No active projects found for this team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-4 rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold text-gray-800 group-hover:text-teal-600 transition-colors">
                  {project.name}
                </h4>
                <ExternalLink
                  size={16}
                  className="text-gray-400 group-hover:text-teal-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    project.status === "ACTIVE"
                      ? "bg-green-50 text-green-600 border border-green-100"
                      : "bg-gray-50 text-gray-500 border border-gray-100"
                  }`}
                >
                  {project.status || "Active"}
                </span>
                <span className="text-[10px] text-gray-400">
                  ID: {project.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
