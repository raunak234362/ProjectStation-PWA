import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X as CloseIcon, Filter, XCircle } from "lucide-react";
import DataTable from "../../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import { formatSeconds } from "../../../utils/timeUtils";

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
  // Early return before any hooks to avoid hook call count mismatch
  if (!isOpen) return null;

  const userRole = sessionStorage.getItem("userRole")?.toLowerCase();

  const [selectedManager, setSelectedManager] = useState<string>("");
  const [selectedFabricator, setSelectedFabricator] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [showOverrunOnly, setShowOverrunOnly] = useState<boolean>(false);

  // Extract unique values for filters
  const managers = useMemo(() => {
    const uniqueManagers = Array.from(
      new Set(
        projects
          .filter((p) => p.manager)
          .map((p) => {
            const manager = p.manager;
            const fullName =
              `${manager.firstName || ""} ${manager.middleName || ""} ${manager.lastName || ""}`.trim();
            return fullName || manager.username || "Unknown";
          }),
      ),
    ).sort();
    return uniqueManagers;
  }, [projects]);

  const fabricators = useMemo(() => {
    const uniqueFabricators = Array.from(
      new Set(
        projects
          .filter((p) => p.fabricator?.fabName)
          .map((p) => p.fabricator.fabName),
      ),
    ).sort();
    return uniqueFabricators;
  }, [projects]);

  const stages = useMemo(() => {
    const uniqueStages = Array.from(
      new Set(projects.filter((p) => p.stage).map((p) => p.stage)),
    ).sort();
    return uniqueStages;
  }, [projects]);

  // Filter projects based on selected filters
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Manager filter
      if (selectedManager) {
        const manager = project.manager;
        if (!manager) return false;
        const fullName =
          `${manager.firstName || ""} ${manager.middleName || ""} ${manager.lastName || ""}`.trim();
        const managerName = fullName || manager.username || "Unknown";
        if (managerName !== selectedManager) return false;
      }

      // Fabricator filter
      if (selectedFabricator) {
        if (project.fabricator?.fabName !== selectedFabricator) return false;
      }

      // Stage filter
      if (selectedStage) {
        if (project.stage !== selectedStage) return false;
      }

      // Overrun filter
      if (showOverrunOnly) {
        if (!project.isOverrun) return false;
      }

      return true;
    });
  }, [
    projects,
    selectedManager,
    selectedFabricator,
    selectedStage,
    showOverrunOnly,
  ]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedManager("");
    setSelectedFabricator("");
    setSelectedStage("");
    setShowOverrunOnly(false);
  };

  const hasActiveFilters =
    selectedManager || selectedFabricator || selectedStage || showOverrunOnly;

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Project Name",
      cell: ({ row }: any) => (
        <span className="font-medium text-gray-700">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "fabricator.name",
      header: "Fabricator Name",
      cell: ({ row }: any) => (
        <span className="text-gray-700">
          {row.original.fabricator?.fabName || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: ({ row }: any) => (
        <span className="text-gray-700">{row.original.stage || "N/A"}</span>
      ),
    },
    {
      accessorKey: "estimatedHours",
      header: "Est. Hours",
      cell: ({ row }: any) => (
        <span className="text-gray-700 font-medium">
          {row.original.estimatedHours || 0}h
        </span>
      ),
    },
    {
      accessorKey: "workedHours",
      header: "Worked Hours",
      cell: ({ row }: any) => (
        <span
          className={` ${
            row.original.isOverrun ? "text-red-600" : "text-green-600"
          }`}
        >
          {formatSeconds(row.original.workedSeconds || 0)}
        </span>
      ),
    },
    {
      accessorKey: "isOverrun",
      header: "Overrun",
      cell: ({ row }: any) =>
        row.original.isOverrun ? (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-md  uppercase tracking-tighter animate-pulse">
            OVERRUN
          </span>
        ) : (
          <span className="text-gray-300 text-md  uppercase">Normal</span>
        ),
    },
    {
      accessorKey: "progress",
      header: "Progress",
      cell: ({ row }: any) => {
        const estimated = row.original.estimatedHours || 0;
        const workedHours = (row.original.workedSeconds || 0) / 3600;
        const percentage =
          estimated > 0 ? Math.min((workedHours / estimated) * 100, 100) : 0;
        const actualPercentage =
          estimated > 0 ? (workedHours / estimated) * 100 : 0;
        const isOverrun = row.original.isOverrun || actualPercentage > 100;

        return (
          <div className="flex flex-col w-full min-w-[120px] gap-1.5">
            <div className="flex justify-between items-center px-0.5">
              <span
                className={`text-[10px]  uppercase tracking-tighter ${isOverrun ? "text-red-600" : "text-slate-500"}`}
              >
                {actualPercentage.toFixed(0)}% Utilized
              </span>
              {isOverrun && (
                <span className="text-[8px] bg-red-100 text-red-700 px-1 rounded  animate-pulse">
                  CRITICAL
                </span>
              )}
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden border border-gray-200/30">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isOverrun
                    ? "bg-red-500"
                    : percentage > 80
                      ? "bg-orange-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px]  uppercase tracking-widest ${
            row.original.status === "ACTIVE"
              ? "bg-green-100 text-green-700 shadow-sm shadow-green-100"
              : row.original.status === "COMPLETED"
                ? "bg-blue-100 text-blue-700 shadow-sm shadow-blue-100"
                : "bg-orange-100 text-orange-700 shadow-sm shadow-orange-100"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
  ].filter((col) => {
    if (
      (userRole === "client" || userRole === "client_admin") &&
      ["Est. Hours", "Worked Hours", "Overrun", "Progress"].includes(
        col.header as string,
      )
    ) {
      return false;
    }
    return true;
  });

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-[95vw] max-h-[90vh] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-xl  text-gray-700 dark:text-slate-100 flex items-center gap-2">
              <div
                className={`w-2 h-6 rounded-full ${
                  status.includes("ACTIVE") || status.includes("IFA")
                    ? "bg-green-500"
                    : status.includes("COMPLETED") ||
                        status.includes("IFC") ||
                        status.includes("Done")
                      ? "bg-blue-500"
                      : status.includes("ON_HOLD") ||
                          status.includes("CO#") ||
                          status.includes("On-Hold")
                        ? "bg-orange-500"
                        : "bg-gray-500"
                }`}
              ></div>
              {status.replace("_", " ")} Projects
            </h3>
            <p className="text-sm text-gray-700 dark:text-slate-400 mt-1">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-slate-200"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        {/* Filters Section */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/20">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-gray-600 dark:text-slate-400" />
            <h4 className="text-sm  text-gray-700 dark:text-slate-300 uppercase tracking-wide">
              Filters
            </h4>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-xs font-semibold transition-colors"
              >
                <XCircle size={14} />
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Manager Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
                Manager
              </label>
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200"
              >
                <option value="">All Managers</option>
                {managers.map((manager) => (
                  <option key={manager} value={manager}>
                    {manager}
                  </option>
                ))}
              </select>
            </div>

            {/* Fabricator Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
                Fabricator
              </label>
              <select
                value={selectedFabricator}
                onChange={(e) => setSelectedFabricator(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200"
              >
                <option value="">All Fabricators</option>
                {fabricators.map((fabricator) => (
                  <option key={fabricator} value={fabricator}>
                    {fabricator}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
                Stage
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200"
              >
                <option value="">All Stages</option>
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            {/* Overrun Filter */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors w-full">
                <input
                  type="checkbox"
                  checked={showOverrunOnly}
                  onChange={(e) => setShowOverrunOnly(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 dark:border-slate-600 rounded focus:ring-red-500 focus:ring-2"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                  Overrun Only
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <DataTable
            columns={columns}
            data={filteredProjects}
            onRowClick={onProjectSelect}
            pageSizeOptions={[5, 10, 25]}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 dark:bg-slate-700 text-white rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-slate-600 transition-colors shadow-lg shadow-gray-200 dark:shadow-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ProjectListModal;
