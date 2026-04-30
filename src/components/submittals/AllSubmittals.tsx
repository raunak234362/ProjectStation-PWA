/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Inbox, FolderKanban, Search } from "lucide-react";
import Service from "../../api/Service";
import GetSubmittalByID from "./GetSubmittalByID";

interface AllSubmittalProps {
  submittalData?: any[];
  projectId?: string;
}

const AllSubmittals = ({ submittalData, projectId }: AllSubmittalProps) => {
  const [submittals, setSubmittals] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("All");

  // Dynamically calculate only the existing stages from the current submittals
  const existingStages = Array.from(new Set(submittals.map(s => s.stage).filter(Boolean))).sort();
  const stages = ["All", ...existingStages];

  const userRole = sessionStorage.getItem("userRole")?.toUpperCase();

  const fetchSubmittals = async () => {
    try {
      setLoading(true);
      let result;

      const isSpecialRole = [
        "CLIENT",
        "CLIENT_ADMIN",
        "CONNECTION_DESIGNER_ENGINEER",
        "CONNECTION_DESIGNER_ADMIN",
      ].includes(userRole || "");

      if (projectId && isSpecialRole) {
        result = await Service.GetReceivedSubmittalByProjectId(projectId);
      } else if (userRole === "CLIENT" || userRole === "CLIENT_ADMIN") {
        result = await Service.SubmittalSent();
      } else {
        result = await Service.SubmittalRecieved();
      }

      const data = Array.isArray(result?.data) ? result.data :
        Array.isArray(result) ? result : [];

      const normalized = data.map((item: any) => ({
        ...item,
        milestone: item.mileStoneBelongsTo || item.milestone || null,
        recipient: item.recepients || null,
        sender: item.sender || null,
        createdAt: item.createdAt || item.date || null,
        statusLabel:
          item.isAproovedByAdmin === true
            ? "APPROVED"
            : item.isAproovedByAdmin === false
              ? "REJECTED"
              : "PENDING",
      }));

      setSubmittals(normalized);
    } catch (error) {
      console.error("Error fetching submittals:", error);
      setSubmittals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (submittalData && submittalData.length > 0) {
      setSubmittals(submittalData);
      setLoading(false);
    } else {
      fetchSubmittals();
    }
  }, [projectId, submittalData]);

  useEffect(() => {
    if (!submittals.length && projectId) {
      const fetchAvailableMilestones = async () => {
        try {
          const response = await Service.GetProjectMilestoneById(projectId);
          if (response && response.data) {
            setMilestones(response.data);
          }
        } catch (error) {
          console.error("Error fetching milestones for empty submittal state:", error);
        }
      };
      fetchAvailableMilestones();
    }
  }, [submittals.length, projectId]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <span className="font-bold text-black">{row.original.subject}</span>
      ),
    },

    {
      accessorKey: "sender",
      header: "Sender",
      cell: ({ row }) => {
        const s = row.original.sender;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs uppercase">
              {(s?.firstName?.[0] || "") + (s?.lastName?.[0] || "")}
            </div>
            <span className="text-black font-medium">
              {s ? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() : "—"}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "multipleRecipients",
      header: "To",
      cell: ({ row }) => {
        const multiple = row.original.multipleRecipients || [];
        const single = row.original.recepients || row.original.recipient;

        let displayRecipients = [];

        if (multiple.length > 0) {
          displayRecipients = multiple;
        } else if (single) {
          displayRecipients = [single];
        }

        if (displayRecipients.length === 0) return <span className="text-gray-400">—</span>;

        const firstRecipient = displayRecipients[0];
        const remainingCount = displayRecipients.length - 1;

        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
              <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px] uppercase">
                {(firstRecipient?.firstName?.[0] || "") + (firstRecipient?.lastName?.[0] || "")}
              </div>
              <span className="text-black font-medium text-xs">
                {`${firstRecipient?.firstName ?? ""} ${firstRecipient?.lastName ?? ""}`.trim()}
              </span>
            </div>
            {remainingCount > 0 && (
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                +{remainingCount} more
              </span>
            )}
          </div>
        );
      },
    },

    {
      accessorKey: "stage",
      header: "Stage",
      cell: ({ row }) => (
        <span className="px-2 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-md bg-blue-50 text-blue-700 border border-blue-200">
          {row.original.stage || "—"}
        </span>
      ),
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isEOR = row.original.status === true;
        return (
          <span
            className="px-2 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-md bg-gray-50 text-black border border-black/5"
          >
            {isEOR ? "Submitted to EOR" : "Pending"}
          </span>
        );
      },
    },

    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-black/60 text-xs font-bold">
          {new Date(row.original.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
          })}
        </span>
      ),
    },
  ];

  const [selectedSubmittalId, setSelectedSubmittalId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-green-500 mb-4" />
        <p className="text-black font-black uppercase tracking-widest text-xs">Accessing intelligence...</p>
      </div>
    );
  }

  if (!submittals.length) {
    if (milestones.length > 0) {
      return (
        <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 rounded-xl">
              <FolderKanban className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="text-xl font-black text-black uppercase tracking-tight">Available Milestones</h4>
              <p className="text-xs text-black/50 font-bold uppercase tracking-widest mt-0.5">
                Raise submittals for these project milestones
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map((ms, index) => (
              <div
                key={ms.id || index}
                className="group p-5 bg-gray-50 rounded-[20px] border-2 border-transparent hover:border-green-500/20 hover:bg-white transition-all duration-300 cursor-default"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-green-600 font-black text-xs shadow-sm">
                    {index + 1}
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-lg border uppercase tracking-wider ${ms.status === "APPROVED" || ms.status === "COMPLETED"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}>
                    {ms.status || "PENDING"}
                  </span>
                </div>
                <h5 className="text-sm font-black text-black uppercase tracking-tight line-clamp-2 min-h-[2.5rem]">
                  {ms.subject}
                </h5>
                <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center text-[10px] font-bold text-black/40 uppercase tracking-widest">
                  <span>Target</span>
                  <span className="text-black">{new Date(ms.approvalDate || ms.ApprovalDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-40 bg-white rounded-3xl border border-dashed border-gray-100 italic text-gray-400">
        <Inbox className="w-10 h-10 mb-3 text-gray-200" />
        <p className="text-lg uppercase tracking-tight">no submittal milestone raised for this project</p>
      </div>
    );
  }

  const filteredSubmittals = submittals.filter((item) => {
    const searchMatch = item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNo?.toLowerCase().includes(searchQuery.toLowerCase());
    const stageMatch = selectedStage === "All" || item.stage === selectedStage;
    return searchMatch && stageMatch;
  });

  return (
    <div className="bg-white rounded-3xl overflow-hidden flex flex-col pt-4">
      <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search submittals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6bbd45]/50 transition-all"
          />
        </div>

        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          className="w-full md:w-auto px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6bbd45]/50 transition-all cursor-pointer outline-none appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem', paddingRight: '2.5rem' }}
        >
          {stages.map((stage) => (
            <option key={stage} value={stage}>{stage === "All" ? "All Stages" : stage}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable
          columns={columns}
          data={filteredSubmittals}
          onRowClick={(row) => setSelectedSubmittalId(row.id)}
          pageSizeOptions={[10]}
          noBorder
        />
      </div>
      {selectedSubmittalId && (
        <GetSubmittalByID
          id={selectedSubmittalId}
          onClose={() => setSelectedSubmittalId(null)}
        />
      )}
    </div>
  );
};

export default AllSubmittals;
