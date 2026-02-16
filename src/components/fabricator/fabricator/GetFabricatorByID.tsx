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
  X,
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
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-soft text-sm border border-gray-100 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white text-xl  shadow-lg shadow-green-100 dark:shadow-green-950/20">
            {fabricator.fabName.charAt(0)}
          </div>
          <div>
            <h3 className="text-2xl  text-gray-900 dark:text-white tracking-tight">
              {fabricator.fabName}
            </h3>
            <p className="text-[10px]  text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              Global Operations Partner
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-4 py-1.5 rounded-xl text-xs  uppercase tracking-widest ${
              fabricator.isDeleted
                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30"
            }`}
          >
            {fabricator.isDeleted ? "Archived" : "Active Pool"}
          </span>
          {close && (
            <button
              onClick={close}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-white"
              title="Close Details"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-x-8 gap-y-2 mb-8 border-b border-gray-100 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`pb-4 px-1 text-xs  uppercase tracking-widest transition-all relative ${
            activeTab === "dashboard"
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
          }`}
        >
          Executive Dashboard
          {activeTab === "dashboard" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={`pb-4 px-1 text-xs  uppercase tracking-widest transition-all relative ${
            activeTab === "details"
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
          }`}
        >
          Basic Intelligence
          {activeTab === "details" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-t-full" />
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

      {/* Buttons — MATCHING IMAGE STYLE BUT REFINED */}
      <div className="mt-10 pt-8 border-t border-gray-100 dark:border-slate-800 flex flex-wrap gap-3">
        <Button
          onClick={() => handleBranch(fabricator)}
          className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs  uppercase tracking-widest rounded-xl shadow-lg shadow-green-100 dark:shadow-none transition-all active:scale-95"
        >
          View Branches
        </Button>
        <Button
          onClick={() => handlePoc(fabricator)}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs  uppercase tracking-widest rounded-xl shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-95"
        >
          View POC
        </Button>
        <Button
          onClick={() => handleModel(fabricator)}
          className="px-6 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs  uppercase tracking-widest rounded-xl transition-all active:scale-95"
        >
          Edit Fabricator
        </Button>
        <Button
          onClick={handleArchive}
          className="px-6 py-2.5 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-xs  uppercase tracking-widest rounded-xl transition-all active:scale-95"
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
  <div className="flex flex-col gap-1 group">
    <span className="text-[10px]  text-gray-300 dark:text-slate-500 uppercase tracking-widest group-hover:text-green-500 transition-colors">
      {label}
    </span>
    <div className="flex items-center gap-2">
      {icon}
      <div className="text-[13px]  text-gray-700 dark:text-white leading-tight">
        {value}
      </div>
    </div>
  </div>
);

export default GetFabricatorByID;
