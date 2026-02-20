import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  User,
  Layout,
} from "lucide-react";

interface TeamCalendarProps {
  members: any[];
  selectedTeamName?: string;
}

const TeamCalendar: React.FC<TeamCalendarProps> = ({
  members,
  selectedTeamName,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"user" | "project">("user");
  const [selectedMember, setSelectedMember] = useState<string>("all");

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, () => null);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-soft mb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-200 text-black border border-black/5 rounded-2xl shadow-sm">
            <CalendarIcon size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-black uppercase tracking-tight">
              Team Calendar - {selectedTeamName}
            </h3>
            <p className="text-black/60 text-sm font-bold tracking-wide">
              Schedule and task distribution for the current month
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-gray-100/50 p-1.5 rounded-2xl border border-black/5">
            <button
              onClick={() => setViewMode("user")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === "user"
                ? "bg-white text-black shadow-medium border border-black/5"
                : "text-black/40 hover:text-black"
                }`}
            >
              <User size={14} strokeWidth={2.5} />
              User View
            </button>
            <button
              onClick={() => setViewMode("project")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === "project"
                ? "bg-white text-black shadow-medium border border-black/5"
                : "text-black/40 hover:text-black"
                }`}
            >
              <Layout size={14} strokeWidth={2.5} />
              Project View
            </button>
          </div>

          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="px-5 py-3 bg-white border border-black/10 rounded-2xl text-xs font-black text-black uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all cursor-pointer shadow-sm"
          >
            <option value="all">Select Team Member</option>
            {members.map((m) => {
              const user = m.member || {};
              const name =
                `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                m.f_name ||
                "Unknown";
              return (
                <option key={m.id} value={m.id}>
                  {name}
                </option>
              );
            })}
          </select>

          <div className="flex items-center gap-3 bg-white border border-black/10 rounded-2xl px-4 py-1.5 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors text-black"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <span className="text-sm font-black text-black uppercase tracking-widest min-w-[140px] text-center">
              {monthName} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors text-black"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-black/20 border-2 border-black/20 rounded-[2rem] overflow-hidden shadow-inner">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
          <div
            key={day}
            className="bg-gray-100 py-3 text-center text-[10px] font-black text-black uppercase tracking-[0.2em]"
          >
            {day}
          </div>
        ))}
        {[...padding, ...days].map((day, idx) => {
          const date = new Date(year, currentDate.getMonth(), day || 1);
          date.setHours(0, 0, 0, 0);

          const peopleWorkingCount = day
            ? members.filter((member) => {
              return (member.tasks || []).some((task: any) => {
                if (!task.start_date || !task.due_date) return false;
                const start = new Date(task.start_date);
                const end = new Date(task.due_date);
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);
                return date >= start && date <= end;
              });
            }).length
            : 0;

          return (
            <div
              key={idx}
              className={`bg-white min-h-[120px] p-4 transition-all duration-300 hover:bg-gray-50 group ${day === null ? "bg-gray-50/50" : ""
                }`}
            >
              {day && (
                <div className="h-full flex flex-col">
                  <span className="text-sm font-black text-black/40 group-hover:text-black transition-colors">{day}</span>
                  <div className="mt-auto flex flex-col gap-2">
                    {peopleWorkingCount > 0 ? (
                      <div className="px-3 py-2 bg-green-100 text-black text-[10px] font-black uppercase tracking-tight rounded-xl border border-black/5 flex items-center justify-center gap-1.5 shadow-sm transform group-hover:scale-105 transition-transform">
                        <User size={12} strokeWidth={2.5} className="text-black" />
                        <span>{peopleWorkingCount} Working</span>
                      </div>
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 text-black/30 text-[10px] font-black uppercase tracking-widest rounded-xl border border-black/5 text-center">
                        No Active Tasks
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400 shadow-sm"></div>
          <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#6bbd45] shadow-sm"></div>
          <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">Projects</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-400 shadow-sm"></div>
          <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">On Leave (Weekdays)</span>
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar;
