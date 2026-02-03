import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Service from "../../../api/Service";
import {
  Loader2, AlertCircle, FileText, MapPin, Globe, HardHat,
  ExternalLink, Calendar, ClipboardList,
  Search, RefreshCw, Activity, CheckCircle2
} from "lucide-react";
import Button from "../../fields/Button";
import type { ConnectionDesigner } from "../../../interface";
import EditConnectionDesigner from "./EditConnectionDesigner";
import { AllCDEngineer } from "../..";
import { AnimatePresence } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

interface GetConnectionDesignerByIDProps {
  id: string;
}

const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899",
  "#14b8a6", "#6366f1", "#ef4444", "#84cc16", "#0ea5e9",
  "#d946ef", "#f97316", "#64748b", "#a855f7",
];

const truncateText = (text: string, max: number = 40) =>
  text.length > max ? text.substring(0, max) + "..." : text;

const GetConnectionDesignerByID = ({ id }: GetConnectionDesignerByIDProps) => {
  const [designer, setDesigner] = useState<ConnectionDesigner | null>(null);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModel, setEditModel] = useState<ConnectionDesigner | null>(null);
  const [engineerModel, setEnginnerModel] = useState<ConnectionDesigner | null>(null);

  const allProjects = useSelector((state: any) => state.projectInfo.projectData || []);
  const designerProjects = allProjects.filter((p: any) => p.connectionDesignerID === id);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("Invalid Connection Designer ID");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const [designerRes, quotationsRes] = await Promise.all([
          Service.FetchConnectionDesignerByID(id),
          Service.FetchConnectionQuotationByDesignerID(id)
        ]);

        let designerData = designerRes?.data || null;
        if (designerData && typeof designerData.state === 'string') {
          try {
            designerData.state = JSON.parse(designerData.state);
          } catch {
            designerData.state = [designerData.state];
          }
        }

        setDesigner(designerData);
        setQuotations(quotationsRes?.data || []);
      } catch (err) {
        console.error("Error fetching Designer data:", err);
        setError("Failed to load designer intelligence");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-500">
      <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
      <p className="text-sm font-medium animate-pulse">Synchronizing designer data...</p>
    </div>
  );

  if (error || !designer) return (
    <div className="flex flex-col items-center justify-center py-20 text-red-500">
      <AlertCircle className="w-10 h-10 mb-4" />
      <p className="font-semibold">{error || "Connection Designer not found"}</p>
    </div>
  );

  // Data Preparation
  // Data Preparation
  const getStates = () => {
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
        // Split by comma, semicolon, or newline to handle lists correctly
        item.split(/[,\n;]/).forEach(s => {
          const trimmed = s.trim();
          if (trimmed) result.push(trimmed);
        });
      } else if (item) {
        result.push(String(item).trim());
      }
    });

    return [...new Set(result)]; // Ensure unique states
  };

  const states = getStates();
  const stateData = states.map((s: string) => ({ name: s, value: 1 }));
  const engineerCount = designer.CDEngineers?.length || 0;

  const activeProjects = designerProjects.filter((p: any) => p.status === "ACTIVE").length;
  const pendingQuotations = quotations.filter((q: any) => q.status === "PENDING").length;

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
      {/* Header with Restore Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-green-100 shrink-0">
            {designer.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">{designer.name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5"><Calendar size={13} className="text-green-500" /> Since {formatDate(designer.createdAt)}</span>
              <span className="flex items-center gap-1.5"><MapPin size={13} className="text-green-500" /> {designer.location || "Global"}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setEditModel(designer)} className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-100">Edit Profile</Button>
          <Button onClick={() => setEnginnerModel(designer)} className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Manage Engineers</Button>
        </div>
      </div>

      {/* Snapshot Snapshot Row */}
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

          {/* Pending Actions Section - MATCHING IMAGE */}
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

          {/* Designer DNA Info */}
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
          {/* State Distribution Availability Chart */}
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
                    dataKey="value"
                    stroke="none"
                  >
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
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editModel && (
          <EditConnectionDesigner onClose={() => setEditModel(null)} designerData={designer} />
        )}
        {engineerModel && (
          <AllCDEngineer onClose={() => setEnginnerModel(null)} designerData={designer} />
        )}
      </AnimatePresence>
    </div>
  );
};

// Tactical UI Components
const DetailRow = ({ label, value, link, isExternal }: { label: string; value?: string | number; link?: string; isExternal?: boolean }) => (
  <div className="group/row">
    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-0.5 group-hover/row:text-green-500 transition-colors">{label}</span>
    <div className="flex items-center gap-2">
      <p className="text-[13px] font-bold text-gray-700 break-all leading-tight">
        {link ? (
          <a href={link} target={isExternal ? "_blank" : undefined} rel="noreferrer" className="text-green-600 hover:text-green-700 underline flex items-center gap-1.5 underline-offset-2">
            {truncateText(String(value || "N/A"), 30)} {isExternal && <ExternalLink size={11} className="shrink-0" />}
          </a>
        ) : (
          value || "Not available"
        )}
      </p>
    </div>
  </div>
);

export default GetConnectionDesignerByID;
