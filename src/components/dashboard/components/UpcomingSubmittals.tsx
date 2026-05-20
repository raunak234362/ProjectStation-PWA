import React, { useMemo, useState } from "react";
import {
  ClipboardList,
  AlertCircle,
  X,
  FileText,
  Clock,
  Search,
  Grid,
  List,
  Calendar,
  Building2,
  ChevronRight,
  DollarSign,
  Folder,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../../lib/utils";

import GetMilestoneByID from "../../project/mileStone/GetMilestoneByID";
import { formatDate } from "../../../utils/dateUtils";

interface UpcomingSubmittalsProps {
  pendingSubmittals: any[];
  invoices?: any[];
  initialTab?: "submittals" | "invoices";
  hideTabs?: boolean;
  hideHeader?: boolean;
  hideFabricator?: boolean;
  onSubmittalClick?: (submittal: any) => void;
  onInvoiceClick?: (invoice: any) => void;
}

const UpcomingSubmittals: React.FC<UpcomingSubmittalsProps> = ({
  pendingSubmittals,
  invoices = [],
  initialTab = "submittals",
  hideTabs = false,
  hideHeader = false,
  hideFabricator = false,
  onSubmittalClick,
  onInvoiceClick,
}) => {
  const [activeTab, setActiveTab] = useState<"submittals" | "invoices">(
    initialTab,
  );
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "overdue" | "pending">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const userRole = sessionStorage.getItem("userRole")?.toLowerCase();

  const isOverdue = (dateString: string) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const approvalDate = new Date(dateString);
    return approvalDate < today;
  };

  const invoiceNeedRaise = useMemo(() => {
    return invoices.filter((inv) => !inv.paymentStatus);
  }, [invoices]);

  // Filtered submittals based on search & status filter
  const filteredSubmittals = useMemo(() => {
    return pendingSubmittals.filter((submittal) => {
      const projectName = submittal.project?.name || submittal.name || "";
      const fabricatorName =
        submittal.fabricator?.fabName || submittal.fabName || "";
      const subject = submittal.subject || "";
      const stage = submittal.stage || "";

      const matchesSearch =
        projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fabricatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stage.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const overdue = isOverdue(submittal.approvalDate);
      if (statusFilter === "overdue") return overdue;
      if (statusFilter === "pending") return !overdue;
      return true;
    });
  }, [pendingSubmittals, searchQuery, statusFilter]);

  // Grouped submittals (after filtering)
  const groupedSubmittals = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    filteredSubmittals.forEach((submittal) => {
      const projectName =
        submittal.project?.name || submittal.name || "Other Projects";
      if (!groups[projectName]) {
        groups[projectName] = [];
      }
      groups[projectName].push(submittal);
    });
    return groups;
  }, [filteredSubmittals]);

  // Filtered invoices based on search
  const filteredInvoices = useMemo(() => {
    return invoiceNeedRaise.filter((invoice) => {
      const invNum = invoice.invoiceNumber || "";
      const job = invoice.jobName || "";
      const cust = invoice.customerName || "";

      return (
        invNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [invoiceNeedRaise, searchQuery]);

  // Count metrics for submittals
  const totalSubmittalsCount = pendingSubmittals.length;
  const overdueSubmittalsCount = useMemo(() => {
    return pendingSubmittals.filter((s) => isOverdue(s.approvalDate)).length;
  }, [pendingSubmittals]);
  const upcomingSubmittalsCount = totalSubmittalsCount - overdueSubmittalsCount;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 350, damping: 25 },
    },
  };

  return (
    <div className="flex flex-col h-full p-2 transition-all duration-300 bg-white">
      {/* Header section (Tabs & Quick Stats) */}
      {!hideHeader && !hideTabs && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 shrink-0">
          <div className="flex gap-2 p-1 rounded-xl self-start sm:self-auto bg-gray-100/60 border border-gray-200/50">
            <button
              onClick={() => {
                setActiveTab("submittals");
                setSearchQuery("");
              }}
              className={cn(
                "px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                activeTab === "submittals"
                  ? "bg-white text-black shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-black hover:bg-white/50",
              )}
            >
              Upcoming Submittals
            </button>
            <button
              onClick={() => {
                setActiveTab("invoices");
                setSearchQuery("");
              }}
              className={cn(
                "px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                activeTab === "invoices"
                  ? "bg-white text-black shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-black hover:bg-white/50",
              )}
            >
              Invoices
            </button>
          </div>
          <span className="px-4 py-1.5 bg-green-50 text-[#6bbd45] text-xs uppercase font-black rounded-full border border-green-100 tracking-wider">
            {activeTab === "submittals"
              ? `${pendingSubmittals.length} PENDING`
              : `${invoiceNeedRaise.length} ACTION REQ`}
          </span>
        </div>
      )}

      {!hideHeader && hideTabs && (
        <div className="flex items-center justify-between mb-6 shrink-0 ml-1">
          <h3 className="text-lg font-black text-black flex items-center gap-3 tracking-tight">
            {activeTab === "submittals" ? (
              <>
                <ClipboardList
                  size={24}
                  strokeWidth={2.5}
                  className="text-[#6bbd45]"
                />
                UPCOMING SUBMITTALS
              </>
            ) : (
              <>
                <FileText
                  size={24}
                  strokeWidth={2.5}
                  className="text-[#6bbd45]"
                />
                INVOICES
              </>
            )}
          </h3>
          <span className="px-3 py-1 bg-gray-50 text-black text-sm uppercase font-black rounded-full border border-gray-100">
            {activeTab === "submittals"
              ? `${pendingSubmittals.length} PENDING`
              : `${invoiceNeedRaise.length} ACTION REQ`}
          </span>
        </div>
      )}

      {/* Modern Controls Bar (Search, Status Filter, Grid/List layout toggle) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={
              activeTab === "submittals"
                ? "Search projects, fabricators, stages..."
                : "Search invoice numbers, jobs, customers..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#6bbd45] transition-all bg-gray-50/50 hover:bg-gray-50/80"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab Filters and View Mode Controls */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          {/* Submittals Status Quick-Filters */}
          {activeTab === "submittals" && (
            <div className="flex bg-gray-100/80 p-0.5 rounded-xl border border-gray-200/50 shrink-0">
              <button
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  statusFilter === "all"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-500 hover:text-black",
                )}
              >
                All ({totalSubmittalsCount})
              </button>
              <button
                onClick={() => setStatusFilter("overdue")}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                  statusFilter === "overdue"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-rose-600 hover:bg-rose-50/80",
                )}
              >
                Overdue ({overdueSubmittalsCount})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  statusFilter === "pending"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-emerald-600 hover:bg-emerald-50/80",
                )}
              >
                Upcoming ({upcomingSubmittalsCount})
              </button>
            </div>
          )}

          {/* Grid / List View Toggle */}
          <div className="flex bg-gray-100/80 p-0.5 rounded-xl border border-gray-200/50 shrink-0 ml-auto md:ml-0">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-white text-[#6bbd45] shadow-sm"
                  : "text-gray-500 hover:text-black",
              )}
              title="Grid Layout"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg transition-all cursor-pointer",
                viewMode === "list"
                  ? "bg-white text-[#6bbd45] shadow-sm"
                  : "text-gray-500 hover:text-black",
              )}
              title="List Layout"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 pb-4">
        <AnimatePresence mode="wait">
          {activeTab === "submittals" ? (
            filteredSubmittals.length > 0 ? (
              viewMode === "grid" ? (
                /* Submittals Grid Layout */
                <motion.div
                  key="submittals-grid"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {Object.entries(groupedSubmittals).map(
                    ([projectName, items]) => {
                      const overdueInGroup = items.filter((s) =>
                        isOverdue(s.approvalDate),
                      ).length;
                      return (
                        <motion.div
                          key={projectName}
                          variants={itemVariants}
                          className="bg-white rounded-2xl border border-gray-200/80 hover:border-gray-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
                        >
                          {/* Project Header Banner */}
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-4 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 shrink-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <Folder className="w-4.5 h-4.5 text-[#6bbd45] shrink-0" />
                              <h3
                                className="text-sm font-bold text-gray-900 uppercase tracking-wide truncate"
                                title={projectName}
                              >
                                {projectName}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {overdueInGroup > 0 && (
                                <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                                  {overdueInGroup} OVERDUE
                                </span>
                              )}
                              <span className="text-xs bg-white text-gray-800 font-bold px-2 py-0.5 rounded-md border border-gray-200">
                                {items.length}
                              </span>
                            </div>
                          </div>

                          {/* Fabricator Tag (Subheader) */}
                          {!hideFabricator && (
                            <div className="px-4 py-2 border-b border-gray-50 bg-white flex items-center gap-1.5 shrink-0">
                              <Building2 className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                                {items[0]?.fabricator?.fabName ||
                                  items[0]?.fabName ||
                                  "No Fabricator"}
                              </span>
                            </div>
                          )}

                          {/* Submittal List inside Card */}
                          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[280px] custom-scrollbar bg-gray-50/20">
                            {items.map((submittal, index) => {
                              const overdue = isOverdue(submittal.approvalDate);
                              return (
                                <button
                                  key={submittal.id || index}
                                  onClick={() => {
                                    if (onSubmittalClick) {
                                      onSubmittalClick(submittal);
                                    } else {
                                      setSelectedItem(submittal);
                                      setIsModalOpen(true);
                                    }
                                  }}
                                  className={cn(
                                    "w-full text-left flex flex-col gap-2 p-3.5 rounded-xl border transition-all duration-200 bg-white hover:bg-gray-50/50 hover:shadow-xs group cursor-pointer relative overflow-hidden",
                                    overdue
                                      ? "border-l-4 border-l-rose-500 border-gray-150"
                                      : "border-l-4 border-l-[#6bbd45] border-gray-150",
                                  )}
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <h4
                                      className={cn(
                                        "text-sm font-bold leading-tight group-hover:text-black transition-colors break-words line-clamp-2",
                                        overdue
                                          ? "text-rose-950"
                                          : "text-gray-900",
                                      )}
                                    >
                                      {submittal.subject || "No Subject"}
                                    </h4>
                                    {overdue && (
                                      <AlertCircle
                                        size={14}
                                        className="text-rose-500 shrink-0 mt-0.5"
                                      />
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                                    {/* Date Row */}
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                                      <span
                                        className={cn(
                                          "font-semibold",
                                          overdue ? "text-rose-600 font-bold" : "text-gray-600",
                                        )}
                                      >
                                        {submittal.approvalDate
                                          ? formatDate(submittal.approvalDate)
                                          : "—"}
                                      </span>
                                    </div>

                                    {/* Stage Badge */}
                                    {submittal.stage && (
                                      <span className="text-[10px] font-extrabold uppercase tracking-widest bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200">
                                        {submittal.stage}
                                      </span>
                                    )}
                                  </div>

                                  {overdue && (
                                    <span className="text-[9px] font-black text-rose-600 tracking-wider bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100/50 self-start mt-1">
                                      OVERDUE
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      );
                    },
                  )}
                </motion.div>
              ) : (
                /* Submittals List Layout (Standard classic redesigned style) */
                <motion.div
                  key="submittals-list"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {Object.entries(groupedSubmittals).map(
                    ([projectName, items]) => (
                      <motion.div
                        key={projectName}
                        variants={itemVariants}
                        className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs"
                      >
                        {/* Group Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-3.5 bg-[#6bbd45] rounded-full"></div>
                            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                              {projectName}
                            </h3>
                            <span className="text-xs bg-gray-50 text-gray-800 font-bold px-2 py-0.5 rounded border border-gray-200">
                              {items.length}
                            </span>
                          </div>
                          {!hideFabricator && (
                            <span className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full uppercase tracking-wider">
                              {items[0]?.fabricator?.fabName ||
                                items[0]?.fabName ||
                                "N/A"}
                            </span>
                          )}
                        </div>

                        {/* Rows */}
                        <div className="space-y-2.5">
                          {items.map((submittal, index) => {
                            const overdue = isOverdue(submittal.approvalDate);
                            return (
                              <button
                                key={submittal.id || index}
                                onClick={() => {
                                  if (onSubmittalClick) {
                                    onSubmittalClick(submittal);
                                  } else {
                                    setSelectedItem(submittal);
                                    setIsModalOpen(true);
                                  }
                                }}
                                className={cn(
                                  "w-full text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all bg-white hover:bg-gray-50/50 hover:shadow-xs group cursor-pointer",
                                  overdue
                                    ? "border-rose-200 border-l-4 border-l-rose-500"
                                    : "border-gray-150 border-l-4 border-l-[#6bbd45]",
                                )}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {overdue && (
                                    <AlertCircle
                                      size={16}
                                      className="text-rose-500 shrink-0"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <h4
                                      className={cn(
                                        "text-sm font-bold truncate group-hover:text-black",
                                        overdue
                                          ? "text-rose-900"
                                          : "text-gray-900",
                                      )}
                                    >
                                      {submittal.subject || "No Subject"}
                                    </h4>
                                    {overdue && (
                                      <p className="text-[10px] font-extrabold text-rose-600 tracking-wider mt-0.5">
                                        OVERDUE
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-150">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                    <span
                                      className={cn(
                                        "font-semibold",
                                        overdue
                                          ? "text-rose-600 font-bold"
                                          : "text-gray-700",
                                      )}
                                    >
                                      {submittal.approvalDate
                                        ? formatDate(submittal.approvalDate)
                                        : "—"}
                                    </span>
                                  </div>
                                  {submittal.stage && (
                                    <span className="text-xs font-bold uppercase tracking-widest bg-green-50 text-[#6bbd45] border border-green-100 px-2 py-1 rounded-lg">
                                      {submittal.stage}
                                    </span>
                                  )}
                                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors hidden sm:block" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ),
                  )}
                </motion.div>
              )
            ) : (
              /* Empty Submittals State */
              <motion.div
                key="submittals-empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30"
              >
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border border-green-100 mb-3">
                  <Clock className="w-6 h-6 text-[#6bbd45]" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                  No Upcoming Submittals Found
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  There are no submittals matching your search query or filters.
                </p>
              </motion.div>
            )
          ) : filteredInvoices.length > 0 ? (
            viewMode === "grid" ? (
              /* Invoices Grid Layout */
              <motion.div
                key="invoices-grid"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredInvoices.map((invoice, index) => (
                  <motion.div
                    key={invoice.id || index}
                    variants={itemVariants}
                    onClick={() => {
                      if (onInvoiceClick) {
                        onInvoiceClick(invoice);
                      } else {
                        setSelectedItem(invoice);
                        setIsModalOpen(true);
                      }
                    }}
                    className="group bg-white rounded-2xl border border-gray-200 hover:border-green-200 hover:shadow-md transition-all duration-300 p-5 flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden"
                  >
                    {/* Left Accent Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#6bbd45] transition-all group-hover:w-2" />

                    <div>
                      {/* Invoice ID & Date */}
                      <div className="flex justify-between items-center mb-3.5">
                        <span className="text-sm font-extrabold text-gray-900 group-hover:text-[#6bbd45] transition-colors uppercase tracking-wider">
                          {invoice.invoiceNumber || "No Number"}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="font-semibold text-gray-500">
                            {formatDate(invoice.invoiceDate)}
                          </span>
                        </div>
                      </div>

                      {/* Job & Customer Details */}
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Folder className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                              Job Name
                            </span>
                            <span className="text-xs font-semibold text-gray-700 truncate block">
                              {invoice.jobName || "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                              Customer
                            </span>
                            <span className="text-xs font-semibold text-gray-700 truncate block">
                              {invoice.customerName || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Invoice Pricing & Action Status */}
                    <div className="flex items-end justify-between pt-3 border-t border-gray-100 mt-2">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                          Amount
                        </span>
                        <span className="text-lg font-black text-gray-900 flex items-center">
                          <DollarSign className="w-4.5 h-4.5 text-gray-500 -mr-0.5 shrink-0" />
                          {invoice.totalInvoiceValue?.toLocaleString() || "0"}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0">
                        Action Required
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* Invoices List Layout */
              <motion.div
                key="invoices-list"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {filteredInvoices.map((invoice, index) => (
                  <motion.div
                    key={invoice.id || index}
                    variants={itemVariants}
                    onClick={() => {
                      if (onInvoiceClick) {
                        onInvoiceClick(invoice);
                      } else {
                        setSelectedItem(invoice);
                        setIsModalOpen(true);
                      }
                    }}
                    className="w-full p-4 rounded-xl border border-gray-200 border-l-4 border-l-[#6bbd45] bg-white hover:shadow-xs hover:border-green-200 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
                      {/* Main identification info */}
                      <div className="min-w-[120px]">
                        <h4 className="text-sm font-extrabold text-gray-900 group-hover:text-[#6bbd45] transition-colors uppercase tracking-wider">
                          {invoice.invoiceNumber || "No Number"}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(invoice.invoiceDate)}</span>
                        </div>
                      </div>

                      {/* Project info & customer */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 flex-1 min-w-0 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-4">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                            Job Name
                          </span>
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {invoice.jobName || "N/A"}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                            Customer
                          </span>
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {invoice.customerName || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price and status */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                          Amount
                        </span>
                        <p className="text-base font-black text-gray-900 flex items-center sm:justify-end">
                          <DollarSign className="w-4 h-4 text-gray-500 -mr-0.5 shrink-0" />
                          {invoice.totalInvoiceValue?.toLocaleString() || "0"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                          Action Req
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors hidden sm:block" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )
          ) : (
            /* Empty Invoices State */
            <motion.div
              key="invoices-empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30"
            >
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border border-green-100 mb-3">
                <Clock className="w-6 h-6 text-[#6bbd45]" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                {userRole === "client"
                  ? "No invoices received"
                  : "No active invoices"}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                No invoices requiring action match your search parameters.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal for Invoice/Submittal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-150 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-800">
                {activeTab === "submittals"
                  ? "Milestone Details"
                  : "Invoice Details"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedItem(null);
                }}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
              {activeTab === "submittals" ? (
                <GetMilestoneByID
                  row={selectedItem}
                  close={() => {
                    setIsModalOpen(false);
                    setSelectedItem(null);
                  }}
                />
              ) : (
                <div className="p-8 text-center text-gray-500 font-medium">
                  Invoice forms or details are not yet implemented in this view.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingSubmittals;
