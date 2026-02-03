import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Phone, MapPin, ChevronRight, Search } from "lucide-react";

interface CDNetworkOverviewProps {
  designers: any[]; // Full designer data
  onSelect: (id: string) => void;
}

const CDNetworkOverview: React.FC<CDNetworkOverviewProps> = ({
  designers,
  onSelect,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDesigners = designers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 gap-6 mb-8 lg:h-[500px]">
      {/* LEFT: Connection Designer Directory (Interactive List) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-green-50 rounded-md shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[400px]"
      >
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">
              Connection Designer Directory
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
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
              className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-sm text-xs sm:text-sm focus:ring-1 focus:ring-green-500 outline-hidden w-full sm:w-48"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {filteredDesigners.map((designer) => {
            // Parse states for this designer
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

            return (
              <motion.div
                key={designer.id || designer._id}
                layoutId={designer.id || designer._id}
                onMouseEnter={() => setHoveredId(designer.id || designer._id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelect(designer.id || designer._id)}
                className={`group relative flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-green-50/50 transition-colors border border-transparent hover:border-green-100 cursor-pointer ${hoveredId === (designer.id || designer._id) ? "z-50" : "z-0"
                  }`}
              >
                {/* Main Info */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs sm:text-sm">
                    {designer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">
                      {designer.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5">
                      {designer.email && (
                        <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 truncate max-w-[120px] sm:max-w-none">
                          <Mail size={10} className="shrink-0" /> {designer.email}
                        </span>
                      )}
                      {designer.contactInfo && (
                        <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
                          <Phone size={10} className="shrink-0" /> {designer.contactInfo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Arrow / State Count */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                  <span className="text-[10px] sm:text-xs font-medium text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-sm whitespace-nowrap">
                    {states.length} <span className="hidden xs:inline">States</span>
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-gray-300 group-hover:text-green-500 transition-colors"
                  />
                </div>

                {/* HOVER POPOVER (Floating State List) */}
                <AnimatePresence>
                  {hoveredId === (designer.id || designer._id) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-14 top-1/2 -translate-y-1/2 z-50 bg-white p-4 rounded-md shadow-xl border border-gray-100 w-64 pointer-events-none hidden sm:block"
                    >
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-50">
                        <MapPin size={14} className="text-green-500" />
                        <span className="text-xs font-bold text-gray-700">
                          Coverage Area
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {states.length > 0 ? (
                          states.slice(0, 8).map((s, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-sm border border-green-100"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            No specific states listed
                          </span>
                        )}
                        {states.length > 8 && (
                          <span className="text-[10px] text-gray-400 pl-1">
                            +{states.length - 8} more
                          </span>
                        )}
                      </div>
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-t border-r border-gray-100 rotate-45 transform"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default CDNetworkOverview;
