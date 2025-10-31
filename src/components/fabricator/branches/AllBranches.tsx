/* eslint-disable @typescript-eslint/no-explicit-any */
import { X } from "lucide-react";
import type { Fabricator, Branch } from "../../../interface";
import AddBranch from "./AddBranch";
import { useState } from "react";
import Button from "../../fields/Button";

interface AllBranchProps {
  fabricator: Fabricator;
  onClose: () => void;
}

const AllBranches = ({ fabricator, onClose }: AllBranchProps) => {
  const [addBranchModal, setAddBranchModal] = useState(false);

  const handleOpenAddBranch = () => setAddBranchModal(true);
  const handleCloseAddBranch = () => setAddBranchModal(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-4xl bg-white rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 border-b pb-2">
          <h2 className="text-xl font-bold text-gray-800">
            Fabricator Branches
          </h2>
          <button onClick={onClose} aria-label="Close">
            <X className="w-6 h-6 text-gray-600 hover:text-black" />
          </button>
        </div>

        <p className="text-sm text-gray-700 font-semibold mb-2">
          Fabricator: {fabricator.fabName}
        </p>

        {/* Add Branch Button */}
        <Button onClick={handleOpenAddBranch}>
          + Add Branch
        </Button>

        {/* ✅ Branch Table */}
        <div className="mt-4 overflow-x-auto border rounded-lg">
          {fabricator.branches && fabricator.branches.length > 0 ? (
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
                {fabricator.branches.map((branch: Branch) => (
                  <tr key={branch.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">{branch.name}</td>
                    <td className="px-3 py-2">{branch.email}</td>
                    <td className="px-3 py-2">{branch.phone}</td>
                    <td className="px-3 py-2">
                      {branch.address}, {branch.city}, {branch.state} -{" "}
                      {branch.zipCode}, {branch.country}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {branch.isHeadquarters ? "✅" : "❌"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 py-4">No branches found</p>
          )}
        </div>

        {/* ✅ Add Branch Modal */}
        {addBranchModal && (
          <AddBranch
            fabricatorId={fabricator.id}
            onClose={handleCloseAddBranch}
          />
        )}
      </div>
    </div>
  );
};

export default AllBranches;
