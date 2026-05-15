import { useState, useMemo } from "react";
import DataTable, { type ExtendedColumnDef } from "../ui/table";
import type { RFQItem } from "../../interface";
import GetRFQByID from "./GetRFQByID";
import { formatDate } from "../../utils/dateUtils";
import { Search, X, CheckCircle2, List } from "lucide-react";

const AllRFQ = ({ rfq }: { rfq: RFQItem[] }) => {
  const userRole = sessionStorage.getItem("userRole");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"ALL" | "MTO" | "DETAILING" | "BOTH">("ALL");
  const [activeTab, setActiveTab] = useState<"all" | "awarded">("all");

  const isTrue = (val: any) => val === true || val === "true";

  // Premium styled columns
  const columns: ExtendedColumnDef<RFQItem>[] = [
    {
      accessorKey: "projectName",
      header: "Project Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.original.projectName}</span>
          <span className="text-[10px] text-primary font-semibold uppercase tracking-widest mt-0.5">
            RFQ #{row.original.projectNumber || 'N/A'}
          </span>
        </div>
      )
    },
    {
      id: "rfqType",
      header: "RFQ Type",
      cell: ({ row }) => {
        const r = row.original as any;
        const types = [];
        const isMTO = isTrue(r.MTOManual) || (r.MTOStickModel && r.MTOStickModel !== "" && r.MTOStickModel !== "false") || (r.MTOValue && r.MTOValue !== "" && r.MTOValue !== "false") || isTrue(r.mtoStickModelEnabled);
        const isDetailing = isTrue(r.detailingMain) || isTrue(r.detailingMisc) || isTrue(r.miscDesign) || isTrue(r.customerDesign) || isTrue(r.connectionDesign);

        if (isMTO) types.push("MTO");
        if (isDetailing) types.push("Detailing");

        return (
          <div className="flex gap-1 flex-wrap">
            {types.map(t => (
              <span
                key={t}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
                  t === 'MTO'
                    ? 'bg-purple-50 text-purple-700 border-purple-100'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                }`}
              >
                {t}
              </span>
            ))}
            {types.length === 0 && <span className="text-gray-300 font-bold tracking-widest text-[10px]">N/A</span>}
          </div>
        );
      }
    },
  ];

  if (userRole !== "CLIENT" && userRole !== "CLIENT_ADMIN" && userRole !== "CLIENT_ESTIMATOR") {
    columns.push({
      accessorKey: "fabricator",
      header: "Fabricator",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-600">
          {(row.original as any)?.fabricator?.fabName || "—"}
        </span>
      ),
    });
  }

  columns.push(
    {
      accessorKey: "sender",
      header: "Requested By",
      cell: ({ row }) => {
        const sender = row.original.sender as any;
        const name = sender ? `${sender.firstName || ""} ${sender.lastName || ""}` : "—";
        return (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700">{name}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{sender?.userType || 'N/A'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "wbtStatus",
      header: "Status",
      cell: ({ row }) => {
        const r = row.original as any;
        const status = r.wbtStatus || r.status || 'PENDING';
        const colors: Record<string, string> = {
          IN_REVIEW: 'bg-orange-100 text-black shadow-sm border border-black',
          COMPLETED: 'bg-green-100 text-black shadow-sm border border-black',
          PENDING: 'bg-gray-100 text-black/40 shadow-sm border border-black',
          RECEIVED: 'bg-blue-100 text-black shadow-sm border border-black',
          SENT: 'bg-green-100 text-black shadow-sm border border-black',
          AWARDED: 'bg-green-200 text-black shadow-sm border border-black',
          OPEN: 'bg-blue-50 text-blue-800 shadow-sm border border-black',
          CLOSED: 'bg-red-100 text-red-800 shadow-sm border border-black',
          RE_APPROVAL: 'bg-yellow-100 text-yellow-800 shadow-sm border border-black',
          REJECTED: 'bg-red-200 text-red-900 shadow-sm border border-black',
        };
        
        let label = status;
        if (status === "AWARDED") label = "Submitted By WBT";
        else if (status === "IN_REVIEW") label = "WBT Reviewing";
        else label = status.replace("_", " ");

        return (
          <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${colors[status] || colors.PENDING}`}>
            {label}
          </span>
        );
      },
    },
    {
      accessorKey: "estimationDate",
      header: "Due Date",
      cell: ({ row }) => (
        <span className="text-sm font-bold text-gray-600">
          {row.original.estimationDate ? formatDate(row.original.estimationDate) : "—"}
        </span>
      ),
    },
  );

  const filteredData = useMemo(() => {
    let data = rfq || [];

    // 1. Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(item => 
        item.projectName?.toLowerCase().includes(query) ||
        item.projectNumber?.toLowerCase().includes(query)
      );
    }

    // 2. Type filter
    if (selectedType !== "ALL") {
      data = data.filter(item => {
        const r = item as any;
        const isMTO = isTrue(r.MTOManual) || (r.MTOStickModel && r.MTOStickModel !== "" && r.MTOStickModel !== "false") || (r.MTOValue && r.MTOValue !== "" && r.MTOValue !== "false") || isTrue(r.mtoStickModelEnabled);
        const isDetailing = isTrue(r.detailingMain) || isTrue(r.detailingMisc) || isTrue(r.miscDesign) || isTrue(r.customerDesign) || isTrue(r.connectionDesign);

        if (selectedType === "MTO") return isMTO;
        if (selectedType === "DETAILING") return isDetailing;
        if (selectedType === "BOTH") return isMTO && isDetailing;
        return true;
      });
    }

    // 3. Status Tab filter
    if (activeTab === "awarded") {
      data = data.filter((item: any) => item.wbtStatus === "AWARDED" || item.status === "AWARDED");
    }

    return data;
  }, [rfq, searchQuery, selectedType, activeTab]);

  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);

  return (
    <div className="bg-[#fcfdfc] min-h-[600px] animate-in fade-in duration-700">
      {/* Premium Header Controls */}
      <div className="mb-10 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* Search Bar */}
          <div className="relative group max-w-xl flex-1 min-w-[300px]">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl blur-sm opacity-25 group-hover:opacity-40 transition-all duration-1000"></div>
            <div className="relative bg-white border border-gray-100 rounded-xl p-1 flex items-center shadow-sm hover:border-green-200 transition-colors">
              <Search className="ml-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search RFQs by project name or number..."
                className="flex-1 px-4 py-2 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 px-3 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
          {/* Type Toggle */}
          <div className="flex items-center bg-gray-50 px-3 py-1 border-2 rounded-xl border-black/5 shadow-sm">
            {['ALL', 'MTO', 'DETAILING', 'BOTH'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as any)}
                className={`px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-tight transition-all border-2 active:scale-95 ${
                  selectedType === type
                    ? 'bg-green-50 text-black border-green-700/80 shadow-sm'
                    : 'bg-gray-100 text-black border-black/10 hover:border-black/20'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {/* Status Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-100/30 rounded-2xl w-fit border border-gray-200/50">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-tight transition-all border-2 ${activeTab === "all" 
              ? "bg-green-50 text-black border-green-700/80 shadow-sm" 
              : "bg-gray-100 text-black border-black/10 hover:border-black/20"}`}
          >
            All RFQs <span className="ml-2 opacity-50">({rfq?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("awarded")}
            className={`px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-tight transition-all border-2 ${activeTab === "awarded" 
              ? "bg-green-50 text-black border-green-700/80 shadow-sm" 
              : "bg-gray-100 text-black border-black/10 hover:border-black/20"}`}
          >
            RFQ Awarded <span className="ml-2 opacity-50">({rfq?.filter((item: any) => item.wbtStatus === "AWARDED" || item.status === "AWARDED").length || 0})</span>
          </button>
        </div>

          </div>
        </div>

        
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        onRowClick={(row: any) => setSelectedRfqId(row.id || row._id)}
        pageSizeOptions={[25]}
      />
      
      {selectedRfqId && (
        <GetRFQByID id={selectedRfqId} onClose={() => setSelectedRfqId(null)} />
      )}
    </div>
  );
};

export default AllRFQ;

