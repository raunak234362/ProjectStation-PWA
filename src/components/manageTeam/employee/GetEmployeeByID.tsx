// components/employee/GetEmployeeByID.tsx
import { useEffect, useState } from "react";
import Service from "../../../api/Service";
import type { UserData } from "../../../interface";
import { Loader2, AlertCircle } from "lucide-react";
import Button from "../../fields/Button";
import EditEmployee from "./EditEmployee";

interface GetEmployeeByIDProps {
  id: string;
}

const GetEmployeeByID = ({ id }: GetEmployeeByIDProps) => {
  const [employee, setEmployee] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModel, setEditModel] = useState<UserData | null>(null);
  useEffect(() => {
    const fetchEmployee = async () => {
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
    };

    fetchEmployee();
  }, [id]);

  const handleModel = (employee: UserData) => {
    console.log(employee);
    setEditModel(employee);
  };
  const handleModelClose= ()=>{
    setEditModel(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-xl shadow-inner">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-teal-800">
          {employee.firstName} {employee.middleName} {employee.lastName}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            employee.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {employee.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
        {/* Left Column */}
        <div className="space-y-3">
          <InfoRow label="Employee ID" value={employee.id} />
          <InfoRow label="Username" value={employee.username} />
          <InfoRow
            label="Email"
            value={employee.email}
            href={`mailto:${employee.email}`}
          />
          <InfoRow
            label="Phone"
            value={employee.phone}
            href={`tel:${employee.phone}`}
          />
          <InfoRow label="Alt Phone" value={employee.altPhone || "—"} />
          <InfoRow label="Landline" value={employee.landline || "—"} />
          <InfoRow label="Alt Landline" value={employee.altLandline || "—"} />
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <InfoRow label="Designation" value={employee.designation} />
          <InfoRow
            label="Role"
            value={
              <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-medium">
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
          <InfoRow label="Created" value={formatDate(employee.createdAt)} />
          <InfoRow label="Updated" value={formatDate(employee.updatedAt)} />
        </div>
      </div>

      {/* Address Section */}
      {(employee.address ||
        employee.city ||
        employee.state ||
        employee.country ||
        employee.zipCode) && (
        <div className="mt-6 pt-5 border-t border-teal-200">
          <h4 className="font-semibold text-teal-700 mb-2">Address</h4>
          <div className="text-sm space-y-1 text-gray-700">
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
      <div className="py-2 flex gap-2">
        <Button
          onClick={() => handleModel(employee)}
          className="py-1 px-2 text-lg"
        >
        Employee Progress Status
        </Button>
        <Button
          onClick={() => handleModel(employee)}
          className="py-1 px-2 text-lg"
        >
          Edit Profile
        </Button>
        <Button className="py-1 px-2 text-lg">Disable Profile</Button>
      </div>
      {editModel && (
        <EditEmployee employeeData={employee} onClose={handleModelClose}/>
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
  <div className="flex justify-between">
    <span className="font-bold text-gray-600">{label}:</span>
    {href ? (
      <a
        href={href}
        className="text-teal-600 hover:underline hover:text-teal-800 transition-colors"
      >
        {value}
      </a>
    ) : (
      <span className="text-gray-900">{value}</span>
    )}
  </div>
);

export default GetEmployeeByID;
