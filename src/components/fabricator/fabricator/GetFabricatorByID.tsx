import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Service from "../../../api/Service";
import {
  Loader2,
  AlertCircle,
  FileText,
  Link,
  Globe,
  ExternalLink,
  Calendar,
  Clock,
  Paperclip,
} from "lucide-react";
import Button from "../../fields/Button";
import type { Fabricator } from "../../../interface";
import { openFileSecurely } from "../../../utils/openFileSecurely";
import EditFabricator from "./EditFabricator";
import { formatDateTime } from "../../../utils/dateUtils";
import AllBranches from "../branches/AllBranches";
import AllClients from "../clients/AllClients";
import FabricatorDashboard from "./FabricatorDashboard";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { incrementModalCount, decrementModalCount } from "../../../store/uiSlice";

interface GetFabricatorIDProps {
  id?: string;
  row?: Fabricator;
  close?: () => void;
}

const truncateText = (text: string, max: number = 40) =>
  text.length > max ? text.substring(0, max) + "..." : text;

const GetFabricatorByID = ({
  id: propId,
  row,
  close,
}: GetFabricatorIDProps) => {
  const id = propId || row?.id;

  if (!id) {
    return (
      <div className="flex items-center justify-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p className="">Invalid Fabricator ID</p>
      </div>
    );
  }

  const [fabricator, setFabricator] = useState<Fabricator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModel, setEditModel] = useState<Fabricator | null>(null);
  const [branch, setBranch] = useState<Fabricator | null>(null);
  const [poc, setPoc] = useState<Fabricator | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "dashboard">(
    "dashboard",
  );
  const fetchFab = async () => {
    if (!id) {
      setError("Invalid Fabricator ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await Service.GetFabricatorByID(id);
      setFabricator(response?.data || null);
    } catch (err) {
      setError("Failed to load fabricator");
      console.error("Error fetching fabricator:", err);
    } finally {
      setLoading(false);
    }
  };

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(incrementModalCount());
    return () => {
      dispatch(decrementModalCount());
    };
  }, [dispatch]);

  useEffect(() => {
    fetchFab();
  }, [id]);

  const handleModel = (fabricator: Fabricator) => {
    setEditModel(fabricator);
  };
  const handleModelClose = () => {
    setEditModel(null);
  };

  const handleBranch = (fabricator: Fabricator) => {
    setBranch(fabricator);
  };
  const handleBranchClose = () => {
    setBranch(null);
  };

  const handlePoc = (fabricator: Fabricator) => {
    setPoc(fabricator);
  };
  const handlePocClose = () => {
    setPoc(null);
  };

  const handleArchive = async () => {
    if (!fabricator) return;
    if (
      window.confirm(`Are you sure you want to archive ${fabricator.fabName}?`)
    ) {
      try {
        await Service.DeleteFabricator(fabricator.id);
        toast.success("Fabricator archived successfully");
        fetchFab();
      } catch (error) {
        toast.error("Failed to archive fabricator");
        console.error(error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-2" />
        <p className="text-sm font-medium">
          Synchronizing fabricator intelligence...
        </p>
      </div>
    );
  }

  if (error || !fabricator) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p className="">{error || "Fabricator not found"}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-black text-sm">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-10 border-b border-black pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-200 border border-black flex items-center justify-center text-black text-2xl font-black shadow-sm">
            {fabricator.fabName.charAt(0)}
          </div>
          <div>
            <h3 className="text-2xl font-black text-black tracking-tight uppercase">
              {fabricator.fabName}
            </h3>
            <p className="text-[10px] font-bold text-black/50 uppercase tracking-widest">
              Global Operations Partner
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-black shadow-sm ${fabricator.isDeleted
              ? "bg-rose-100 text-rose-900 border-rose-300"
              : "bg-green-100 text-green-900 border-green-300"
              }`}
          >
            {fabricator.isDeleted ? "Archived" : "Active Pool"}
          </span>
          {close && (
            <button
              onClick={close}
              className="px-6 py-2 bg-rose-100 text-black border border-black rounded-xl text-[10px] uppercase font-black tracking-widest hover:bg-rose-200 transition-all shadow-sm"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-x-8 gap-y-2 mb-8 border-b border-black/10">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`pb-4 px-1 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === "dashboard"
            ? "text-black"
            : "text-black/40 hover:text-black"
            }`}
        >
          Executive Dashboard
          {activeTab === "dashboard" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={`pb-4 px-1 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === "details"
            ? "text-black"
            : "text-black/40 hover:text-black"
            }`}
        >
          Basic Intelligence
          {activeTab === "details" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-t-full" />
          )}
        </button>
      </div>

      <div className="min-h-[400px]">
        {activeTab === "dashboard" ? (
          <FabricatorDashboard fabricator={fabricator} />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {fabricator.website && (
                  <InfoRow
                    label="Digital Hub"
                    value={
                      <a
                        href={fabricator.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400  hover:underline underline-offset-4"
                      >
                        {truncateText(fabricator.website, 30)}
                      </a>
                    }
                    icon={<Globe size={14} className="text-blue-500" />}
                  />
                )}
                {fabricator.drive && (
                  <InfoRow
                    label="Cloud Storage"
                    value={
                      <a
                        href={fabricator.drive}
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-600 dark:text-green-400  hover:underline underline-offset-4 flex items-center gap-1.5"
                      >
                        Open Drive <ExternalLink size={12} />
                      </a>
                    }
                    icon={<Link size={14} className="text-emerald-500" />}
                  />
                )}
              </div>

              <div className="space-y-6 bg-gray-50/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                <InfoRow
                  label="Ingested On"
                  value={formatDateTime(fabricator.createdAt)}
                  icon={<Calendar size={14} className="text-gray-400" />}
                />
                <InfoRow
                  label="Modified On"
                  value={formatDateTime(fabricator.updatedAt)}
                  icon={<Clock size={14} className="text-gray-400" />}
                />
                <InfoRow
                  label="Asset Vault"
                  value={`${Array.isArray(fabricator.files) ? fabricator.files.length : 0} Compliance Items`}
                  icon={<FileText size={14} className="text-gray-400" />}
                />
              </div>
            </div>

            {/* Files Section */}
            {Array.isArray(fabricator.files) && fabricator.files.length > 0 && (
              <div className="mt-10">
                <h4 className="text-xs  text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Paperclip size={14} className="text-green-500" /> Compliance
                  Documentation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(
                    fabricator.files as { id: string; originalName: string }[]
                  ).map((file) => (
                    <div
                      key={file.id}
                      className="flex justify-between items-center bg-gray-50/80 dark:bg-slate-800/80 p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-green-200 dark:hover:border-green-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all group"
                    >
                      <span className=" text-gray-700 dark:text-slate-300 truncate mr-4">
                        {file.originalName}
                      </span>
                      <button
                        onClick={() =>
                          openFileSecurely("fabricator", id, file.id)
                        }
                        className="p-2 bg-white dark:bg-slate-700 rounded-lg text-green-600 dark:text-green-400 shadow-sm border border-gray-100 dark:border-slate-600 hover:bg-green-600 dark:hover:bg-green-500 hover:text-white transition-all"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="mt-10 pt-8 border-t border-black/10 flex flex-wrap gap-4">
        <Button
          onClick={() => handleBranch(fabricator)}
          className="px-6 py-3 bg-green-200 text-black border border-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-green-300 transition-all shadow-sm active:scale-95"
        >
          View Branches
        </Button>
        <Button
          onClick={() => handlePoc(fabricator)}
          className="px-6 py-3 bg-white text-black border border-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          View POC
        </Button>
        <Button
          onClick={() => handleModel(fabricator)}
          className="px-6 py-3 bg-white text-black border border-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          Edit Partner
        </Button>
        <Button
          onClick={handleArchive}
          className="px-6 py-3 bg-rose-200 text-black border border-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-300 transition-all shadow-sm active:scale-95 ml-auto"
        >
          Archive Partner
        </Button>
      </div>

      {editModel &&
        createPortal(
          <EditFabricator
            fabricatorData={fabricator}
            onClose={handleModelClose}
            onSuccess={fetchFab}
          />,
          document.body,
        )}
      {branch &&
        createPortal(
          <AllBranches
            fabricator={fabricator}
            onClose={handleBranchClose}
            onSubmitSuccess={fetchFab}
          />,
          document.body,
        )}
      {poc &&
        createPortal(
          <AllClients fabricator={fabricator} onClose={handlePocClose} />,
          document.body,
        )}
    </div>
  );
};

// ✅ Reusable Info Row
const InfoRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div className="flex flex-row items-start gap-4 border-b border-black/5 pb-3 group">
    <div className="flex items-center gap-2 w-32 shrink-0">
      {icon}
      <span className="text-[10px] text-black/40 font-black uppercase tracking-widest transition-colors group-hover:text-black">
        {label}
      </span>
    </div>
    <div className="text-xs font-black text-black leading-tight flex-1 break-words">
      {value}
    </div>
  </div>
);

export default GetFabricatorByID;
