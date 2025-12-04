/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Loader2,
  AlertCircle,
  FileText,
  Link2,
  Settings,
  FolderOpenDot,
  Users,
  Clock,
  ClipboardList,
  X,
} from "lucide-react";
import Service from "../../api/Service";
import { openFileSecurely } from "../../utils/openFileSecurely";
import Button from "../fields/Button";
import type { ProjectData } from "../../interface";
import AllMileStone from "./mileStone/AllMileStone";



const GetProjectById = ({
  id
}: {
  id: string
}) => {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Service.GetProjectById(id);
      setProject(response?.data || null);
    } catch (err) {
      setError("Failed to load project details");
      console.error("Error fetching project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  if (loading)
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading project details...
      </div>
    );

  if (error || !project)
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error || "Project not found"}
      </div>
    );

  return (
    <div className="backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white h-auto overflow-y-auto p-5 md:p-6 rounded-lg shadow-lg w-full relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-3">
          <div>
            <h2 className="text-2xl font-semibold text-teal-700">{project.name}</h2>
            <p className="text-gray-500 text-sm">Project No: {project.projectNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {project.status}
            </span>
            {/* <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
            >
              <X className="w-5 h-5" />
            </button> */}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b overflow-x-auto">
          {[
            { key: "details", label: "Details", icon: ClipboardList },
            { key: "scope", label: "Design Scope", icon: Settings },
            { key: "files", label: "Files", icon: FileText },
            { key: "milestones", label: "Milestones", icon: FileText },
            { key: "team", label: "Team", icon: Users },
            { key: "timeline", label: "Timeline", icon: Clock },
            { key: "notes", label: "Notes", icon: FolderOpenDot },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-t-md font-medium ${
                activeTab === key
                  ? "bg-teal-600 text-white"
                  : "text-gray-600 hover:text-teal-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-2">
          {/* ✅ Details */}
          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <InfoRow label="Department" value={project.department?.name || "—"} />
                <InfoRow label="Team" value={project.team?.name || "—"} />
                <InfoRow
                  label="Manager"
                  value={
                    project.manager
                      ? `${project.manager.firstName} ${project.manager.lastName} (${project.manager.username})`
                      : "—"
                  }
                />
                <InfoRow label="Fabricator" value={project.fabricator?.fabName || "—"} />
                <InfoRow label="Tools" value={project.tools || "—"} />
                <InfoRow label="Estimated Hours" value={project.estimatedHours || 0} />
              </div>

              <div className="space-y-3">
                <InfoRow label="Start Date" value={formatDate(project.startDate)} />
                <InfoRow label="End Date" value={formatDate(project.endDate)} />
                <InfoRow
                  label="Fabrication Date"
                  value={formatDate(project.fabricationDate)}
                />
                <InfoRow
                  label="Approval Date"
                  value={formatDate(project.approvalDate)}
                />
                <InfoRow label="Stage" value={project.stage || "—"} />
                <InfoRow label="RFQ ID" value={project.rfqId || "—"} />
              </div>

              <div className="md:col-span-2 mt-6">
                <h4 className="font-semibold text-teal-700 mb-2 flex items-center gap-1">
                  <FolderOpenDot className="w-4 h-4" /> Description
                </h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                  {project.description || "No description available."}
                </p>
              </div>
            </div>
          )}

          {/* ✅ Design Scope */}
          {activeTab === "scope" && (
            <div className="p-4 bg-gray-50 rounded-lg border text-sm">
              <h4 className="text-lg font-semibold text-teal-700 mb-3 flex items-center gap-1">
                <Settings className="w-5 h-5" /> Design Scope
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <ScopeTag label="Connection Design" active={project.connectionDesign} />
                <ScopeTag label="Misc Design" active={project.miscDesign} />
                <ScopeTag label="Customer Design" active={project.customerDesign} />
                <ScopeTag label="Detailing Main" active={project.detailingMain} />
                <ScopeTag label="Detailing Misc" active={project.detailingMisc} />
              </div>
            </div>
          )}

          {/* ✅ Files */}
          {activeTab === "files" && (
            <div>
              {Array.isArray(project.files) && project.files.length > 0 ? (
                <ul className="text-gray-700 space-y-1">
                  {project.files.map((file) => (
                    <li
                      key={file.id}
                      className="flex justify-between items-center bg-white px-3 py-2 rounded-md shadow-sm border"
                    >
                      <span>{file.originalName}</span>
                      <a
                        className="text-teal-600 text-sm flex items-center gap-1 hover:underline cursor-pointer"
                        onClick={() => openFileSecurely("project", id, file.id)}
                      >
                        <Link2 className="w-3 h-3" /> Open
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 italic">No files attached.</p>
              )}
            </div>
          )}
          {
            activeTab === "milestones" && (
              <AllMileStone project={project} onUpdate={fetchProject} />
            )
          }

          {/* ✅ Team */}
          {activeTab === "team" && (
            <div className="text-gray-700 text-sm">
              <h4 className="font-semibold text-teal-700 mb-2 flex items-center gap-1">
                <Users className="w-4 h-4" /> Assigned Team
              </h4>
              <p>Team: {project.team?.name || "No team assigned."}</p>
              <p>
                Manager:{" "}
                {project.manager
                  ? `${project.manager.firstName} ${project.manager.lastName} (${project.manager.username})`
                  : "Not assigned."}
              </p>
            </div>
          )}

          {/* ✅ Timeline */}
          {activeTab === "timeline" && (
            <div className="text-gray-600 italic text-center py-10">
              <Clock className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              Timeline view will be integrated soon.
            </div>
          )}

          {/* ✅ Notes */}
          {activeTab === "notes" && (
            <div className="text-gray-600 italic text-center py-10">
              <FolderOpenDot className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              Notes section coming soon.
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="pt-6 flex flex-wrap gap-3 border-t mt-6">
          <Button className="py-1 px-3 text-sm bg-teal-600 text-white">
            Edit Project
          </Button>
          <Button className="py-1 px-3 text-sm bg-blue-100 text-blue-700">
            View RFQ
          </Button>
          <Button className="py-1 px-3 text-sm bg-amber-100 text-amber-700">
            View Fabricator
          </Button>
          <Button className="py-1 px-3 text-sm bg-red-100 text-red-700">
            Disable Project
          </Button>
        </div>
      </div>
    </div>
  );
};

// ✅ InfoRow Component
const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between border-b border-gray-100 pb-1">
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="text-gray-900">{value}</span>
  </div>
);

// ✅ ScopeTag Component
const ScopeTag = ({ label, active }: { label: string; active: boolean }) => (
  <span
    className={`px-3 py-1 text-xs font-medium rounded-full ${
      active
        ? "bg-teal-100 text-teal-800 border border-teal-300"
        : "bg-gray-100 text-gray-500 border border-gray-200"
    }`}
  >
    {label}
  </span>
);

export default GetProjectById;
