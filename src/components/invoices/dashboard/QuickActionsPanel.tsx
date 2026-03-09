import React from "react";
import { Plus, Download, Send, FileText } from "lucide-react";

interface QuickActionsProps {
    onRaiseInvoice: () => void;
    onDownloadReport?: () => void;
    onSendReminders?: () => void;
}

const QuickActionsPanel: React.FC<QuickActionsProps> = ({ onRaiseInvoice, onDownloadReport, onSendReminders }) => {
    return (
        <div className="bg-green-100 rounded-2xl p-4 sm:p-6 text-black border border-black border-l-[6px] border-l-[#6bbd45] shadow-md">
            <h3 className="text-lg  mb-4 flex items-center gap-2">
                <FileText size={20} className="text-black" />
                Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <button
                    onClick={onRaiseInvoice}
                    className="flex items-center justify-center gap-2 bg-white text-black px-3 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm cursor-pointer text-sm sm:text-base border border-black"
                >
                    <Plus size={18} className="shrink-0" />
                    <span className="truncate">Raise New Invoice</span>
                </button>
                <button
                    onClick={onDownloadReport}
                    className="flex items-center justify-center gap-2 bg-white text-black px-3 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors cursor-pointer border border-black text-sm sm:text-base"
                >
                    <Download size={18} className="shrink-0" />
                    <span className="truncate">Download Report</span>
                </button>
                <button
                    onClick={onSendReminders}
                    className="flex items-center justify-center gap-2 bg-white text-black px-3 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors cursor-pointer border border-black text-sm sm:text-base"
                >
                    <Send size={18} className="shrink-0" />
                    <span className="truncate">Send Reminders</span>
                </button>
                {/* Fill space or another action
                <button className="flex items-center justify-center gap-2 bg-white text-black px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors cursor-pointer border border-black">
                    ... More Actions
                </button> */}
            </div>
        </div>
    );
};

export default QuickActionsPanel;
