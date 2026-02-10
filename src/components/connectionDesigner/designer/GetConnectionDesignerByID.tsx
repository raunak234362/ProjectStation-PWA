import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Service from "../../../api/Service";
import {
  Loader2, AlertCircle, FileText, MapPin, Globe, HardHat,
  ExternalLink, Calendar, ClipboardList,
  Search, RefreshCw, Activity, CheckCircle2,
  Briefcase, LayoutDashboard
} from "lucide-react";
import Button from "../../fields/Button";
import type { ConnectionDesigner, ProjectData } from "../../../interface";
import EditConnectionDesigner from "./EditConnectionDesigner";
import { AllCDEngineer } from "../..";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import RenderFiles from "../../ui/RenderFiles";

interface GetConnectionDesignerByIDProps {
  id: string;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const DetailRow = ({ label, value, link, isExternal }: any) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{label}</span>
    {link ? (
      <a
        href={link}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-gray-900 dark:text-gray-100 hover:text-green-600 transition-colors truncate font-semibold flex items-center gap-1 group"
      >
        {value || "—"}
        {isExternal && <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
      </a>
    ) : (
      <span className="text-gray-900 dark:text-gray-100 font-semibold truncate">{value || "—"}</span>
    )}
  </div>
);

const GetConnectionDesignerByID = ({ id }: GetConnectionDesignerByIDProps) => {
  const [designer, setDesigner] = useState<ConnectionDesigner | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModel, setEditModel] = useState<ConnectionDesigner | null>(null);
  const [engineerModel, setEngineerModel] = useState<ConnectionDesigner | null>(
    null,
  );

  const [activeTab, setActiveTab] = useState<"insights" | "dashboard">("dashboard");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  // Data Preparation
  const getStates = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawState = (designer as any).state;
    let pool: string[] = [];

    if (Array.isArray(rawState)) {
      pool = rawState;
    } else if (typeof rawState === 'string') {
      try {
        const parsed = JSON.parse(rawState);
        pool = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        pool = [rawState];
      }
    }

    const result: string[] = [];
    pool.forEach(item => {
      if (typeof item === 'string') {
        item.split(/[,\n;]/).forEach(s => {
          const trimmed = s.trim();
          if (trimmed) result.push(trimmed);
        });
      } else if (item) {
        result.push(String(item).trim());
      }
    });

