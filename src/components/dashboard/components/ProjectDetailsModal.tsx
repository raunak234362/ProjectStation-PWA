import React, { Suspense } from "react";
import { createPortal } from "react-dom";

const GetProjectById = React.lazy(() =>
  import("../../project/GetProjectById").then((module) => ({
    default: module.default as React.ComponentType<{ id: string; close?: () => void }>,
  }))
);

interface ProjectDetailsModalProps {
  project: any | null;
  onClose: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  onClose,
}) => {
  if (!project) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 w-[80%] max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-transparent dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="flex-1 overflow-y-auto p-4">
          <Suspense fallback={<div className="text-gray-500 dark:text-slate-400">Loading...</div>}>
            <GetProjectById id={project.id || project._id} close={onClose} />
          </Suspense>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 dark:bg-slate-700 text-white rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-slate-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProjectDetailsModal;
