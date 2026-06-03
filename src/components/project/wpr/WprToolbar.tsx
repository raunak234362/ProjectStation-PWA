import React from "react";
import { Download, Save, Loader2, ArrowLeft } from "lucide-react";

interface WprToolbarProps {
  canEdit: boolean;
  saving: boolean;
  selectedWeekLabel: string;
  onBackToWeeks: () => void;
  onSaveChanges: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  exportingPDF?: boolean;
}

const WprToolbar: React.FC<WprToolbarProps> = ({
  canEdit,
  saving,
  selectedWeekLabel,
  onBackToWeeks,
  onSaveChanges,
  onExportPDF,
  exportingPDF
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-6 bg-[#6bbd45] rounded-none" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
          <button
            onClick={onBackToWeeks}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all font-bold text-xs uppercase cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          WPR Spreadsheet Control
        </h2>
        <span className="ml-4 text-xs font-bold uppercase tracking-wider text-slate-500">
          Showing: {selectedWeekLabel}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {canEdit && (
          <button
            onClick={onSaveChanges}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-green-50 text-black border-2 border-green-700/80 hover:bg-green-100 rounded-none text-sm font-bold uppercase tracking-tight shadow-sm transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Changes
          </button>
        )}
       
        <button
          onClick={onExportPDF}
          disabled={exportingPDF}
          className={`flex items-center gap-2 px-5 py-2 text-black border-2 rounded-none text-sm font-bold uppercase tracking-tight shadow-sm transition-all ${exportingPDF ? 'bg-red-100 border-red-700/80 cursor-not-allowed' : 'bg-red-50 border-red-700/80 hover:bg-red-100 cursor-pointer'}`}
        >
          {exportingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {exportingPDF ? "Exporting..." : "PDF Export"}
        </button>
      </div>
    </div>
  );
};

export default WprToolbar;
