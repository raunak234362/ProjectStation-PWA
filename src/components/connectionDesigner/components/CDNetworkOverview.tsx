import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { Mail, MapPin, ChevronRight, Search } from "lucide-react";

interface CDNetworkOverviewProps {
  designers: any[]; // Full designer data
  stateData: { name: string; count: number }[]; // State distribution for Pie
  onSelect: (id: string) => void;
}

const HoverPopover = ({ states, targetRect }: { states: string[], targetRect: DOMRect }) => {
  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed',
        left: targetRect.left - 270, // 256 for width + some margin
        top: targetRect.top + targetRect.height / 2,
        transform: 'translateY(-50%)',
      }}
      className="z-100 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 w-64 pointer-events-none hidden sm:block"
    >
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-50 dark:border-slate-700/50">
        <MapPin size={14} className="text-green-500" />
        <span className="text-xs  text-gray-700 dark:text-slate-200">
          Coverage Area
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {states.length > 0 ? (
          states.slice(0, 12).map((s, i) => (
            <span
              key={i}
              className="text-[10px] bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-md border border-green-100 dark:border-green-800/50"
            >
              {s}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400 dark:text-slate-500 italic">
            No specific states listed
          </span>
        )}
        {states.length > 12 && (
          <span className="text-[10px] text-gray-400 dark:text-slate-500 pl-1">
            +{states.length - 12} more
          </span>
        )}
      </div>
      {/* Arrow */}
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-t border-r border-gray-100 dark:border-slate-700 rotate-45 transform"></div>
    </motion.div>,
    document.body
  );
};

const CDNetworkOverview: React.FC<CDNetworkOverviewProps> = ({
  designers,
  stateData,
  onSelect,
}) => {
  const COLORS = [
    "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899",
    "#14b8a6", "#6366f1", "#ef4444", "#84cc16", "#0ea5e9",
  ];
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDesigners = designers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 lg:h-[500px]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[32px] shadow-soft border border-gray-100 dark:border-slate-800 flex flex-col overflow-hidden min-h-[400px]"
      >
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg  text-gray-800 dark:text-white tracking-tight">
              Connection Designer Directory
            </h3>
            <p className="text-[10px] text-gray-400 dark:text-slate-500  uppercase tracking-widest mt-1">
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
              placeholder="Search designers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-1 focus:ring-green-500 outline-none w-full sm:w-56 text-gray-900 dark:text-white transition-all"
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
                  className={`group flex items-center justify-between p-4 rounded-2xl transition-all border border-transparent cursor-pointer ${isHovered
                    ? "bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30 shadow-sm"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-100 dark:hover:border-slate-700"
                    }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-2xl bg-linear-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-gray-600 dark:text-slate-300  text-sm shadow-sm transition-transform group-hover:scale-110">
                      {designer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm  text-gray-800 dark:text-white tracking-tight truncate">
                        {designer.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        {designer.email && (
                          <span className="flex items-center gap-1.5 text-[10px]  text-gray-400 dark:text-slate-500 uppercase tracking-wider truncate max-w-[150px]">
                            <Mail size={10} className="text-gray-300 dark:text-slate-600" /> {designer.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 ml-2">
                    <span className="text-[10px]  text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-lg uppercase tracking-widest border border-slate-200/50 dark:border-slate-700/50">
                      {states.length} <span className="hidden xs:inline">States</span>
                    </span>
                    <ChevronRight size={16} className="text-gray-300 dark:text-slate-700 group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors" />
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

      <motion.div
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
      </motion.div>
    </div>
  );
};

export default CDNetworkOverview;
