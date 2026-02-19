import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Service from "../../../api/Service";
import {
  Loader2,
  AlertCircle,
  FileText,
  MapPin,
  Globe,
  HardHat,
  ExternalLink,
  Calendar,
  ClipboardList,
  Search,
  RefreshCw,
  Activity,
  CheckCircle2,
  Briefcase,
  LayoutDashboard,
} from "lucide-react";
import Button from "../../fields/Button";
import type { ConnectionDesigner, ProjectData } from "../../../interface";
import { cn } from "../../../lib/utils";
import EditConnectionDesigner from "./EditConnectionDesigner";
import { AllCDEngineer } from "../..";

import RenderFiles from "../../ui/RenderFiles";
import { formatDate } from "../../../utils/dateUtils";

interface GetConnectionDesignerByIDProps {
  id: string;
  close?: () => void;
}

const DetailRow = ({ label, value, link, isExternal }: any) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
      {label}
    </span>
    {link ? (
      <a
        href={link}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-gray-900 dark:text-gray-100 hover:text-green-600 transition-colors truncate font-semibold flex items-center gap-1 group"
      >
        {value || "—"}
        {isExternal && (
          <ExternalLink
            size={10}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
      </a>
    ) : (
      <span className="text-gray-900 dark:text-gray-100 font-semibold truncate">
        {value || "—"}
      </span>
    )}
  </div>
);

const GetConnectionDesignerByID = ({
  id,
  close,
}: GetConnectionDesignerByIDProps) => {
  const [designer, setDesigner] = useState<ConnectionDesigner | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModel, setEditModel] = useState<ConnectionDesigner | null>(null);
  const [engineerModel, setEngineerModel] = useState<ConnectionDesigner | null>(
    null,
  );

  const [activeTab, setActiveTab] = useState<"insights" | "dashboard">(
    "dashboard",
  );

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
        Service.GetAllProjects(),
      ]);

      let designerData = designerRes?.data || null;
      if (designerData && typeof designerData.state === "string") {
        try {
          designerData.state = JSON.parse(designerData.state);
        } catch {
          designerData.state = [designerData.state];
        }
      }

      const allProjects = Array.isArray(projectsRes)
        ? projectsRes
        : projectsRes?.data || [];
      const associatedProjects = allProjects.filter(
        (p: any) => p.connectionDesignerID === id,
      );

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
    } else if (typeof rawState === "string") {
      try {
        const parsed = JSON.parse(rawState);
        pool = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        pool = [rawState];
      }
    }

    const result: string[] = [];
    pool.forEach((item) => {
      if (typeof item === "string") {
        item.split(/[,\n;]/).forEach((s) => {
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

  const engineerCount = designer.CDEngineers?.length || 0;

  // Replaced designerProjects with projects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeProjects = projects.filter(
    (p: any) => p.status === "ACTIVE",
  ).length;
  // Replaced undefined quotations with empty array for now
  const pendingQuotations = 0; // quotations.filter((q: any) => q.status === "PENDING").length;

  const statsCards = [
    {
      label: "Total Engineers",
      value: `${engineerCount} Engineers`,
      icon: HardHat,

      color: "green",
    },
    {
      label: "Active Projects",
      value: `${activeProjects} Projects`,
      icon: Activity,

      color: "blue",
    },
    {
      label: "Status",
      value: designer.isDeleted ? "Inactive" : "Active",
      icon: CheckCircle2,

      color: "emerald",
      isStatus: true,
    },
    {
      label: "Availability",
      value: `${states.length} States`,
      icon: Globe,
      sub: designer.location || "North America",
      color: "green",
    },
  ];

  const pendingActions = [
    {
      title: "RFI",
      count: 0,
      icon: FileText,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "SUBMITTALS",
      count: 0,
      icon: RefreshCw,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "CHANGE ORDERS",
      count: 0,
      icon: Activity,
      color: "bg-rose-50",
      iconColor: "text-rose-600",
    },
    {
      title: "RFQ",
      count: pendingQuotations,
      icon: Search,
      color: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header with Edit Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-black pb-8 pt-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-green-200 border border-black flex items-center justify-center text-black text-2xl font-black shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            {designer.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl text-gray-900 dark:text-white tracking-tight mb-1">
              {designer.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-widest text-gray-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar
                  size={13}
                  className="text-green-500 dark:text-green-400"
                />{" "}
                Since {formatDate(designer.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin
                  size={13}
                  className="text-green-500 dark:text-green-400"
                />{" "}
                {designer.location || "Global"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Tab Switcher */}
          <div className="flex bg-white p-1 rounded-2xl border border-black shadow-sm overflow-hidden h-fit">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${activeTab === "dashboard"
                ? "bg-green-100 text-black border border-black/20 shadow-sm"
                : "text-black/40 hover:text-black hover:bg-gray-50"
                }`}
            >
              <LayoutDashboard size={14} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${activeTab === "insights"
                ? "bg-green-100 text-black border border-black/20 shadow-sm"
                : "text-black/40 hover:text-black hover:bg-gray-50"
                }`}
            >
              <Briefcase size={14} />
              Files
            </button>
          </div>

          {close && (
            <button
              onClick={close}
              className="px-6 py-2 bg-rose-100 text-black border border-black rounded-xl text-[10px] uppercase font-black tracking-widest hover:bg-rose-200 transition-all shadow-sm h-fit self-center"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {activeTab === "dashboard" && (
        <>
          {/* Snapshot Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statsCards.map((card, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl border border-black transition-all group relative flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2.5 rounded-lg border border-black/5 bg-green-50 text-green-600 group-hover:scale-110 transition-transform")}>
                    <card.icon size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-black uppercase tracking-widest block">
                      {card.label}
                    </span>
                    <p className="text-[10px] font-bold text-black/40 uppercase truncate">
                      {card.sub}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h4
                    className={`text-lg font-black ${card.isStatus ? (designer.isDeleted ? "text-red-600" : "text-green-700") : "text-black"}`}
                  >
                    {card.value}
                  </h4>
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
                  <ClipboardList
                    className="text-[#6bbd45]"
                    size={22}
                    strokeWidth={2.5}
                  />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                    Pending Actions
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingActions.map((action, i) => (
                    <div
                      key={i}
                      className="flex flex-row items-center gap-4 p-4 rounded-2xl bg-[#f9fdf7] shadow-soft hover:shadow-medium transition-all group cursor-pointer"
                    >
                      <div
                        className={`p-3 rounded-xl shadow-sm ${action.color} ${action.iconColor}`}
                      >
                        <action.icon size={22} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-row gap-5 items-center min-w-0">
                        <div className="font-bold text-xs text-slate-800 uppercase tracking-tight truncate">
                          {action.title}
                        </div>
                        <div
                          className={`text-2xl font-black tracking-tight ${action.iconColor}`}
                        >
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
                  <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest">
                    Profile Details
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm font-medium">
                  <DetailRow
                    label="Principal Email"
                    value={designer.email}
                    link={`mailto:${designer.email}`}
                  />
                  <DetailRow
                    label="Digital Presence"
                    value={designer.websiteLink}
                    link={designer.websiteLink}
                    isExternal
                  />
                  <DetailRow
                    label="Secure Contact"
                    value={designer.contactInfo}
                  />
                  <DetailRow
                    label="Coverage"
                    value={
                      states.length > 0 ? states.join(", ") : "Not specified"
                    }
                  />
                </div>
              </div>
            </div>

            {/* Right Section (4 Cols) */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-soft flex flex-col min-h-[400px]">
                {/* Quick Actions Card */}
                <div className="bg-gray-50 p-8 rounded-[40px] border border-black relative overflow-hidden group">
                  <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-black mb-8 relative z-10">
                    Administrative Control
                  </h4>
                  <div className="space-y-4 relative z-10">
                    <Button
                      onClick={() => setEditModel(designer)}
                      className="w-full justify-start gap-4 bg-gray-200/50 hover:bg-gray-200 text-black border border-black rounded-2xl py-5 text-[10px] uppercase font-black tracking-widest transition-all"
                    >
                      <Briefcase size={18} className="text-black/40" />
                      Edit Designer Info
                    </Button>
                    <Button
                      onClick={() => setEngineerModel(designer)}
                      className="w-full justify-start gap-4 bg-gray-200/50 hover:bg-gray-200 text-black border border-black rounded-2xl py-5 text-[10px] uppercase font-black tracking-widest transition-all"
                    >
                      <LayoutDashboard size={18} className="text-black/40" />
                      Manage Workforce
                    </Button>
                    <Button className="w-full justify-start gap-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-500/20 rounded-2xl py-5 text-[10px] uppercase font-black tracking-widest transition-all">
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

          <div className="py-6 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setEditModel(designer)}
              className="px-6 py-2 bg-white text-black border border-black rounded-xl text-[10px] uppercase font-black tracking-widest hover:bg-gray-50 transition-all shadow-sm"
            >
              Edit
            </Button>
            <Button
              className="px-6 py-2 bg-rose-100 text-black border border-black rounded-xl text-[10px] uppercase font-black tracking-widest hover:bg-rose-200 transition-all shadow-sm"
            >
              Archive
            </Button>
            <Button
              onClick={() => setEngineerModel(designer)}
              className="px-6 py-2 bg-green-50 text-black border border-black rounded-xl text-[10px] uppercase font-black tracking-widest hover:bg-green-100 transition-all shadow-sm"
            >
              Connection Designer Engineer
            </Button>
          </div>
        </div>
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
    </div>
  );
};

export default GetConnectionDesignerByID;
