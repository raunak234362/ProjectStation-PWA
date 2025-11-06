/* eslint-disable @typescript-eslint/no-explicit-any */
import { X } from "lucide-react";
import type { Fabricator, Team } from "../../../interface";
import { useState } from "react";
import Button from "../../fields/Button";
import AddTeamMembers from "./AddTeamMembers";

interface AllTeamProps {
  members: any;
  onClose: () => void;
}

const TeamMember = ({ members, onClose }: AllTeamProps) => {
  const [addTeamModal, setAddTeamModal] = useState(false);
  console.log(members);

  const handleOpenAddTeam = () => setAddTeamModal(true);
  const handleCloseAddTeam = () => setAddTeamModal(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-4xl bg-white rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 border-b pb-2">
          <h2 className="text-xl font-bold text-gray-800">Fabricator Teames</h2>
          <button onClick={onClose} aria-label="Close">
            <X className="w-6 h-6 text-gray-600 hover:text-black" />
          </button>
        </div>

        <p className="text-sm text-gray-700 font-semibold mb-2">
          {/* Fabricator: {fabricator.fabName} */}
        </p>

        {/* Add Team Button */}
        <Button onClick={handleOpenAddTeam}>+ Add Team</Button>

        {/* ✅ Team Table */}
        {/* <div className="mt-4 overflow-x-auto border rounded-lg">
          {fabricator.Team && fabricator.Team.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 font-medium">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Phone</th>
                  <th className="px-3 py-2 text-left">Address</th>
                  <th className="px-3 py-2 text-center">HQ</th>
                </tr>
              </thead>

              <tbody>
                {fabricator.Teames.map((Team: Team) => (
                  <tr key={Team.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">{Team.name}</td>
                    <td className="px-3 py-2">{Team.email}</td>
                    <td className="px-3 py-2">{Team.phone}</td>
                    <td className="px-3 py-2">
                      {Team.address}, {Team.city}, {Team.state} -{" "}
                      {Team.zipCode}, {Team.country}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {Team.isHeadquarters ? "✅" : "❌"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 py-4">No Teames found</p>
          )}
        </div> */}

        {/* ✅ Add Team Modal */}
        {addTeamModal && <AddTeamMembers />}
      </div>
    </div>
  );
};

export default TeamMember;
//
