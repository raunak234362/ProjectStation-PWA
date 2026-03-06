import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Users, Globe, HardHat } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CDSnapshotCardsProps {
  stats: {
    totalCDs: number;
    totalCountries: number;
    totalStates: number;
    totalEngineers: number;
    activeRFQs: number;
  };
  countries: string[];
}

const CountriesPopover = ({
  countries,
  targetRect,
}: {
  countries: string[];
  targetRect: DOMRect;
}) => {
  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "fixed",
        left: targetRect.left + targetRect.width / 2,
        top: targetRect.bottom + 12,
        transform: "translateX(-50%)",
      }}
      className="z-100 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-2xl border border-black/10 dark:border-slate-700 w-72 pointer-events-none"
    >
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-black/10 dark:border-slate-700/50">
        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Globe size={16} className="text-white" />
        </div>
        <div>
          <span className="text-xs font-bold text-black dark:text-slate-100 block">
            Countries Covered
          </span>
          <span className="text-[10px] text-black font-medium">
            {countries.length}{" "}
            {countries.length === 1 ? "Country" : "Countries"}
          </span>
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto custom-scrollbar pr-1">
        <div className="flex flex-wrap gap-2">
          {countries.length > 0 ? (
            countries.map((country, i) => (
              <button
                key={i}
                className="group relative px-3 py-2 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 text-black dark:text-blue-400 rounded-xl border border-black/10 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 shadow-sm hover:shadow-md text-[11px] font-bold tracking-wide"
              >
                <span className="relative z-10">{country}</span>
                <div className="absolute inset-0 bg-linear-to-br from-blue-400/0 to-indigo-400/0 group-hover:from-blue-400/10 group-hover:to-indigo-400/10 rounded-xl transition-all duration-200"></div>
              </button>
            ))
          ) : (
            <div className="w-full text-center py-6">
              <Globe
                size={32}
                className="mx-auto text-black dark:text-slate-600 mb-2"
              />
              <span className="text-xs text-black italic font-medium">
                No countries listed
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-3 h-3 bg-white dark:bg-slate-800 border-l border-t border-black/10 dark:border-slate-700 rotate-45 transform"></div>
    </motion.div>,
    document.body,
  );
};

const CDSnapshotCards: React.FC<CDSnapshotCardsProps> = ({
  stats,
  countries,
}) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);

  const cards = [
    {
      value: stats.totalCDs,
      subText: "Registered Designers",
      icon: Users,
      color: "emerald",
    },
    {
      value: `${stats.totalCountries} COUNTRIES`,
      subText: `${stats.totalStates} Operational States`,
      icon: Globe,
      color: "blue",
      hasTooltip: true,
    },
    {
      value: stats.totalEngineers,
      subText: "Total POC",
      icon: HardHat,
      color: "indigo",
    },

  ];

  const colorMap: Record<
    string,
    { shadow: string; icon: string; bg: string; accent: string }
  > = {
    emerald: {
      shadow: "shadow-emerald-100 dark:shadow-none",
      icon: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      accent: "from-emerald-500 to-teal-600",
    },
    blue: {
      shadow: "shadow-blue-100 dark:shadow-none",
      icon: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      accent: "from-blue-500 to-indigo-600",
    },
    indigo: {
      shadow: "shadow-indigo-100 dark:shadow-none",
      icon: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      accent: "from-indigo-500 to-purple-600",
    },
    amber: {
      shadow: "shadow-amber-100 dark:shadow-none",
      icon: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      accent: "from-amber-500 to-orange-600",
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          key={index}
          onMouseEnter={(e) => {
            if (card.hasTooltip) {
              setHoveredCard(index);
              setHoverRect(e.currentTarget.getBoundingClientRect());
            }
          }}
          onMouseLeave={() => {
            setHoveredCard(null);
            setHoverRect(null);
          }}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-black/5 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="flex flex-row items-center gap-4 relative z-10 h-full">
            <div
              className={`p-2.5 sm:p-3 rounded-2xl shrink-0 ${colorMap[card.color].bg} ${colorMap[card.color].icon} group-hover:scale-105 transition-transform duration-300`}
            >
              <card.icon size={20} strokeWidth={2.5} />
            </div>

            <div className="flex flex-col min-w-0">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black dark:text-white tracking-tight leading-tight truncate">
                {card.value}
              </h3>
              <p className="text-xs sm:text-sm text-black/50 dark:text-slate-500 uppercase font-black tracking-widest mt-0.5">
                {card.subText}
              </p>
            </div>
          </div>

          {/* Subtle aesthetic blob */}
          <div
            className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity bg-linear-to-br ${colorMap[card.color].accent}`}
          />
        </motion.div>
      ))}

      {/* Countries Tooltip */}
      <AnimatePresence>
        {hoveredCard === 1 && hoverRect && (
          <CountriesPopover countries={countries} targetRect={hoverRect} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CDSnapshotCards;
