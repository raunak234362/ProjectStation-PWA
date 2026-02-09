import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Service from "../../../api/Service";
import {
  Loader2,
  AlertCircle,
  FileText,
  Link2,
  MapPin,
  Calendar,
  Briefcase,
  ExternalLink,
  LayoutDashboard,
} from "lucide-react";
import Button from "../../fields/Button";
import { openFileSecurely } from "../../../utils/openFileSecurely";
import type { ConnectionDesigner, ProjectData } from "../../../interface";
import EditConnectionDesigner from "./EditConnectionDesigner";
import { AllCDEngineer } from "../..";
import GetProjectById from "../../project/GetProjectById";
import CDProjectDashboard from "../components/CDProjectDashboard";

interface GetConnectionDesignerByIDProps {
  id: string;
}

const GetConnectionDesignerByID = ({ id }: GetConnectionDesignerByIDProps) => {
  const [designer, setDesigner] = useState<ConnectionDesigner | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModel, setEditModel] = useState<ConnectionDesigner | null>(null);
  const [engineerModel, setEngineerModel] = useState<ConnectionDesigner | null>(
    null,
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"insights" | "dashboard">("insights");

  const fetchData = async () => {
    if (!id) {
      setError("Invalid Connection Designer ID");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const [designerRes, projectsRes] = await Promise.all([
        Service.FetchConnectionDesignerByID(id),
        Service.GetAllProjects()
      ]);

      let designerData = designerRes?.data || null;
      if (designerData && typeof designerData.state === "string") {
        try {
          designerData.state = JSON.parse(designerData.state);
        } catch {
          designerData.state = [designerData.state];
        }
      }

      const allProjects = Array.isArray(projectsRes) ? projectsRes : (projectsRes?.data || []);
      const associatedProjects = allProjects.filter((p: any) => p.connectionDesignerID === id);

      setDesigner(designerData);
      setProjects(associatedProjects);
    } catch (err) {
      console.error("Error fetching Designer data:", err);
      setError("Failed to load designer intelligence");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-IN", { dateStyle: "medium" });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
        <p className="text-sm font-medium animate-pulse">
          Synchronizing designer data...
        </p>
      </div>
    );

  if (error || !designer)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <AlertCircle className="w-10 h-10 mb-4" />
        <p className="font-semibold">
          {error || "Connection Designer not found"}
        </p>
      </div>
    );

  return (
    <div className="space-y-8 pb-10">
      {/* Header with Edit Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 dark:border-slate-800 pb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-green-100 dark:shadow-none shrink-0 group-hover:scale-105 transition-transform">
            {designer.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
              {designer.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-green-500 dark:text-green-400" /> Since{" "}
                {formatDate(designer.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-green-500 dark:text-green-400" />{" "}
                {designer.location || "Global"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-inner backdrop-blur-sm overflow-hidden">
          <button
            onClick={() => setActiveTab("insights")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "insights"
              ? "bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-md"
              : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
              }`}
          >
            <Briefcase size={14} />
            Insights
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "dashboard"
              ? "bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-md"
              : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
              }`}
          >
            <LayoutDashboard size={14} />
            Dashboard
          </button>
        </div>
      </div>

      {activeTab === "insights" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Designer Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Insurance Liability Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft border border-gray-100 dark:border-slate-800 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                    <FileText size={20} />
                  </div>
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                    Insurance Liability
                  </h4>
                </div>
                <p className="text-xl font-black text-gray-800 dark:text-white tracking-tight">
                  {designer.insurenceLiability || "Not Disclosed"}
                </p>
              </div>

              {/* States/Coverage Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft border border-gray-100 dark:border-slate-800 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
                    <MapPin size={20} />
                  </div>
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                    States Coverage
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(designer.states) ? designer.states :
                    (Array.isArray(designer.state) ? designer.state : [])
                  ).length > 0 ? (
                    (Array.isArray(designer.states) ? designer.states : (designer.state || [])).map((st, i) => (
                      <span key={i} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-green-100 dark:border-green-900/30">
                        {st}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">No states listed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Associated Projects Section */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-soft border border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
                    <Briefcase size={20} />
                  </div>
                  Projects
                </h4>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="text-[10px] font-black text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 uppercase tracking-widest underline underline-offset-8"
                >
                  View Full Dashboard
                </button>
              </div>
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      className="group border border-gray-100 dark:border-slate-800 p-5 rounded-3xl hover:border-green-200 dark:hover:border-green-900/40 hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-all cursor-pointer flex justify-between items-center"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-500"></span>
                          {project.projectNumber}
                        </p>
                        <h5 className="font-black text-gray-800 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors truncate">
                          {project.name}
                        </h5>
                        <span className={`mt-3 inline-block px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${project.status === "ACTIVE"
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
                          }`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 text-gray-400 dark:text-slate-500 group-hover:text-green-600 dark:group-hover:text-green-400 transition-all shadow-sm">
                        <ExternalLink size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[40px] bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-md mb-4 text-gray-200 dark:text-slate-700">
                    <Briefcase size={48} />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">No projects assigned yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            {/* Files Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[40px] shadow-soft border border-gray-100 dark:border-slate-800">
              <h4 className="text-base font-black text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
                  <FileText size={18} />
                </div>
                Intelligence Files
              </h4>
              {Array.isArray(designer.files) && designer.files.length > 0 ? (
                <ul className="space-y-3">
                  {designer.files.map((file) => (
                    <li
                      key={file.id}
                      className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all group border border-transparent hover:border-amber-100 dark:hover:border-amber-900/30"
                    >
                      <span className="text-[10px] font-black text-gray-600 dark:text-slate-300 group-hover:text-amber-700 dark:group-hover:text-amber-400 uppercase tracking-widest truncate pr-4">{file.originalName}</span>
                      <button
                        className="shrink-0 p-2.5 bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm hover:bg-amber-600 hover:text-white dark:hover:bg-amber-500 transition-all rounded-xl"
                        onClick={() =>
                          openFileSecurely("connection-designer", id, file.id)
                        }
                      >
                        <Link2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center opacity-50">
                  <FileText size={32} className="text-gray-300 dark:text-slate-700 mb-2" />
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest italic">No documents uploaded</p>
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-green-500/20 transition-all"></div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 relative z-10">Administrative Control</h4>
              <div className="space-y-4 relative z-10">
                <Button
                  onClick={() => setEditModel(designer)}
                  className="w-full justify-start gap-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl py-5 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Briefcase size={18} className="text-slate-500" />
                  Edit Designer Info
                </Button>
                <Button
                  onClick={() => setEngineerModel(designer)}
                  className="w-full justify-start gap-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl py-5 shadow-xl shadow-green-500/20 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <LayoutDashboard size={18} />
                  Manage Workforce
                </Button>
                <Button className="w-full justify-start gap-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 rounded-2xl py-5 text-[10px] font-black uppercase tracking-widest transition-all">
                  <AlertCircle size={18} />
                  Archive Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <CDProjectDashboard
          projects={projects}
          onProjectSelect={(project) => setSelectedProjectId(project.id)}
        />
      )}

      {editModel &&
        createPortal(
          <EditConnectionDesigner
            onClose={() => setEditModel(null)}
            designerData={designer}
            onSuccess={fetchData}
          />,
          document.body,
        )}
      {engineerModel &&
        createPortal(
          <AllCDEngineer
            onClose={() => setEngineerModel(null)}
            designerData={designer}
          />,
          document.body,
        )}

      {/* Project Details Modal */}
      {selectedProjectId &&
        createPortal(
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white w-[95vw] h-[95vh] rounded-4xl shadow-3xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
                <GetProjectById
                  id={selectedProjectId}
                  close={() => setSelectedProjectId(null)}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default GetConnectionDesignerByID;
