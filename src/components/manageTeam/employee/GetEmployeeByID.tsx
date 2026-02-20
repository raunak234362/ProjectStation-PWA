// components/employee/GetEmployeeByID.tsx
import { useEffect, useState, useCallback } from "react";
import Service from "../../../api/Service";
import type { UserData } from "../../../interface";
import { Loader2, AlertCircle } from "lucide-react";
import Button from "../../fields/Button";
import EditEmployee from "./EditEmployee";
import { formatDateTime } from "../../../utils/dateUtils";

interface GetEmployeeByIDProps {
  id: string;
}

const GetEmployeeByID = ({ id }: GetEmployeeByIDProps) => {
  const [employee, setEmployee] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModel, setEditModel] = useState<UserData | null>(null);
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";
  const fetchEmployee = useCallback(async () => {
    if (!id) {
      setError("Invalid employee ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await Service.FetchEmployeeByID(id);
      setEmployee(response?.data?.user || null);
    } catch (err) {
      const msg = "Failed to load employee";
      setError(msg);
      console.error("Error fetching employee:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const handleModel = (employee: UserData) => {
    console.log(employee);
    setEditModel(employee);
  };
  const handleModelClose = () => {
    setEditModel(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-700">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading employee details...
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error || "Employee not found"}
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 p-10 rounded-3xl border border-black/5 shadow-inner">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-black/5 pb-4">
        <h3 className="text-2xl font-black text-black uppercase tracking-tight">
          {employee.firstName} {employee.middleName} {employee.lastName}
        </h3>
        <span
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-black/5 shadow-sm ${employee.isActive
              ? "bg-green-100 text-black shadow-green-100/50"
              : "bg-red-100 text-black shadow-red-100/50"
            }`}
        >
          {employee.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-sm">
        {/* Left Column */}
        <div className="space-y-4">
          <InfoRow label="Employee ID" value={employee.id} />
          <InfoRow label="Username" value={employee.username} />
          <InfoRow
            label="Email"
            value={employee.email}
            href={`mailto:${employee.email}`}
          />
          <InfoRow
            label="Phone"
            value={
              <span>
                {employee.phone}
                {employee.extension && (
                  <span className="text-black/40 text-xs ml-1 font-bold">
                    (Ext: {employee.extension})
                  </span>
                )}
              </span>
            }
            href={`tel:${employee.phone}`}
          />
          <InfoRow label="Alt Phone" value={employee.altPhone || "—"} />
          <InfoRow label="Landline" value={employee.landline || "—"} />
          <InfoRow label="Alt Landline" value={employee.altLandline || "—"} />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <InfoRow label="Designation" value={employee.designation} />
          <InfoRow
            label="Role"
            value={
              <span className="px-4 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                {employee.role}
              </span>
            }
          />
          <InfoRow
            label="Department"
            value={employee.departmentId || "Not Assigned"}
          />
          <InfoRow
            label="First Login"
            value={employee.isFirstLogin ? "Yes" : "No"}
          />
          <InfoRow label="Created" value={formatDateTime(employee.createdAt)} />
          <InfoRow label="Updated" value={formatDateTime(employee.updatedAt)} />
        </div>
      </div>

      {/* Address Section */}
      {(employee.address ||
        employee.city ||
        employee.state ||
        employee.country ||
        employee.zipCode) && (
          <div className="mt-10 pt-8 border-t border-black/5">
            <h4 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-4">Address Information</h4>
            <div className="text-sm space-y-2 text-black font-bold tracking-tight">
              {employee.address && <p>{employee.address}</p>}
              <p>
                {[employee.city, employee.state, employee.zipCode]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
              {employee.country && <p>{employee.country}</p>}
            </div>
          </div>
        )}
      <div className="flex flex-wrap gap-4 mt-10 pt-8 border-t border-black/5">
        {employee?.role !== "CLIENT" &&
          employee?.role !== "CLIENT_ADMIN" &&
          employee?.role !== "CLIENT_PROJECT_COORDINATOR" &&
          employee?.role !== "CLIENT_GENERAL_CONSTRUCTOR" && (
            <Button
              onClick={() => handleModel(employee)}
              className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black/90 transition-all shadow-medium"
            >
              Update Employee Data
            </Button>
          )}
        {userRole === "admin" && (
          <>
            <Button
              onClick={() => handleModel(employee)}
              className="flex items-center gap-2 px-8 py-3 bg-white border border-black/10 rounded-2xl text-black font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
            >
              Edit Profile
            </Button>
            <Button className="flex items-center gap-2 px-8 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all shadow-sm">
              Archive Profile
            </Button>
          </>
        )}
      </div>
      {editModel && (
        <EditEmployee
          employeeData={employee}
          onClose={handleModelClose}
          onSuccess={fetchEmployee}
        />
      )}
    </div>
  );
};

// Reusable info row
const InfoRow = ({
  label,
  value,
  href,
}: {
  label: string;
  value: React.ReactNode;
  href?: string;
}) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-black/40 font-black uppercase tracking-[0.15em] text-[10px]">{label}</span>
    {href ? (
      <a
        href={href}
        className="text-black font-black text-sm tracking-tight hover:underline transition-colors"
      >
        {value}
      </a>
    ) : (
      <span className="text-black font-black text-sm tracking-tight">{value}</span>
    )}
  </div>
);

export default GetEmployeeByID;
