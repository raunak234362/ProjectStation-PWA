import { Bell, ArrowRight, Clock, FileText, DollarSign, PenTool, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface NotificationItem {
    id: string;
    type: "rfq" | "rfi" | "sales" | "designer" | "invoice" | "project";
    title: string;
    description: string;
    time: string;
}

const DashboardNotifications = () => {
    // Mock notifications based on updated user requirements
    const notifications: NotificationItem[] = [
        {
            id: "1",
            type: "rfq",
            title: "New RFQ Received",
            description: "Project 'Skyline Plaza' has a new RFQ #7734.",
            time: "2 mins ago",
        },
        {
            id: "2",
            type: "invoice",
            title: "Invoice Paid",
            description: "Invoice INV-2024-001 has been fully paid.",
            time: "1 hour ago",
        },
        {
            id: "3",
            type: "project",
            title: "Timeline Updated",
            description: "Project 'Ocean View' deadline extended by 5 days.",
            time: "3 hours ago",
        },
        {
            id: "4",
            type: "designer",
            title: "Quotation Ready",
            description: "Connection Designer submitted a new quote for RFQ #23.",
            time: "5 hours ago",
        },
        {
            id: "5",
            type: "sales",
            title: "High Conversion Alert",
            description: "Sales win rate increased by 5% this quarter.",
            time: "Yesterday",
        }
    ];

    const getIcon = (type: NotificationItem["type"]) => {
        switch (type) {
            case "rfq": return <FileText className="text-blue-500" size={18} />;
            case "invoice": return <CheckCircle2 className="text-green-500" size={18} />;
            case "project": return <Clock className="text-amber-500" size={18} />;
            case "designer": return <PenTool className="text-purple-500" size={18} />;
            case "sales": return <DollarSign className="text-emerald-500" size={18} />;
            default: return <Bell className="text-slate-400" size={18} />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white shadow-sm rounded-2xl p-5 border border-slate-50">
            <div className="flex items-center justify-between mb-5 px-1">
                <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                    <Bell className="text-[#6bbd45]" size={22} strokeWidth={2.5} />
                    Notifications
                </h3>
                <button className="text-xs font-bold text-[#6bbd45] hover:underline flex items-center gap-1">
                    View All <ArrowRight size={14} />
                </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1 no-scrollbar max-h-[320px]">
                {notifications.map((notif, index) => (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={notif.id}
                        className="flex gap-3 p-3 rounded-xl bg-slate-50 hover:bg-white hover:shadow-soft transition-all cursor-pointer group border border-transparent hover:border-slate-100"
                    >
                        <div className="p-2.5 rounded-lg bg-white shadow-sm group-hover:bg-slate-50 transition-colors shrink-0 h-fit">
                            {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-0.5">
                                <h4 className="text-sm font-bold text-slate-800 truncate uppercase tracking-tight">
                                    {notif.title}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                    {notif.time}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                {notif.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default DashboardNotifications;
