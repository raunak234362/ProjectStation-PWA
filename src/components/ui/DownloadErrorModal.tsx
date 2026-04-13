import React from "react";
import { 
  XCircle, 
  AlertTriangle, 
  RefreshCcw, 
  X,
  FileWarning
} from "lucide-react";

interface DownloadErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  onRetry?: () => void;
}

const DownloadErrorModal: React.FC<DownloadErrorModalProps> = ({ 
  isOpen, 
  onClose, 
  reason,
  onRetry 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10002 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-red-50 dark:border-slate-800 animate-in zoom-in slide-in-from-bottom-8 duration-500">
        {/* Header with Close Button */}
        <div className="flex justify-end p-4 absolute top-0 right-0">
          <button 
            onClick={onClose}
            className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
          >
            Close
          </button>
        </div>

        <div className="p-10 text-center space-y-8">
          {/* Icon Section */}
          <div className="flex justify-center flex-col items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-red-100 dark:bg-red-900/10 rounded-full scale-110 blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-white dark:bg-slate-900 p-6 rounded-full shadow-lg border-4 border-red-50 dark:border-red-900/20">
                <FileWarning className="w-16 h-16 text-red-500" />
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Download Failed
              </h2>
              <div className="h-1.5 w-12 bg-red-500 mx-auto rounded-full"></div>
            </div>
          </div>
          
          {/* Message Section */}
          <div className="space-y-4">
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              We couldn't process your request to download or open this file. 
              {reason && (
                <span className="block mt-2 font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg text-sm">
                  Reason: {reason}
                </span>
              )}
            </p>

            <div className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100/50 dark:border-amber-900/20 group hover:border-amber-200 transition-colors">
              <div className="flex items-start gap-4 text-sm text-amber-700 dark:text-amber-400 text-left">
                <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                <p className="font-medium leading-snug">
                  Please <span className="font-bold underline decoration-2 underline-offset-2">try again with the same link after sometime</span>. Our servers might be undergoing brief maintenance or there's a temporary network issue.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button 
                onClick={onRetry || onClose}
                className="w-full bg-slate-900 dark:bg-[#6bbd45] hover:bg-black dark:hover:bg-[#5aa83a] text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 dark:shadow-none flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-widest text-xs"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again Now
            </button>
            <button 
                onClick={onClose}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-widest text-xs"
            >
              <XCircle className="w-4 h-4" />
              Close & Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadErrorModal;
