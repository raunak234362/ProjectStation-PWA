import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import Service from "../../../api/Service";
import { Loader2, AlertCircle, FileText, Link2, MapPin, HardHat, Activity, CheckCircle2, Globe, RefreshCw, Search, Calendar, ExternalLink } from "lucide-react";
import Button from "../../fields/Button";
import { openFileSecurely } from "../../../utils/openFileSecurely";
import type { ConnectionDesigner } from "../../../interface";
import EditConnectionDesigner from "./EditConnectionDesigner";
import { AllCDEngineer } from "../..";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

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
  const [engineerModel, setEngineerModel] = useState<ConnectionDesigner | null>(null);

  const allProjects = useSelector((state: any) => state.projectInfo.projectData || []);
  const designerProjects = allProjects.filter((p: any) => p.connectionDesignerID === id);

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

  useEffect(() => {
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

  const colorClasses: Record<string, string> = {
    green: "border-l-green-500 text-green-600 bg-green-50",
    blue: "border-l-blue-500 text-blue-600 bg-blue-50",
    emerald: "border-l-emerald-500 text-emerald-600 bg-emerald-50",
    amber: "border-l-amber-500 text-amber-600 bg-amber-50",
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header with Edit Buttons */}
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
          <Button onClick={() => setEditModel(designer)} className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-100 transition-all active:scale-95">Edit Profile</Button>
          <Button onClick={() => setEngineerModel(designer)} className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all active:scale-95">Manage Engineers</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, idx) => (
          <div key={idx} className={`p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-start gap-4 transition-all hover:shadow-md border-l-4 ${colorClasses[card.color]?.split(' ')[0]}`}>
            <div className={`p-2 rounded-lg ${colorClasses[card.color]?.split(' ').slice(1).join(' ')}`}>
              <card.icon size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-lg font-bold text-gray-900">{card.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {pendingActions.map((action, idx) => (
          <div key={idx} className={`${action.color} p-4 rounded-xl border border-white/50 flex flex-col items-center justify-center text-center gap-2 group cursor-pointer hover:shadow-lg transition-all`}>
            <div className={`${action.iconColor} p-2 rounded-full bg-white/80 group-hover:scale-110 transition-transform`}>
              <action.icon size={18} />
            </div>
            <div>
              <p className={`text-xl font-black ${action.iconColor}`}>{action.count}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{action.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="text-green-500" size={20} />
              Company Intelligence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <DetailRow label="Primary Email" value={designer.email} />
              <DetailRow label="Phone Number" value={designer.contactInfo} />
              <DetailRow label="Office Address" value={designer.location} />
              <DetailRow label="Operating States" value={states.join(", ")} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="text-green-500" size={20} />
              Territory Distribution
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stateData.length > 0 ? stateData : [{ name: "None", value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stateData.length > 0 ? stateData : [{ name: "None", value: 1 }]).map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1">
              {states.slice(0, 5).map((s, i) => (
                <div key={s} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                    {s}
                  </span>
                  <span className="text-gray-400 font-medium">Active</span>
                </div>
              ))}
              {states.length > 5 && <p className="text-[10px] text-center text-gray-400 mt-2">+{states.length - 5} more regions</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Files Section */}
      {Array.isArray(designer.files) && designer.files.length > 0 && (
        <div className="mt-6 pt-5 border-t border-green-200">
          <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
            <FileText className="w-4 h-4" /> Files
          </h4>
          <ul className="text-gray-700 space-y-1">
            {designer.files.map((file) => (
              <li
                key={file.id}
                className="flex justify-between items-center bg-white px-3 py-2 rounded-md shadow-sm"
              >
                <span>{file.originalName}</span>
                <a
                  className="text-green-600 text-sm flex items-center gap-1 hover:underline cursor-pointer"
                  onClick={() =>
                    openFileSecurely("connection-designer", id, file.id)
                  }
                >
                  <Link2 className="w-3 h-3" /> Open
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Buttons */}
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
