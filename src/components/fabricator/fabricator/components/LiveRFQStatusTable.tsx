import React from "react";
import { type RFQItem } from "../../../../interface";
import { cn } from "../../../../lib/utils";
import DataTable from "../../../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

interface LiveRFQStatusTableProps {
    rfqs: RFQItem[];
}

const LiveRFQStatusTable: React.FC<LiveRFQStatusTableProps> = ({ rfqs }) => {
    const columns: ColumnDef<RFQItem>[] = [
        {
            accessorKey: "projectNumber",
            header: "RFQ ID",
            cell: ({ row }) => <span className="font-mono text-xs font-bold text-slate-500">{row.original.projectNumber || "N/A"}</span>
        },
        {
            accessorKey: "projectName",
            header: "Project Name",
            cell: ({ row }) => (
                <div className="max-w-[150px] truncate font-bold text-slate-700" title={row.original.projectName}>
                    {row.original.projectName}
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                let status = row.original.status || "PENDING";
                // Mock delay logic: if status is not completed and createdAt is > 30 days ago
                const createdDate = new Date(row.original.createdAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - createdDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (status !== "COMPLETED" && diffDays > 30) {
                    status = "DELAYED";
                }

                const colors: Record<string, string> = {
                    "PENDING": "bg-slate-100 text-slate-600",
                    "IN_PROGRESS": "bg-amber-100 text-amber-700",
                    "COMPLETED": "bg-[#6bbd45]/20 text-[#6bbd45]",
                    "DELAYED": "bg-rose-100 text-rose-700",
                    "REJECTED": "bg-red-50 text-red-500"
                };

                return (
                    <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider", colors[status] || colors["PENDING"])}>
                        {status}
                    </span>
                );
            },
        },
        {
            accessorKey: "sender.fabricator.fabName", // Assuming nested structure based on interface
            header: "Fabricator",
            cell: ({ row }) => (
                <div className="text-xs font-medium text-slate-600 truncate max-w-[120px]">
                    {row.original.sender?.fabricator?.fabName || "Unassigned"}
                </div>
            )
        },
        {
            id: "daysActive",
            header: "Days Active",
            cell: ({ row }) => {
                const createdDate = new Date(row.original.createdAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - createdDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return <span className="text-xs font-bold text-slate-700">{diffDays} Days</span>;
            }
        },
        {
            id: "actions",
            header: "Action",
            cell: () => (
                <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-[#6bbd45]">
                    <Eye size={16} />
                </button>
            )
        }
    ];

    return (
        <div className="bg-[#f9fdf7] rounded-3xl shadow-soft overflow-hidden border border-slate-50 h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-white/50 backdrop-blur-sm shrink-0">
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    Live RFQ Status
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    Real-time tracking of all active requests
                </p>
            </div>
            <div className="flex-1 overflow-hidden p-2">
                <DataTable columns={columns} data={rfqs} />
            </div>
        </div>
    );
};

export default LiveRFQStatusTable;
