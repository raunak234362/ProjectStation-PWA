/* eslint-disable @typescript-eslint/no-explicit-any */
import { X, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../../ui/table";
import Button from "../../fields/Button";
import AddTeamMembers from "./AddTeamMembers";

interface AllTeamProps {
  members: any;
  onClose: () => void;
}

const TeamMember = ({ members, onClose }: AllTeamProps) => {
  const [addTeamModal, setAddTeamModal] = useState(false);

  const handleOpenAddTeam = () => setAddTeamModal(true);
  const handleCloseAddTeam = () => setAddTeamModal(false);

  const tableData = members?.members || [];

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">
          {row.original.role}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          onClick={() => console.log("DELETE:", row.original.id)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 size={18} />
        </Button>
      ),
      enableSorting: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-[900px] bg-white rounded-xl p-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 border-b pb-2">
          <h2 className="text-xl font-semibold text-gray-800">
            Team - <span className="font-bold">{members.name}</span>
          </h2>
          <button onClick={onClose} aria-label="Close">
            <X className="w-6 h-6 text-gray-600 hover:text-black" />
          </button>
        </div>

        {/* Add Team Member Button */}
        <Button onClick={handleOpenAddTeam} className="mb-3">
          + Add Team Member
        </Button>

        {/* ✅ DataTable */}
        <div className="border rounded-lg">
          <DataTable
            columns={columns}
            data={tableData}
            searchPlaceholder="Search teams..."
            pageSizeOptions={[10, 20, 50]}
          />
        </div>

        {/* ✅ Add Member Modal */}
        {addTeamModal && (
          <AddTeamMembers teamMember={members} onClose={handleCloseAddTeam} />
        )}
      </div>
    </div>
  );
};

export default TeamMember;
