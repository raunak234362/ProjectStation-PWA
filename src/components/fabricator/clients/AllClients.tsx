/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/fabricator/AllClients.tsx
import { useEffect, useState } from "react";
import type { Fabricator, UserData } from "../../../interface";
import Button from "../../fields/Button";
import { X } from "lucide-react";
import AddClients from "./AddClient";
import Service from "../../../api/Service";
import { toast } from "react-toastify";

interface AllClientProps {
  fabricator: Fabricator;
  onClose: () => void;
}

const AllClients = ({ fabricator, onClose }: AllClientProps) => {
  const [addClientModal, setAddClientModal] = useState(false);
  const [clients, setClients] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch clients from API ──
  const fetchAllClientsByFabricatorID = async (fabId: string) => {
    if (!fabId) return;

    setIsLoading(true);
    try {
      const response = await Service.FetchAllClientsByFabricatorID(fabId);

      // API returns: { data: [ {...}, ... ], message: "..." }
      const rawClients: any[] = Array.isArray(response.data)
        ? response.data
        : [];

      // Map raw → UserData (safe fallback)
      const mappedClients: UserData[] = rawClients.map((c) => ({
        id: c.id ?? "",
        username: c.username ?? "",
        email: c.email ?? "",
        firstName: c.firstName ?? "",
        middleName: c.middleName ?? null,
        lastName: c.lastName ?? "",
        phone: c.phone ?? "",
        landline: c.landline ?? null,
        altLandline: c.altLandline ?? null,
        altPhone: c.altPhone ?? null,
        designation: c.designation ?? "",
        city: c.city ?? "",
        zipCode: c.zipCode ?? "",
        state: c.state ?? "",
        country: c.country ?? "",
        address: c.address ?? "",
        role: c.role ?? "EMPLOYEE",
        departmentId: c.departmentId ?? "",
        isActive: c.isActive ?? true,
        branchId: c.branchId,
        isFirstLogin: c.isFirstLogin ?? false,
        createdAt: c.createdAt ?? "",
        updatedAt: c.updatedAt ?? "",
      }));

      setClients(mappedClients);
    } catch (error: any) {
      console.error("Failed to fetch clients:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch clients");
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Load on mount & fabricator change ──
  useEffect(() => {
    fetchAllClientsByFabricatorID(fabricator.id);
  }, [fabricator.id]);

  const openAddClient = () => setAddClientModal(true);
  const closeAddClient = () => {
    setAddClientModal(false);
    // Refresh list after adding
    fetchAllClientsByFabricatorID(fabricator.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Fabricator POCs (Clients)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black transition"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Fabricator Name */}
        <div className="px-5 pt-3">
          <p className="text-sm font-semibold text-gray-700">
            Fabricator:{" "}
            <span className="font-bold text-blue-600">
              {fabricator.fabName}
            </span>
          </p>
        </div>

        {/* Add Button */}
        <div className="px-5 pt-3">
          <Button onClick={openAddClient} className="text-sm">
            + Add POC
          </Button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto mt-4 border-t">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mr-2"></div>
              Loading clients...
            </div>
          ) : clients.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0 font-medium">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Designation</th>
                  <th className="px-4 py-3 text-left">Address</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">
                      {client.firstName} {client.middleName || ""}{" "}
                      {client.lastName}
                    </td>
                    <td className="px-4 py-3">{client.email}</td>
                    <td className="px-4 py-3">{client.phone}</td>
                    <td className="px-4 py-3">{client.designation}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {client.address && `${client.address}, `}
                      {client.city && `${client.city}, `}
                      {client.state && `${client.state} - `}
                      {client.zipCode && `${client.zipCode}, `}
                      {client.country}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No clients (POCs) found for this fabricator.
            </div>
          )}
        </div>

        {/* Add Client Modal */}
        {addClientModal && (
          <AddClients fabricator={fabricator} onClose={closeAddClient} />
        )}
      </div>
    </div>
  );
};

export default AllClients;
