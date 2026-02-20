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
            className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer group flex flex-col justify-between h-40 ${selectedTeam === team.id
              ? "bg-green-50 border-[#6bbd45] shadow-medium scale-[1.02]"
              : "bg-white border-black/5 hover:border-black/10 hover:shadow-soft"
              }`}
          >
            <div className="flex items-start justify-between">
              <h4
                className={`text-xl font-black tracking-tight transition-colors break-words max-w-[70%] ${selectedTeam === team.id
                  ? "text-black"
                  : "text-black/60 group-hover:text-black"
                  }`}
              >
                {team.name}
              </h4>
              <div
                className={`p-3 rounded-2xl transition-all ${selectedTeam === team.id
                  ? "bg-[#6bbd45] text-white shadow-lg shadow-green-200"
                  : "bg-gray-50 text-black/40 group-hover:bg-green-50 group-hover:text-black"
                  }`}
              >
                <Users size={20} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedTeam === team.id ? 'bg-[#6bbd45]/20 text-black' : 'bg-gray-100 text-black/60'
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
