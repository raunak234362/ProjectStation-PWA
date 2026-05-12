import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check } from "lucide-react";
import Toggle from "../fields/Toggle";

interface MTOSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "STICK" | "MANUAL";
  register: any;
  watch: any;
  setValue: any;
}

const MTOSelectionModal: React.FC<MTOSelectionModalProps> = ({
  isOpen,
  onClose,
  type,
  register,
  watch,
}) => {
  const isManual = type === "MANUAL";

  // Helper to render slider for manual mode
  const renderSlider = (name: string, percentageName: string) => {
    if (!isManual || !watch(name)) return null;

    const percentage = watch(percentageName) || 0;

    return (
      <div className="mt-4 px-4 py-3 bg-white rounded-lg border border-black/5 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Adjust Percentage</span>
            <span className="text-sm font-black text-[#6bbd45] tabular-nums">{percentage}%</span>
          </div>
          <div className="relative h-6 flex items-center">
             <input
                type="range"
                min="0"
                max="100"
                {...register(percentageName)}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#6bbd45] z-10"
                style={{
                    background: `linear-gradient(to right, #6bbd45 0%, #6bbd45 ${percentage}%, #f3f4f6 ${percentage}%, #f3f4f6 100%)`
                }}
             />
          </div>
          <div className="text-center">
             <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">Current: {percentage}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden border border-black"
          >
            <div className="p-6 md:p-8 flex flex-col h-full max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 border-b border-black/10 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-black uppercase tracking-tight">
                    {isManual ? "Manual Model Selection" : "Stick Model Selection"}
                  </h2>
                  <p className="text-xs font-bold text-black/40 uppercase tracking-widest mt-1">
                    Select the scope and requirements for your {type.toLowerCase()} MTO
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-black transition-all border border-black/5"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8">
                {/* Main Steel Scope */}
                <section className="space-y-4">
                  <h3 className="text-xs font-black text-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#6bbd45]" />
                    Main Steel Scope
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <Toggle 
                        label="Main Steel" 
                        {...register(isManual ? "manualMainSteel" : "mainSteel")} 
                      />
                      {renderSlider("manualMainSteel", "manualMainSteelPercentage")}
                    </div>
                    <div className="flex flex-col">
                      <Toggle 
                        label="Main Steel Misc Attachments" 
                        {...register(isManual ? "manualMainSteelMiscAttachments" : "mainSteelMiscAttachments")} 
                      />
                      {renderSlider("manualMainSteelMiscAttachments", "manualMainSteelMiscAttachmentsPercentage")}
                    </div>
                    <div className="flex flex-col">
                      <Toggle 
                        label="Main Steel Connections" 
                        {...register(isManual ? "manualMainSteelConnections" : "mainSteelConnections")} 
                      />
                      {renderSlider("manualMainSteelConnections", "manualMainSteelConnectionsPercentage")}
                    </div>
                  </div>
                </section>

                {/* Miscellaneous Steel Scope */}
                <section className="space-y-4">
                  <h3 className="text-xs font-black text-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Miscellaneous Steel Scope
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <Toggle 
                        label="Misc Steel" 
                        {...register(isManual ? "manualMiscSteel" : "miscSteel")} 
                      />
                      {renderSlider("manualMiscSteel", "manualMiscSteelPercentage")}
                    </div>
                    <div className="flex flex-col">
                      <Toggle 
                        label="Misc Steel Connection" 
                        {...register(isManual ? "manualMiscSteelConnection" : "miscSteelConnection")} 
                      />
                      {renderSlider("manualMiscSteelConnection", "manualMiscSteelConnectionPercentage")}
                    </div>
                    <div className="flex flex-col">
                      <Toggle 
                        label="Misc Steel Attachments" 
                        {...register(isManual ? "manualMiscSteelAttachments" : "miscSteelAttachments")} 
                      />
                      {renderSlider("manualMiscSteelAttachments", "manualMiscSteelAttachmentsPercentage")}
                    </div>
                  </div>
                </section>

                {/* MTO Files Requirements */}
                <section className="space-y-4">
                  <h3 className="text-xs font-black text-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    MTO Files Requirements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {!isManual ? (
                      <>
                        <Toggle label="3d Model" {...register("mto3dModel")} />
                        <Toggle label="Tekla/SDS-2" {...register("mtoTeklaSDS2")} />
                        <Toggle label="IFC files" {...register("mtoIFC")} />
                        <Toggle label="EJE files" {...register("mtoEJE")} />
                        <Toggle label="Kss files" {...register("mtoKss")} />
                        <Toggle label="bolt List" {...register("mtoBoltList")} />
                        <Toggle label="Material Summary Report" {...register("mtoMaterialSummary")} />
                      </>
                    ) : (
                      <div className="flex flex-col">
                        <Toggle label="Material Summary Report" {...register("manualMaterialSummary")} />
                        {renderSlider("manualMaterialSummary", "manualMaterialSummaryPercentage")}
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <button
                  onClick={onClose}
                  className="w-full py-5 bg-[#6bbd45] text-black border-2 border-black rounded-lg font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl active:scale-95"
                >
                  <Check size={18} strokeWidth={3} />
                  Save Selection
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MTOSelectionModal;
