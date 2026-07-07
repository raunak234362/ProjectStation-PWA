import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Files } from "lucide-react";
import DataTable from "../../ui/table";
import GetSubmittalByID from "../../submittals/GetSubmittalByID";
import { formatDate } from "../../../utils/dateUtils";
import { useDispatch } from "react-redux";
import {
  incrementModalCount,
  decrementModalCount,
} from "../../../store/uiSlice";

interface SubmittalListModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
}

const SubmittalListModal: React.FC<SubmittalListModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const dispatch = useDispatch();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      dispatch(incrementModalCount());
      return () => {
        dispatch(decrementModalCount());
      };
    }
  }, [isOpen, dispatch]);

  const userRole = sessionStorage.getItem("userRole")?.toLowerCase();

  const projectOptions = React.useMemo(() => {
    const names = new Set<string>();
    data.forEach((item: any) => {
      const name = item.project?.name;
      if (name) names.add(name);
    });
    return Array.from(names).map(name => ({ value: name, label: name }));
  }, [data]);

  const recipientOptions = React.useMemo(() => {
    const names = new Set<string>();
    data.forEach((item: any) => {
      const multiple = item.multipleRecipients || [];
      const single = item.recepients || item.recipient;
      let displayRecipients = [];
      if (multiple.length > 0) {
        displayRecipients = multiple;
      } else if (single) {
        displayRecipients = [single];
      }
      displayRecipients.forEach((r: any) => {
        const fullName = `${r?.firstName || ""} ${r?.lastName || ""}`.trim();
        if (fullName) names.add(fullName);
      });
    });
    return Array.from(names).map(name => ({ value: name, label: name }));
  }, [data]);

  const stageOptions = React.useMemo(() => {
    const stages = new Set<string>();
    data.forEach((item: any) => {
      const stage = item.stage;
      if (stage) stages.add(stage);
    });
    return Array.from(stages).map(stage => ({ value: stage, label: stage }));
  }, [data]);

  const columns: any[] = [
    {
      accessorKey: "project.name",
      header: "Project Name",
      cell: ({ row }: any) => (
        <span className="font-medium text-gray-700">
          {row.original.project?.name || "N/A"}
        </span>
      ),
      enableColumnFilter: true,
      filterType: "select",
      filterOptions: projectOptions,
      filterFn: "equalsString",
    },
    {
      accessorKey: "fabricator.fabName",
      header: "Fabricator Name",
      cell: ({ row }: any) => (
        <span className="text-gray-700">
          {row.original.fabricator?.fabName || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }: any) => (
        <span className="text-gray-700">{row.original.subject || "N/A"}</span>
      ),
      enableColumnFilter: true,
      filterType: "text",
      filterFn: "includesString",
    },
    {
      accessorKey: "multipleRecipients",
      header: "Recipients",
      enableColumnFilter: true,
      filterType: "select",
      filterOptions: recipientOptions,
      filterFn: (row: any, _columnId: string, filterValue: string) => {
        if (!filterValue) return true;
        const multiple = row.original.multipleRecipients || [];
        const single = row.original.recepients || row.original.recipient;

        let displayRecipients = [];

        if (multiple.length > 0) {
          displayRecipients = multiple;
        } else if (single) {
          displayRecipients = [single];
        }

        return displayRecipients.some((r: any) => {
          const fullName = `${r?.firstName || ""} ${r?.lastName || ""}`.trim().toLowerCase();
          return fullName === filterValue.toLowerCase();
        });
      },
      cell: ({ row }: any) => {
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
              <span className="text-gray-700 font-medium text-xs">
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
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => (
        <span className="text-gray-700">{formatDate(row.original.date)}</span>
      ),
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: ({ row }: any) => (
        <span className="font-bold text-[#6bbd45] bg-[#6bbd45]/10 px-2 py-0.5 rounded-full text-[10px] uppercase border border-[#6bbd45]/20">
          {row.original.stage || "N/A"}
        </span>
      ),
      enableColumnFilter: true,
      filterType: "select",
      filterOptions: stageOptions,
      filterFn: "equalsString",
    },
    {
      accessorKey: (userRole === "client" || userRole === "client_admin") ? "status" : "wbtStatus",
      header: "Status",
      cell: ({ row }: any) => {
        const STATUS_LABELS: Record<string, string> = {
          WAITING_FOR_BFA:                    "Waiting for BFA",
          BFA_RECEIVED:                       "Back From Approval – Received",
          BFA_SENT:                           "Back From Approval – Sent",
          SUBMITTED_TO_EOR:                   "Submitted to EOR",
          RELEASE_FOR_FABRICATION:            "Release for Fabrication",
          NOT_APPROVED:                       "Not Approved",
          REVISED_RESUBMITTAL:                "Revised & Resubmitted",
          REVISED_RESUBMIT_FOR_FABRICATION:   "Revised & Resubmit for Fabrication",
          PENDING:                            "Pending",
        };

        const getStatusStyles = (k: string) => {
          switch (k) {
            case "WAITING_FOR_BFA":
              return "bg-purple-100 text-purple-700 border-purple-200";
            case "BFA_RECEIVED":
              return "bg-teal-100 text-teal-700 border-teal-200";
            case "BFA_SENT":
              return "bg-indigo-100 text-indigo-700 border-indigo-200";
            case "SUBMITTED_TO_EOR":
              return "bg-blue-100 text-blue-700 border-blue-200";
            case "RELEASE_FOR_FABRICATION":
              return "bg-green-100 text-green-700 border-green-200";
            case "NOT_APPROVED":
              return "bg-red-100 text-red-700 border-red-200";
            case "REVISED_RESUBMITTAL":
            case "REVISED_RESUBMIT_FOR_FABRICATION":
              return "bg-orange-100 text-orange-700 border-orange-200";
            case "PENDING":
              return "bg-yellow-100 text-yellow-700 border-yellow-200";
            default:
              return "bg-gray-100 text-gray-600 border-gray-200";
          }
        };

        const isConnectionDesigner = userRole === "connection_designer" ||
                                     userRole === "connection_designer_engineer" ||
                                     userRole === "connection_designer_admin";
        const isClient = userRole === "client" || userRole === "client_admin";

        const raw = isClient
          ? row.original.status || row.original.wbtStatus || "PENDING"
          : row.original.wbtStatus || row.original.status || "PENDING";
        const key = String(raw).replace(/\s+/g, "_").toUpperCase();
        const label = STATUS_LABELS[key] ?? String(raw).replace(/_/g, " ");

        if (key === "WAITING_FOR_BFA" && isConnectionDesigner) {
          return <span className="text-gray-400 font-medium">—</span>;
        }

        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(key)}`}
          >
            {label}
          </span>
        );
      },
    },
  ].filter((col) => {
    if (
      (userRole === "client" || userRole === "client_admin") &&
      col.header === "Fabricator Name"
    ) {
      return false;
    }
    return true;
  });

  const filteredData = React.useMemo(() => {
    if (userRole === "client_admin") {
      return data.filter((item: any) => item.clientResponseStatus?.toUpperCase() === "PENDING");
    }
    return data;
  }, [data, userRole]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-xl font-black text-black flex items-center gap-2 uppercase tracking-tight">
              Pending Attention on Submittals
            </h3>

          </div>
          <button
            onClick={onClose}
            className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredData.length > 0 ? (
            <>
              <DataTable
                columns={columns}
                data={filteredData}
                pageSizeOptions={[10, 25, 50]}
                onRowClick={(row) => setSelectedId(row.id)}
              />
              {selectedId && (
                <GetSubmittalByID id={selectedId} onClose={() => setSelectedId(null)} />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-slate-500">
              <Files size={48} className="mb-4 opacity-20" />
              <p>No pending submittals found.</p>
            </div>
          )}
        </div>


      </div>
    </div>,
    document.body,
  );
};

export default SubmittalListModal;
