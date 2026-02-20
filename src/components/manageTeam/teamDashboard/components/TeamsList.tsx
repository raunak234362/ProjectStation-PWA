import React from "react";
import { Users } from "lucide-react";

interface Team {
  id: string;
  name: string;
  members?: any[];
  is_active?: boolean;
}

interface TeamsListProps {
  filteredTeams: Team[];
  selectedTeam: string | null;
  onTeamSelect: (teamId: string) => void;
}

const TeamsList: React.FC<TeamsListProps> = ({
  filteredTeams,
  selectedTeam,
  onTeamSelect,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-black flex items-center gap-3 uppercase tracking-tight">
        <Users size={24} strokeWidth={2.5} className="text-[#6bbd45]" />
        Teams
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            onClick={() => onTeamSelect(team.id)}
            className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer group flex flex-col justify-between h-48 ${selectedTeam === team.id
              ? "bg-[#6bbd45]/10 border-black shadow-medium scale-[1.02]"
              : "bg-green-50/50 border-black/10 hover:border-black/40 hover:shadow-soft"
              }`}
          >
            <div className="flex items-start justify-between">
              <h4
                className={`text-2xl font-black tracking-tight transition-colors break-words max-w-[70%] text-black ${selectedTeam === team.id
                  ? "opacity-100"
                  : "opacity-80 group-hover:opacity-100"
                  }`}
              >
                {team.name}
              </h4>
              <div
                className={`p-4 rounded-[1.25rem] transition-all ${selectedTeam === team.id
                  ? "bg-black text-white shadow-lg shadow-black/20"
                  : "bg-white border border-black/5 text-black/40 group-hover:bg-black group-hover:text-white group-hover:border-black"
                  }`}
              >
                <Users size={22} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-black/5 ${selectedTeam === team.id ? 'bg-black text-white' : 'bg-white text-black/60 group-hover:text-black'
                }`}>
                {team.members?.length || 0} members
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamsList;
