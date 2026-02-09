/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import type { Fabricator, UserData } from "../../../interface";
import Button from "../../fields/Button";
import { X, UserCheck, Plus, MoreVertical } from "lucide-react";
import AddClients from "./AddClient";
import Service from "../../../api/Service";
import { toast } from "react-toastify";
import DataTable from "../../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import GetEmployeeByID from "../../manageTeam/employee/GetEmployeeByID";
import { motion, AnimatePresence } from "motion/react";

interface AllClientProps {
  fabricator: Fabricator;
  onClose: () => void;
}

const AllClients = ({ fabricator, onClose }: AllClientProps) => {
  const [addClientModal, setAddClientModal] = useState(false);
  const [clients, setClients] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllClientsByFabricatorID = async (fabId: string) => {
    if (!fabId) return;
    setIsLoading(true);
    try {
      const response = await Service.FetchAllClientsByFabricatorID(fabId);
      const rawClients: any[] = Array.isArray(response.data) ? response.data : [];
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
        extension: c.extensionNumber ?? c.extension ?? "",
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

  useEffect(() => {
    fetchAllClientsByFabricatorID(fabricator.id);
  }, [fabricator.id]);

  const openAddClient = () => setAddClientModal(true);
  const closeAddClient = () => {
    setAddClientModal(false);
    fetchAllClientsByFabricatorID(fabricator.id);
  };

  const columns: ColumnDef<UserData>[] = useMemo(
    () => [
      {
        accessorFn: (r) => [r.firstName, r.lastName].filter(Boolean).join(" "),
        header: "Name",
        id: "fullName",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">
              {row.original.firstName.charAt(0)}{row.original.lastName.charAt(0)}
            </div>
            <span className="font-bold text-slate-700 dark:text-white">{row.getValue("fullName")}</span>
          </div>
        )
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 font-bold text-slate-500 dark:text-slate-400">
            <span>{row.original.phone}</span>
            {row.original.extension && (
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 dark:text-slate-500 capitalize">Ext: {row.original.extension}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "designation",
        header: "Designation",
        cell: ({ row }) => (
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100/50 dark:border-blue-900/30">
            {row.original.designation}
          </span>
        )
      },
      {
        id: "actions",
        header: "",
        cell: () => <MoreVertical size={16} className="text-slate-300 dark:text-slate-600" />
      }
    ],
    []
  );

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm shadow-2xl overflow-hidden" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative border border-white/20 dark:border-slate-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <UserCheck className="w-6 h-6" />
              </div>
              Points of Contact
            </h2>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">POC management for {fabricator.fabName}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={openAddClient}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 border-none"
            >
              <Plus size={16} /> Add POC
            </Button>
            <button
              onClick={onClose}
              className="p-3 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-90"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Table/Data Area */}
        <div className="flex-1 overflow-auto p-6 md:p-10 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 dark:border-slate-800 border-t-blue-600 mb-4"></div>
              <p className="text-sm font-black uppercase tracking-widest">Synchronizing POC Data...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
              <DataTable
                columns={columns}
                data={clients}
                onRowClick={() => { }}
                detailComponent={({ row }) => <GetEmployeeByID id={row.id} />}
                pageSizeOptions={[5, 10, 25]}
              />
            </div>
          )}
        </div>

        {/* Add Client Modal */}
        <AnimatePresence>
          {addClientModal && (
            <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
              <AddClients fabricator={fabricator} onClose={closeAddClient} />
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AllClients;
