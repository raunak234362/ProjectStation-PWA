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
import { Mail, Phone, MapPin, ChevronRight, Search } from "lucide-react";

interface CDNetworkOverviewProps {
  designers: any[]; // Full designer data
  stateData: { name: string; count: number }[]; // State distribution for Pie
  onSelect: (id: string) => void;
}

const HoverPopover = ({ states, targetRect }: { states: string[], targetRect: DOMRect }) => {
  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed',
        left: targetRect.left + targetRect.width / 2,
        top: targetRect.top + targetRect.height / 2,
        transform: 'translate(-50%, -50%)',
      }}
      className="z-[100] bg-white p-4 rounded-xl shadow-2xl border border-black/10 w-64 pointer-events-none hidden sm:block"
    >
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-black/10">
        <MapPin size={14} className="text-green-500" />
        <span className="text-xs font-bold text-black">
          Coverage Area
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {states.length > 0 ? (
          states.slice(0, 12).map((s, i) => (
            <span
              key={i}
              className="text-[10px] bg-green-50 text-black px-2 py-0.5 rounded-md border border-black/10 font-medium"
            >
              {s}
            </span>
          ))
        ) : (
          <span className="text-xs text-black italic font-medium">
            No specific states listed
          </span>
        )}
        {states.length > 12 && (
          <span className="text-[10px] text-gray-400 pl-1">
            +{states.length - 12} more
          </span>
        )}
      </div>
      {/* Centered popover - removing arrow for cleaner look */}
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
        className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-black/10 flex flex-col overflow-hidden min-h-[400px]"
      >
        <div className="p-4 sm:p-6 border-b border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-black">
              Connection Designer List
            </h3>
            <p className="text-[10px] sm:text-xs text-black font-medium mt-0.5 sm:mt-1">
              Click to view details • Hover to see states
            </p>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search designers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-black/10 rounded-lg text-xs sm:text-sm focus:ring-1 focus:ring-green-500 outline-none w-full sm:w-48 text-black"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
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
                  className={`group flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-green-50/50 transition-colors border border-black/10 cursor-pointer ${isHovered ? "bg-green-50/30 shadow-sm" : "bg-white"
                    }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600  text-xs sm:text-sm">
                      {designer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-black truncate">
                        {designer.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-0.5">
                        {designer.email && (
                          <span className="flex items-center gap-1 text-[10px] sm:text-xs text-black font-medium truncate max-w-[150px]">
                            <Mail size={10} className="text-black" /> {designer.email}
                          </span>
                        )}
                        {designer.contactInfo && (
                          <span className="flex items-center gap-1 text-[10px] sm:text-xs text-black font-medium">
                            <Phone size={10} className="text-black" /> {designer.contactInfo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] sm:text-xs font-bold text-black bg-white border border-black/10 px-2 py-0.5 rounded-full">
                      {states.length} <span className="hidden xs:inline">States</span>
                    </span>
                    <ChevronRight size={14} className="text-black group-hover:text-green-600" />
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
        className="lg:col-span-1 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-black/10 flex flex-col min-h-[400px]"
      >
        <h3 className="text-base sm:text-lg font-bold text-black mb-6">
          State Distribution
        </h3>
        <div className="flex-1 min-h-[300px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stateData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
              >
                {stateData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={120} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default CDNetworkOverview;
