import React from "react";
import { Plus, Download, Send, FileText } from "lucide-react";

interface QuickActionsProps {
    onRaiseInvoice: () => void;
    onDownloadReport?: () => void;
    onSendReminders?: () => void;
}

const QuickActionsPanel: React.FC<QuickActionsProps> = ({ onRaiseInvoice, onDownloadReport, onSendReminders }) => {
    return (
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText size={20} className="text-green-100" />
                Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                    onClick={onRaiseInvoice}
                    className="flex items-center justify-center gap-2 bg-white text-green-600 px-4 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors shadow-sm cursor-pointer"
                >
                    <Plus size={18} />
                    Raise New Invoice
                </button>
                <button
                    onClick={onDownloadReport}
                    className="flex items-center justify-center gap-2 bg-white/10 text-white px-4 py-3 rounded-xl font-medium hover:bg-white/20 transition-colors backdrop-blur-sm cursor-pointer border border-white/20"
                >
                    <Download size={18} />
                    Download Report
                </button>
                <button
                    onClick={onSendReminders}
                    className="flex items-center justify-center gap-2 bg-white/10 text-white px-4 py-3 rounded-xl font-medium hover:bg-white/20 transition-colors backdrop-blur-sm cursor-pointer border border-white/20"
                >
                    <Send size={18} />
                    Send Reminders
                </button>
                {/* Fill space or another action
                <button className="flex items-center justify-center gap-2 bg-white/10 text-white px-4 py-3 rounded-xl font-medium hover:bg-white/20 transition-colors backdrop-blur-sm cursor-pointer border border-white/20">
                    ... More Actions
                </button> */}
            </div>
        </div>
    );
};

export default QuickActionsPanel;
