/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../../ui/table";
import Service from "../../../api/Service";
import { toast } from "react-toastify";
import GetTeamById from "./GetTeamById";

interface Team {
  id: string;
  name: string;
  managerID: string;
  departmentID: string;
  manager: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  department: {
    name: string;
  };
}

const AllTeam = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // ── Fetch All Teams ──
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await Service.AllTeam(); // Adjust API method name
        const fetchedTeams: Team[] = Object.values(
          response.data || response || {}
        );

        setTeams(fetchedTeams);
      } catch (err: any) {
        console.error("Failed to fetch teams:", err);
        setError("Failed to load teams. Please try again.");
        toast.error("Could not load teams");
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // ── Delete Handler ──
  const handleDelete = async (selectedRows: Team[]) => {
    try {
      const ids = selectedRows.map((t) => t.id);
      // await Service.DeleteTeams(ids); // Uncomment when API ready
      console.log("Deleting teams:", ids);

      setTeams((prev) => prev.filter((t) => !ids.includes(t.id)));
      toast.success(`${selectedRows.length} team(s) deleted`);
    } catch (error) {
      toast.error("Failed to delete team(s)");
      console.log(error);
    }
  };

  // ── Row Click → Open Detail Modal ──
  const handleRowClick = (row: Team) => {
    setSelectedTeamId(row.id);
  };

  // ── Table Columns ──
  const columns: ColumnDef<Team>[] = [
    {
      accessorKey: "name",
      header: "Team Name",
      cell: ({ row }) => (
        <span className="font-black text-black uppercase tracking-tight text-sm">
          {row.original.name}
        </span>
      ),
    },
    {
      header: "Manager",
      accessorFn: (row) =>
        [row.manager?.firstName, row.manager?.middleName, row.manager?.lastName]
          .filter(Boolean)
          .join(" "),
      id: "manager",
      cell: ({ getValue }) => {
        const value = getValue() as string | undefined;
        return (
          <span className="text-black/60 font-bold uppercase tracking-wide text-xs">
            {value || "—"}
          </span>
        );
      },
    },
    {
      accessorFn: (row) => row.department?.name,
      header: "Department",
      id: "department",
      cell: ({ getValue }) => (
        <span className="px-5 py-1.5 bg-gray-100 text-black font-black uppercase tracking-widest rounded-full text-[10px] border border-black/5 shadow-sm">
          {String(getValue() ?? "—")}
        </span>
      ),
    },
  ];

  // ── Loading / Error States ──
  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 bg-white rounded-[2.5rem] border border-black/5 shadow-soft">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black/5 border-t-black"></div>
          <span className="text-black font-black uppercase tracking-widest text-xs">Loading teams...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-red-50 rounded-[2.5rem] border border-red-100">
        <p className="text-red-600 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-soft border border-black/5 overflow-hidden">
      <div className="p-10 border-b border-black/5 bg-gray-50/30">
        <h2 className="text-3xl font-black text-black uppercase tracking-tight">All Teams</h2>
        <p className="text-black/60 text-sm font-bold tracking-wide mt-2">
          Manage and view all project teams in the system
        </p>
      </div>

      <div className="p-8">
        <DataTable
          columns={columns}
          data={teams}
          onRowClick={handleRowClick}
          onDelete={handleDelete}
          pageSizeOptions={[10, 20, 50]}
          detailComponent={({ row }) => <GetTeamById id={row.id} />}
        />
      </div>

      {/* Optional: Close detail on backdrop */}
      {selectedTeamId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSelectedTeamId(null)}
        />
      )}
    </div>
  );
};

export default AllTeam;
