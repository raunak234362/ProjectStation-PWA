import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Mail, MapPin, ChevronRight, Search } from "lucide-react";

interface CDNetworkOverviewProps {
  designers: any[]; // Full designer data
  onSelect: (id: string) => void;
}

const HoverPopover = ({
  states,
  targetRect,
}: {
  states: string[];
  targetRect: DOMRect;
}) => {
  return createPortal(
    <motion.div
      initial={{ opacity: 0, x: -10, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "fixed",
        left: targetRect.left + targetRect.width / 2,
        top: targetRect.top + targetRect.height / 2,
        transform: "translate(-50%, -50%)",
      }}
      className="z-100 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-2xl border border-black/10 dark:border-slate-700 w-72 pointer-events-none hidden sm:block"
    >
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-black/10 dark:border-slate-700/50">
        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
          <MapPin size={16} className="text-white" />
        </div>
        <div>
          <span className="text-xs font-bold text-black dark:text-slate-100 block">
            Coverage Area
          </span>
          <span className="text-[10px] text-black font-medium">
            {states.length} {states.length === 1 ? "State" : "States"}
          </span>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto custom-scrollbar pr-1">
        <div className="flex flex-wrap gap-2">
          {states.length > 0 ? (
            states.map((s, i) => (
              <button
                key={i}
                className="group relative px-3 py-2 bg-green-50 dark:bg-green-900/20 text-black dark:text-green-400 rounded-xl border border-black/10 dark:border-green-800/50 text-[11px] font-bold tracking-wide"
              >
                <span className="relative z-10">{s}</span>
              </button>
            ))
          ) : (
            <div className="w-full text-center py-6">
              <MapPin
                size={32}
                className="mx-auto text-black dark:text-slate-600 mb-2"
              />
              <span className="text-xs text-black dark:text-slate-500 italic font-medium">
                No specific states listed
              </span>
            </div>
          )}
        </div>
      </div>

      {/* No arrow for centered popover for better visibility */}
    </motion.div>,
    document.body,
  );
};

const CDNetworkOverview: React.FC<CDNetworkOverviewProps> = ({
  designers,
  onSelect,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDesigners = designers.filter((d) => {
    const searchLower = searchTerm.toLowerCase();

    // Check name and email
    const matchesNameOrEmail =
      d.name.toLowerCase().includes(searchLower) ||
      d.email?.toLowerCase().includes(searchLower);

    // Check states
    let states: string[] = [];
    if (Array.isArray(d.state)) {
      states = d.state;
    } else if (typeof d.state === "string") {
      try {
        states = d.state.startsWith("[") ? JSON.parse(d.state) : [d.state];
      } catch {
        states = [d.state];
      }
    }

    const matchesState = states.some((state) =>
      state?.toLowerCase().includes(searchLower),
    );

    return matchesNameOrEmail || matchesState;
  });

  return (
    <div className="mb-8 lg:h-[500px]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[32px] shadow-soft border border-black/10 dark:border-slate-800 flex flex-col overflow-hidden min-h-[400px]"
      >
        <div className="p-6 border-b border-black/10 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white tracking-tight">
              Connection Designer Directory
            </h3>
            <p className="text-[10px] text-black dark:text-slate-500 font-medium uppercase tracking-widest mt-1">
              Click to view details • Hover to see states
            </p>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
              size={14}
            />
            <input
              type="text"
              placeholder="Search by name, email, or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-black/10 rounded-xl text-sm focus:ring-1 focus:ring-green-500 outline-none w-full sm:w-56 text-black dark:text-white transition-all placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredDesigners.map((designer) => {
            let states: string[] = [];
            if (Array.isArray(designer.state)) states = designer.state;
            else if (typeof designer.state === "string") {
              try {
                states = designer.state.startsWith("[")
                  ? JSON.parse(designer.state)
                  : [designer.state];
              } catch {
                states = [designer.state];
              }
            }
            states = states.filter(Boolean);

            const isHovered = hoveredId === (designer.id || designer._id);

            return (
              <div key={designer.id || designer._id} className="relative">
                <motion.div
                  onMouseEnter={(e) => {
                    setHoveredId(designer.id || designer._id);
                    setHoverRect(e.currentTarget.getBoundingClientRect());
                  }}
                  onMouseLeave={() => {
                    setHoveredId(null);
                    setHoverRect(null);
                  }}
                  onClick={() => onSelect(designer.id || designer._id)}
                  className={`group flex items-center justify-between p-4 rounded-2xl transition-all border border-black/10 cursor-pointer ${isHovered
                    ? "bg-green-50/50 dark:bg-green-900/10 shadow-sm"
                    : "bg-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-2xl bg-linear-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-gray-600 dark:text-slate-300  text-sm shadow-sm transition-transform group-hover:scale-110">
                      {designer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-black dark:text-white tracking-tight truncate">
                        {designer.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        {designer.email && (
                          <span className="flex items-center gap-1.5 text-[10px] font-medium text-black dark:text-slate-500 uppercase tracking-wider truncate max-w-[150px]">
                            <Mail
                              size={10}
                              className="text-black dark:text-slate-600"
                            />{" "}
                            {designer.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 ml-2">
                    <span className="text-[10px] font-bold text-black dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg uppercase tracking-widest border border-black/10 dark:border-slate-700/50">
                      {states.length}{" "}
                      <span className="hidden xs:inline">States</span>
                    </span>
                    <ChevronRight
                      size={16}
                      className="text-black group-hover:text-green-600 transition-colors"
                    />
                  </div>
                </motion.div>

                {isHovered && hoverRect && (
                  <AnimatePresence>
                    <HoverPopover states={states} targetRect={hoverRect} />
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-soft border border-gray-100 dark:border-slate-800 flex flex-col min-h-[400px]"
      >
        <h3 className="text-lg  text-gray-800 dark:text-white mb-8 tracking-tight">
          State Distribution
        </h3>
        <div className="flex-1 min-h-[300px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stateData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={8}
                dataKey="count"
                stroke="none"
              >
                {stateData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255,255,255,0.9)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="bottom" height={140} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'inherit' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div> */}
    </div>
  );
};

export default CDNetworkOverview;