    return [...new Set(result)];
  };

  const states = getStates();
  const stateData = states.map((s: string) => ({ name: s, value: 1 }));
  const engineerCount = designer.CDEngineers?.length || 0;

  // Replaced designerProjects with projects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeProjects = projects.filter((p: any) => p.status === "ACTIVE").length;
  // Replaced undefined quotations with empty array for now
  const pendingQuotations = 0; // quotations.filter((q: any) => q.status === "PENDING").length;

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-IN", { dateStyle: "medium" });

  const statsCards = [
    { label: "Execution Power", value: `${engineerCount} Engineers`, icon: HardHat, sub: "Live resource pool", color: "green" },
    { label: "Active Pipeline", value: `${activeProjects} Projects`, icon: Activity, sub: "Currently in progress", color: "blue" },
    { label: "Status", value: designer.isDeleted ? "Inactive" : "Active", icon: CheckCircle2, sub: "Operational cycle", color: "emerald", isStatus: true },
    { label: "Availability", value: `${states.length} States`, icon: Globe, sub: designer.location || "North America", color: "amber" },
  ];

  const pendingActions = [
    { title: "RFI", count: 0, icon: FileText, color: "bg-amber-50", iconColor: "text-amber-600" },
    { title: "SUBMITTALS", count: 0, icon: RefreshCw, color: "bg-purple-50", iconColor: "text-purple-600" },
    { title: "CHANGE ORDERS", count: 0, icon: Activity, color: "bg-rose-50", iconColor: "text-rose-600" },
    { title: "RFQ", count: pendingQuotations, icon: Search, color: "bg-cyan-50", iconColor: "text-cyan-600" },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header with Edit Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 dark:border-slate-800 pb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-2xl  shadow-lg shadow-green-100 dark:shadow-none shrink-0 group-hover:scale-105 transition-transform">
            {designer.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl  text-gray-900 dark:text-white tracking-tight mb-1">
              {designer.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-[10px]  uppercase tracking-widest text-gray-500 dark:text-slate-400">
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
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs  uppercase tracking-widest transition-all ${activeTab === "dashboard"
              ? "bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-md"
              : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
              }`}
          >
            <LayoutDashboard size={14} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs  uppercase tracking-widest transition-all ${activeTab === "insights"
              ? "bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-md"
              : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
              }`}
          >
            <Briefcase size={14} />
            Files
          </button>
        </div>
      </div>

      {activeTab === "dashboard" && (
        <>
          {/* Snapshot Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statsCards.map((card, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft hover:shadow-medium transition-all group overflow-hidden relative">
                <div className="relative z-10 flex flex-col justify-between h-full min-h-[80px]">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{card.label}</span>
                    <card.icon size={20} className={`text-${card.color}-600 opacity-60 group-hover:opacity-100 transition-opacity`} />
                  </div>
                  <div>
                    <h4 className={`text-xl font-black ${card.isStatus ? (designer.isDeleted ? "text-red-600" : "text-green-700") : "text-gray-800"}`}>
                      {card.value}
                    </h4>
                    <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase truncate">{card.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Section (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Pending Actions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
                  <ClipboardList className="text-[#6bbd45]" size={22} strokeWidth={2.5} />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Pending Actions</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingActions.map((action, i) => (
                    <div key={i} className="flex flex-row items-center gap-4 p-4 rounded-2xl bg-[#f9fdf7] shadow-soft hover:shadow-medium transition-all group cursor-pointer">
                      <div className={`p-3 rounded-xl shadow-sm ${action.color} ${action.iconColor}`}>
                        <action.icon size={22} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-row gap-5 items-center min-w-0">
                        <div className="font-bold text-xs text-slate-800 uppercase tracking-tight truncate">
                          {action.title}
                        </div>
                        <div className={`text-2xl font-black tracking-tight ${action.iconColor}`}>
                          {action.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Details */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-soft">
                <div className="bg-gray-50/70 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <ClipboardList size={16} className="text-green-600" />
                  <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest">Profile Details</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm font-medium">
                  <DetailRow label="Principal Email" value={designer.email} link={`mailto:${designer.email}`} />
                  <DetailRow label="Digital Presence" value={designer.websiteLink} link={designer.websiteLink} isExternal />
                  <DetailRow label="Secure Contact" value={designer.contactInfo} />
                  <DetailRow label="Coverage" value={states.length > 0 ? states.join(", ") : "Not specified"} />
                </div>
              </div>
            </div>

            {/* Right Section (4 Cols) */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-soft flex flex-col min-h-[400px]">
                <div className="flex items-center gap-2 mb-6">
                  <Globe size={18} className="text-emerald-500" />
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-tighter">Availability Coverage</h3>
                </div>
                <div className="flex-1 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stateData.length > 0 ? stateData : [{ name: 'None', value: 1 }]}
                        cx="50%" cy="45%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={states.length > 4 ? 2 : 8}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        dataKey="value"
                        stroke="none"
                      >
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {stateData.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        {states.length === 0 && <Cell fill="#f3f4f6" />}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '11px' }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={120}
                        iconType="circle"
                        iconSize={6}
                        wrapperStyle={{ fontSize: '9px', fontWeight: 700, paddingTop: '20px', color: '#6b7280' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {states.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-[10px] text-gray-300 italic font-bold">No States Mapped</p>
                    </div>
                  )}
                  {states.length > 5 && <p className="text-[10px] text-center text-gray-400 mt-2">+{states.length - 5} more regions</p>}
                </div>

                {/* Quick Actions Card */}
                <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-green-500/20 transition-all"></div>
                  <h4 className="text-[10px]  uppercase tracking-[0.2em] text-slate-500 mb-8 relative z-10">Administrative Control</h4>
                  <div className="space-y-4 relative z-10">
                    <Button
                      onClick={() => setEditModel(designer)}
                      className="w-full justify-start gap-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl py-5 text-[10px]  uppercase tracking-widest transition-all"
                    >
                      <Briefcase size={18} className="text-slate-500" />
                      Edit Designer Info
                    </Button>
                    <Button
                      onClick={() => setEngineerModel(designer)}
                      className="w-full justify-start gap-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl py-5 shadow-xl shadow-green-500/20 text-[10px]  uppercase tracking-widest transition-all"
                    >
                      <LayoutDashboard size={18} />
                      Manage Workforce
                    </Button>
                    <Button className="w-full justify-start gap-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 rounded-2xl py-5 text-[10px]  uppercase tracking-widest transition-all">
                      <AlertCircle size={18} />
                      Archive Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "insights" && (
        <div className="space-y-6">
          <RenderFiles
            files={designer.files}
            table="connection-designer"
            parentId={id}
          />

          <div className="py-3 flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              onClick={() => setEditModel(designer)}
              className="py-1 px-3 text-sm sm:text-base font-semibold"
            >
              Edit
            </Button>
            <Button className="py-1 px-3 text-sm sm:text-base font-semibold bg-red-200 text-red-700 hover:bg-red-300">
              Archive
            </Button>
            <Button
              onClick={() => setEngineerModel(designer)}
              className="py-1 px-3 text-sm sm:text-base font-semibold"
            >
              Connection Designer Engineer
            </Button>
          </div>
        </div>
      )}

      {editModel && createPortal(
        <EditConnectionDesigner onClose={() => setEditModel(null)} designerData={designer} onSuccess={fetchData} />,
        document.body
      )}
      {engineerModel && createPortal(
        <AllCDEngineer onClose={() => setEngineerModel(null)} designerData={designer} />,
        document.body
      )}
    </div>
  );
};

export default GetConnectionDesignerByID;
