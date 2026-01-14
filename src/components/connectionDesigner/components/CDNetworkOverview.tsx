import React, { useState } from "react";
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

const CDNetworkOverview: React.FC<CDNetworkOverviewProps> = ({
  designers,
  stateData,
  onSelect,
}) => {
  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#6366f1",
  ];
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDesigners = designers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 h-[500px]">
      {/* LEFT: Connection Designer Directory (Interactive List) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Connection Designer Directory
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Click to view details • Hover to see states
            </p>
          </div>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search designers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-green-500 outline-hidden w-48"
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
                className="group relative flex items-center justify-between p-4 rounded-xl hover:bg-green-50/50 transition-colors border border-transparent hover:border-green-100 cursor-pointer"
              >
                {/* Main Info */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                    {designer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">
                      {designer.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      {designer.email && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Mail size={12} /> {designer.email}
                        </span>
                      )}
                      {designer.contactInfo && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Phone size={12} /> {designer.contactInfo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Arrow / State Count */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {states.length} States
                  </span>
                  <ChevronRight
                    size={16}
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
                      className="absolute right-14 top-1/2 -translate-y-1/2 z-50 bg-white p-4 rounded-xl shadow-xl border border-gray-100 w-64 pointer-events-none"
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
                              className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-md border border-green-100"
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

      {/* RIGHT: State-wise Presence (Keep Pie Chart) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-6">
          State Distribution
        </h3>
        <div className="flex-1 min-h-[250px] relative">
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
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value, entry: any) => (
                  <span className="text-xs text-gray-600 ml-1">
                    {value} ({entry.payload.count})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mb-8">
            <span className="text-2xl font-bold text-gray-800">
              {stateData.reduce((a, b) => a + b.count, 0)}
            </span>
            <p className="text-xs text-gray-500">Total States</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CDNetworkOverview;
