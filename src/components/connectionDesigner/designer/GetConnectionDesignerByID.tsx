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
    <span className="text-xs uppercase font-black tracking-[0.2em] text-black">
      {label}
    </span>
    {link ? (
      <a
        href={link}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-black hover:text-green-600 transition-colors truncate font-semibold flex items-center gap-1 group text-sm sm:text-lg tracking-wide"
      >
        {value || "—"}
        {isExternal && (
          <ExternalLink
            size={14}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
      </a>
    ) : (
      <span className="text-black font-semibold truncate text-sm sm:text-lg tracking-wide">
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-black/5 pb-4 pt-1 sm:pb-6 sm:pt-2">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-green-100 border border-black/10 flex items-center justify-center text-black text-lg sm:text-2xl font-black shadow-sm shrink-0">
            {designer.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-3xl font-black text-black dark:text-white tracking-widest mb-0.5 truncate uppercase">
              {designer.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-black">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-green-600" /> Since{" "}
                {formatDate(designer.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-green-600" />{" "}
                {designer.location || "Global"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Tab Switcher */}
          <div className="flex bg-gray-50/50 p-1 rounded-xl border border-black/10 shadow-sm h-10 sm:h-12 items-center overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg text-[10px] sm:text-xs uppercase font-black tracking-widest transition-all h-full shrink-0 border ${activeTab === "dashboard"
                ? "bg-green-200 text-black border-black shadow-sm"
                : "text-black/40 border-transparent hover:text-black hover:bg-white/50"
                }`}
            >
              <LayoutDashboard size={14} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg text-[10px] sm:text-xs uppercase font-black tracking-widest transition-all h-full shrink-0 border ${activeTab === "insights"
                ? "bg-green-200 text-black border-black shadow-sm"
                : "text-black/40 border-transparent hover:text-black hover:bg-white/50"
                }`}
            >
              <Briefcase size={14} />
              Files
            </button>
          </div>

          {close && (
            <button
              onClick={close}
              className="px-4 sm:px-6 py-2 bg-white text-black border border-black rounded-xl text-[10px] sm:text-xs uppercase font-black tracking-widest hover:bg-red-50 hover:text-red-600 transition-all shadow-sm h-10 sm:h-12"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {activeTab === "dashboard" && (
        <>
          {/* Snapshot Row */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {statsCards.map((card, i) => (
              <div
                key={i}
                className="bg-white p-4 sm:p-5 rounded-xl border-l-4 border-l-[#6bbd45] border border-black/10 transition-all group relative flex flex-col items-start justify-between gap-4 overflow-hidden shadow-sm"
              >
                <div className="flex items-center gap-3 w-full justify-between">
                  <div className={cn("p-2.5 sm:p-3 rounded-2xl border border-black/10 bg-white text-black group-hover:scale-105 transition-transform shrink-0 shadow-xs")}>
                    <card.icon size={22} strokeWidth={2.5} />
                  </div>
                  <div className="text-right">
                    <h4
                      className={`text-2xl sm:text-3xl font-black tracking-tighter ${card.isStatus ? (designer.isDeleted ? "text-red-600" : "text-[#6bbd45]") : "text-black"}`}
                    >
                      {card.value.split(' ')[0]}
                    </h4>
                  </div>
                </div>

                <div className="w-full">
                  <span className="text-[11px] sm:text-[12px] font-black text-black uppercase tracking-[0.2em] block">
                    {card.label}
                  </span>
                  <div className="mt-1 h-[1px] bg-black/5 w-full" />
                  <p className="text-[10px] sm:text-[11px] font-black text-black uppercase tracking-[0.2em] mt-2 leading-tight">
                    {card.sub || "Engineers"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Section (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Pending Actions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="px-6 py-5 border-b border-black/10 flex items-center gap-2 bg-gray-50/50">
                  <ClipboardList
                    className="text-[#6bbd45]"
                    size={22}
                    strokeWidth={2.5}
                  />
                  <h3 className="text-sm font-black text-black uppercase tracking-[0.2em]">
                    Pending Actions
                  </h3>
                </div>
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {pendingActions.map((action, i) => (
                    <div
                      key={i}
                      className="flex flex-row items-center gap-4 p-4 sm:p-5 rounded-xl bg-white border border-black/10 hover:border-[#6bbd45]/40 transition-all group cursor-pointer shadow-sm"
                    >
                      <div
                        className={`p-3 rounded-2xl shadow-xs bg-white border border-black/10 ${action.iconColor}`}
                      >
                        <action.icon size={22} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-row gap-3 items-center min-w-0 flex-1 justify-between">
                        <div className="font-black text-xs sm:text-sm text-black uppercase tracking-[0.2em] truncate">
                          {action.title}
                        </div>
                        <div
                          className={`text-3xl sm:text-4xl font-black tracking-tighter ${action.iconColor}`}
                        >
                          {action.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Details */}
              <div className="bg-white rounded-xl border border-black/10 overflow-hidden shadow-sm">
                <div className="bg-gray-50/70 px-5 py-3 border-b border-black/10 flex items-center gap-2">
                  <ClipboardList size={16} className="text-green-600" />
                  <h3 className="text-[11px] font-black text-black uppercase tracking-[0.25em]">
                    Profile Details
                  </h3>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs font-medium">
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
              <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm flex flex-col min-h-[400px]">
                {/* Quick Actions Card */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-black/10 relative overflow-hidden group">
                  <h4 className="text-[12px] uppercase font-black tracking-[0.3em] text-black mb-6 relative z-10">
                    Administrative Control
                  </h4>
                  <div className="space-y-4 relative z-10">
                    <Button
                      onClick={() => setEditModel(designer)}
                      className="w-full justify-start gap-4 bg-white hover:bg-gray-100 text-black border border-black/10 rounded-xl py-4 text-xs sm:text-sm uppercase font-black tracking-[0.2em] transition-all shadow-sm"
                    >
                      <Briefcase size={20} className="text-black/40" />
                      Edit Designer Info
                    </Button>
                    <Button
                      onClick={() => setEngineerModel(designer)}
                      className="w-full justify-start gap-4 bg-white hover:bg-gray-100 text-black border border-black/10 rounded-xl py-4 text-xs sm:text-sm uppercase font-black tracking-[0.2em] transition-all shadow-sm"
                    >
                      <LayoutDashboard size={20} className="text-black/40" />
                      Manage Workforce
                    </Button>
                    <Button className="w-full justify-start gap-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl py-4 text-xs sm:text-sm uppercase font-black tracking-[0.2em] transition-all">
                      <AlertCircle size={20} />
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
