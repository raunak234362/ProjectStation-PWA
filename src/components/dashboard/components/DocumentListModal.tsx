import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Files, Search, FileText, Activity, RefreshCw } from "lucide-react";
import DataTable from "../../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import GetRFQByID from "../../rfq/GetRFQByID";
import GetRFIByID from "../../rfi/GetRFIByID";
import GetSubmittalByID from "../../submittals/GetSubmittalByID";
import GetCOByID from "../../co/GetCOByID";
import { formatDate } from "../../../utils/dateUtils";
import { useDispatch } from "react-redux";
import { incrementModalCount, decrementModalCount } from "../../../store/uiSlice";
import type { DocType } from "./DocumentsOverviewCard";

interface DocumentListModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: DocType;
    data: any[];
}

const DocumentListModal: React.FC<DocumentListModalProps> = ({
    isOpen,
    onClose,
    type,
    data,
}) => {
    const dispatch = useDispatch();
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            dispatch(incrementModalCount());
            return () => {
                dispatch(decrementModalCount());
            };
        }
    }, [isOpen, dispatch]);

    // Reset selection when modal closes or type changes
    useEffect(() => {
        setSelectedId(null);
        setSelectedProjectId(null);
    }, [isOpen, type]);

    const getTitle = () => {
        switch (type) {
            case "ALL_RFQ": return "All RFQs";
            case "ALL_RFI": return "All RFIs";
            case "ALL_SUBMITTALS": return "All Submittals";
            case "ALL_COR": return "All Change Orders";
        }
    };

    const getIcon = () => {
        switch (type) {
            case "ALL_RFQ": return <Search size={22} />;
            case "ALL_RFI": return <FileText size={22} />;
            case "ALL_SUBMITTALS": return <RefreshCw size={22} />;
            case "ALL_COR": return <Activity size={22} />;
        }
    };

    const getColumns = (): ColumnDef<any>[] => {
        switch (type) {
            case "ALL_RFQ":
                return [
                    { accessorKey: "projectName", header: "Project Name" },
                    { accessorKey: "projectNumber", header: "RFQ #" },
                    {
                        accessorKey: "status",
                        header: "Status",
                        cell: ({ row }) => (
                            <span className="px-3 py-1 text-xs uppercase tracking-widest rounded-lg bg-gray-100 text-black border border-gray-200">
                                {row.original.status?.replace(/_/g, " ") ?? "—"}
                            </span>
                        ),
                    },
                    {
                        accessorKey: "estimationDate",
                        header: "Due Date",
                        cell: ({ row }) =>
                            row.original.estimationDate
                                ? formatDate(row.original.estimationDate)
                                : "—",
                    },
                ];

            case "ALL_RFI":
                return [
                    { accessorKey: "subject", header: "Subject" },
                    {
                        accessorKey: "sender",
                        header: "Sender",
                        cell: ({ row }) => {
                            const s = row.original.sender;
                            if (!s) return "—";
                            return (
                                [s.firstName, s.middleName, s.lastName]
                                    .filter(Boolean)
                                    .join(" ") ||
                                s.username ||
                                s.email ||
                                "—"
                            );
                        },
                    },
                    {
                        accessorKey: "isAproovedByAdmin",
                        header: "Status",
                        cell: ({ row }) => (
                            <span className="px-3 py-1 text-xs uppercase tracking-widest rounded-lg bg-gray-100 text-black border border-gray-200">
                                {row.original.isAproovedByAdmin ?? "PENDING"}
                            </span>
                        ),
                    },
                    {
                        accessorKey: "date",
                        header: "Date",
                        cell: ({ row }) =>
                            row.original.date ? formatDate(row.original.date) : "—",
                    },
                ];

            case "ALL_SUBMITTALS":
                return [
                    {
                        accessorKey: "project.name",
                        header: "Project Name",
                        cell: ({ row }) => row.original.project?.name ?? "N/A",
                    },
                    { accessorKey: "subject", header: "Subject" },
                    {
                        accessorKey: "stage",
                        header: "Stage",
                        cell: ({ row }) => (
                            <span className="font-bold text-[#6bbd45] bg-[#6bbd45]/10 px-2 py-0.5 rounded-full text-[10px] uppercase border border-[#6bbd45]/20">
                                {row.original.stage ?? "—"}
                            </span>
                        ),
                    },
                    {
                        accessorKey: "date",
                        header: "Date",
                        cell: ({ row }) =>
                            row.original.date ? formatDate(row.original.date) : "—",
                    },
                ];

            case "ALL_COR":
                return [
                    { accessorKey: "changeOrderNumber", header: "CO Number" },
                    { accessorKey: "remarks", header: "Remarks" },
                    {
                        accessorKey: "isAproovedByAdmin",
                        header: "Status",
                        cell: ({ row }) => {
                            const val = row.original.isAproovedByAdmin;
                            const label =
                                val === true ? "APPROVED" : val === false ? "REJECTED" : "PENDING";
                            return (
                                <span className="px-3 py-1 text-xs uppercase tracking-widest rounded-lg bg-gray-100 text-black border border-gray-200">
                                    {label}
                                </span>
                            );
                        },
                    },
                    {
                        accessorKey: "createdAt",
                        header: "Date",
                        cell: ({ row }) =>
                            row.original.createdAt ? formatDate(row.original.createdAt) : "—",
                    },
                ];

            default:
                return [];
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h3 className="text-xl font-black text-black flex items-center gap-2 uppercase tracking-tight">
                        {getIcon()}
                        {getTitle()}
                    </h3>
                    <button
                        onClick={onClose}
                        className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
                    >
                        Close
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {data.length > 0 ? (
                        <>
                            <DataTable
                                columns={getColumns()}
                                data={data}
                                pageSizeOptions={[25]}
                                onRowClick={(row) => {
                                    setSelectedId(row.id);
                                    if (type === "ALL_COR") {
                                        setSelectedProjectId(row.project ?? null);
                                    }
                                }}
                            />

                            {/* ── Detail Popups ── */}
                            {selectedId && type === "ALL_RFQ" && (
                                <GetRFQByID id={selectedId} onClose={() => setSelectedId(null)} />
                            )}
                            {selectedId && type === "ALL_RFI" && (
                                <GetRFIByID id={selectedId} onClose={() => setSelectedId(null)} />
                            )}
                            {selectedId && type === "ALL_SUBMITTALS" && (
                                <GetSubmittalByID id={selectedId} onClose={() => setSelectedId(null)} />
                            )}
                            {selectedId && type === "ALL_COR" && (
                                <GetCOByID
                                    id={selectedId}
                                    projectId={selectedProjectId ?? undefined}
                                    onClose={() => {
                                        setSelectedId(null);
                                        setSelectedProjectId(null);
                                    }}
                                />
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <Files size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-medium">No records found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DocumentListModal;
