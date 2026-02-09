/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import type { ConnectionDesigner, UserData } from "../../../interface";
import Button from "../../fields/Button";
import { X } from "lucide-react";
import DataTable from "../../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import GetEmployeeByID from "../../manageTeam/employee/GetEmployeeByID";
import AddCDEngineer from "./AddCDEngineer";

interface AllCDEngineerProps {
  designerData: ConnectionDesigner;
  onClose: () => void;
}

const AllCDEngineer = ({ onClose, designerData }: AllCDEngineerProps) => {
  const [addEngineerModal, setAddEngineerModal] = useState(false);
  const [engineers, setEngineers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Load engineers directly from designerData ──
  useEffect(() => {
    setIsLoading(true);
    try {
      if (Array.isArray(designerData?.CDEngineers)) {
        const mappedEngineers: UserData[] = designerData.CDEngineers.map(
          (e: any) => ({
            id: e.id ?? "",
            username: e.username ?? "",
            email: e.email ?? "",
            departmentId: e.departmentId ?? "",
            isFirstLogin: e.isFirstLogin ?? false,
            firstName: e.firstName ?? "",
            middleName: e.middleName ?? "",
            lastName: e.lastName ?? "",
            phone: e.phone ?? "",
            landline: e.landline ?? "",
            altLandline: e.altLandline ?? "",
            altPhone: e.altPhone ?? "",
            zipCode: e.zipCode ?? "",
            designation: e.designation ?? "",
            city: e.city ?? "",
            state: e.state ?? "",
            country: e.country ?? "",
            address: e.address ?? "",
            role: e.role ?? "ENGINEER",
            isActive: e.isActive ?? true,
            extension: e.extensionNumber ?? e.extension ?? "",
            createdAt: e.createdAt ?? "",
            updatedAt: e.updatedAt ?? "",
          })
        );

        setEngineers(mappedEngineers);
      } else {
        setEngineers([]);
      }
    } catch (error) {
      console.error("Error mapping CDEngineers:", error);
      setEngineers([]);
    } finally {
      setIsLoading(false);
    }
  }, [designerData]);

  // ── Modal Handlers ──
  const openAddEngineer = () => setAddEngineerModal(true);
  const closeAddEngineer = () => {
    setAddEngineerModal(false);
    // Optionally re-fetch or refresh local data if AddCDEngineer modifies designerData
  };

  // ── Table Columns ──
  const columns: ColumnDef<UserData>[] = useMemo(
    () => [
      {
        accessorFn: (r) =>
          [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" "),
        header: "Engineer Name",
        id: "fullName",
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <span>
            {row.original.phone}
            {row.original.extension && (
              <span className="text-gray-700 text-xs ml-1">
                (Ext: {row.original.extension})
              </span>
            )}
          </span>
        ),
      },
      { accessorKey: "designation", header: "Designation" },
      {
        accessorFn: (r) => {
          const parts = [];
          if (r.address) parts.push(r.address);
          if (r.city) parts.push(r.city);
          if (r.state) parts.push(r.state);
          if (r.country) parts.push(r.country);
          return parts.join(", ");
        },
        header: "Address",
        id: "fullAddress",
        cell: ({ row }) => (
          <span className="text-gray-700">{row.getValue("fullAddress")}</span>
        ),
      },
    ],
    []
  );

  // ── Row Click (View engineer details) ──
  const handleRowClick = (row: UserData) => {
    console.log("Engineer clicked:", row.id);
  };

  // ── UI ──
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[40px] shadow-3xl flex flex-col max-h-[92vh] border border-white/20 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl  text-gray-800 dark:text-white tracking-tight">
              Workforce Intelligence
            </h2>
            <p className="text-[10px]  text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">
              Manage engineering team for {designerData.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-2xl transition-all border border-gray-100 dark:border-slate-700 hover:border-red-100 dark:hover:border-red-900/30"
            aria-label="Close"
          >
            <X className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>

        {/* Action Row */}
        <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center ">
              {engineers.length}
            </div>
            <div>
              <p className="text-[10px]  text-gray-400 dark:text-slate-500 uppercase tracking-widest">Total Active</p>
              <p className="text-xs  text-gray-700 dark:text-slate-300">Skilled Engineers</p>
            </div>
          </div>
          <Button
            onClick={openAddEngineer}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs  uppercase tracking-widest transition-all shadow-lg shadow-green-500/20"
          >
            + Add New Engineer
          </Button>
        </div>

        {/* DataTable */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4"></div>
              <p className="text-[10px]  uppercase tracking-widest">Processing workforce data...</p>
            </div>
          ) : engineers.length > 0 ? (
            <div className="bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
              <DataTable
                columns={columns}
                data={engineers}
                onRowClick={handleRowClick}
                detailComponent={({ row }) => <GetEmployeeByID id={row.id} />}
                pageSizeOptions={[5, 10, 25]}
              />
            </div>
          ) : (
            <div className="text-center py-24 bg-slate-50/50 dark:bg-slate-800/20 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-slate-800">
              <p className="text-[10px]  text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                No engineers found in this network
              </p>
              <Button
                onClick={openAddEngineer}
                className="mt-6 px-8 py-3 bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50 rounded-xl text-xs  uppercase tracking-widest"
              >
                Onboard First Engineer
              </Button>
            </div>
          )}
        </div>

        {/* Add Engineer Modal */}
        {addEngineerModal && (
          <AddCDEngineer designer={designerData} onClose={closeAddEngineer} />
        )}
      </div>
    </div>
  );
};

export default AllCDEngineer;
