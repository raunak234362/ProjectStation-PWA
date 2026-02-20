import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
    Files,
    Search,
    FileText,
    DollarSign,
    Users,
} from "lucide-react";
import { motion } from "framer-motion";
import DataTable from "../../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "../../../utils/dateUtils";
import { useDispatch } from "react-redux";
import {
    incrementModalCount,
    decrementModalCount,
} from "../../../store/uiSlice";

interface SalesDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any[];
    type: "PROJECTS" | "RFQS" | "INVOICES" | "CLIENTS";
    title: string;
}

const SalesDetailModal: React.FC<SalesDetailModalProps> = ({
    isOpen,
    onClose,
    data,
    type,
    title,
}) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (isOpen) {
            dispatch(incrementModalCount());
            return () => {
                dispatch(decrementModalCount());
            };
        }
    }, [isOpen, dispatch]);

    const getIcon = () => {
        switch (type) {
            case "RFQS":
                return <Search size={24} className="text-green-600" />;
            case "PROJECTS":
                return <FileText size={24} className="text-blue-600" />;
            case "INVOICES":
                return <DollarSign size={24} className="text-emerald-600" />;
            case "CLIENTS":
                return <Users size={24} className="text-purple-600" />;
            default:
                return <Files size={24} />;
        }
    };

    const getColumns = (): ColumnDef<any>[] => {
        switch (type) {
            case "RFQS":
                return [
                    {
                        accessorKey: "projectName",
                        header: "Project Name",
                    },
                    {
                        accessorKey: "rfqNumber",
                        header: "RFQ #",
                        cell: ({ row }) => row.original.rfqNumber || row.original.projectNumber || "—",
                    },
                    {
                        accessorKey: "status",
                        header: "Status",
                        cell: ({ row }) => (
                            <span className="px-3 py-1 text-xs uppercase font-bold rounded-lg bg-green-50 text-green-700 border border-green-200">
                                {row.original.status?.replace("_", " ")}
                            </span>
                        ),
                    },
                    {
                        accessorKey: "bidPrice",
                        header: "Bid Price",
                        cell: ({ row }) => row.original.bidPrice ? `$${parseFloat(row.original.bidPrice).toLocaleString()}` : "—",
                    },
                    {
                        accessorKey: "createdAt",
                        header: "Date",
                        cell: ({ row }) => formatDate(row.original.createdAt),
                    },
                ];
            case "PROJECTS":
                return [
                    {
                        accessorKey: "projectName",
                        header: "Project Name",
                    },
                    {
                        accessorKey: "projectNumber",
                        header: "Project #",
                    },
                    {
                        accessorKey: "status",
                        header: "Status",
                        cell: ({ row }) => (
                            <span className="px-3 py-1 text-xs uppercase font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                                {row.original.status?.replace("_", " ")}
                            </span>
                        ),
                    },
                    {
                        accessorKey: "startDate",
                        header: "Start Date",
                        cell: ({ row }) => formatDate(row.original.startDate),
                    },
                ];
            case "INVOICES":
                return [
                    {
                        accessorKey: "invoiceNumber",
                        header: "Invoice #",
                    },
                    {
                        accessorKey: "projectName",
                        header: "Project",
                        cell: ({ row }) => row.original.project?.projectName || "—",
                    },
                    {
                        accessorKey: "amount",
                        header: "Amount",
                        cell: ({ row }) => {
                            const amount = parseFloat(row.original.totalAmount || row.original.amount || 0);
                            return `$${amount.toLocaleString()}`;
                        },
                    },
                    {
                        accessorKey: "status",
                        header: "Status",
                        cell: ({ row }) => (
                            <span className={`px-3 py-1 text-xs uppercase font-bold rounded-lg border ${row.original.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                                    row.original.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        'bg-gray-50 text-gray-700 border-gray-200'
                                }`}>
                                {row.original.status}
                            </span>
                        ),
                    },
                    {
                        accessorKey: "dueDate",
                        header: "Due Date",
                        cell: ({ row }) => formatDate(row.original.dueDate),
                    },
                ];
            case "CLIENTS":
                return [
                    {
                        accessorKey: "name",
                        header: "Client Name",
                        cell: ({ row }) => row.original.name || row.original.companyName || "—",
                    },
                    {
                        accessorKey: "email",
                        header: "Email",
                    },
                    {
                        accessorKey: "totalProjects",
                        header: "Total Projects",
                        cell: ({ row }) => row.original.projects?.length || 0,
                    },
                    {
                        accessorKey: "status",
                        header: "Status",
                        cell: ({ row }) => (
                            <span className="px-3 py-1 text-xs uppercase font-bold rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                                ACTIVE
                            </span>
                        ),
                    },
                ];
            default:
                return [];
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-6xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-gray-100"
            >
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            {getIcon()}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                {title}
                            </h3>
                            <p className="text-gray-500 text-sm font-medium">{data.length} total entries found</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all font-bold text-sm uppercase tracking-wider shadow-lg shadow-black/10 active:scale-95"
                    >
                        Close Window
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                    {data.length > 0 ? (
                        <div className="bg-white rounded-[2rem] border border-gray-200/60 shadow-sm overflow-hidden p-1">
                            <DataTable
                                columns={getColumns()}
                                data={data}
                                pageSizeOptions={[10, 25, 50]}
                                onRowClick={() => { }}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <Files size={40} className="opacity-20" />
                            </div>
                            <p className="text-lg font-bold text-gray-600">No data available</p>
                            <p className="text-sm">There are no records to display for this category.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>,
        document.body,
    );
};

export default SalesDetailModal;
