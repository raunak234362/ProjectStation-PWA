import React, { useEffect, useState } from "react";
import Service from "../../api/Service";
import type { ChangeOrderItem } from "../../interface";
import { AlertCircle, Loader2 } from "lucide-react";
import { openFileSecurely } from "../../utils/openFileSecurely";

const Info = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <h4 className="text-sm text-gray-500">{label}</h4>
    <div className="text-gray-800 font-medium">{value}</div>
  </div>
);

interface GetCOByIDProps {
  id: string;
  projectId?: string
}

const GetCOByID = ({ id, projectId }: GetCOByIDProps) => {
  const [loading, setLoading] = useState(true);
  const [co, setCO] = useState<ChangeOrderItem | null>(null);
  const [error, setError] = useState<string | null>(null);
console.log(projectId);

  const fetchCO = async () => {
    try {
      if (!projectId) {
        setError("Project ID is missing");
        setLoading(false);
        return;
      }

      setLoading(true);

      const response = await Service.GetChangeOrder(projectId);
      const allCOs = response.data || [];

      const selectedCO = allCOs.find((item: any) => item.id === id);

      if (!selectedCO) {
        throw new Error("Change Order not found");
      }

      setCO(selectedCO);
    } catch (err) {
      console.error(err);
      setError("Failed to load Change Order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && projectId) fetchCO();
  }, [id, projectId]);



  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading Change Order details...
      </div>
    );
  }

  if (error || !co) {
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error || "Change Order not found"}
      </div>
    );
  }


  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl shadow-md space-y-5">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-teal-700">
            CO #{co.changeOrderNumber}
          </h1> 

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              co.isAproovedByAdmin === true
                ? "bg-green-100 text-green-700"
                : co.isAproovedByAdmin === false
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {co.isAproovedByAdmin === true
              ? "Approved"
              : co.isAproovedByAdmin === false
              ? "Rejected"
              : "Pending"}
          </span>
        </div>

      

        <Info
          label="Sender"
          value={
            co.senders
              ? `${co.senders.firstName ?? ""} ${co.senders.lastName ?? ""}`
              : "—"
          }
        />

        <Info
          label="Recipient"
          value={
            co.Recipients
              ? `${co.Recipients.firstName ?? ""} ${co.Recipients.lastName ?? ""}`
              : "—"
          }
        />

        {/* Remarks */}
        <div>
          <h4 className="font-semibold text-gray-600 mb-1">Remarks</h4>
          <p className="bg-gray-50 p-3 rounded-lg border">
            {co.remarks || "—"}
          </p>
        </div>

        {/* Description */}
        <div>
          <h4 className="font-semibold text-gray-600 mb-1">Description</h4>
          <p className="bg-gray-50 p-3 rounded-lg border">
            {co.description || "—"}
          </p>
        </div>

        {/* Reference Link */}
        {co.link && (
          <Info
            label="Reference Link"
            value={
              <a
                href={co.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 underline"
              >
                {co.link}
              </a>
            }
          />
        )}

        {/* Files */}
        {(co.files ?? []).length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-600 mb-2">Attachments</h4>
            <ul className="space-y-1">
              {(co.files ?? []).map((file: any) => (
                <li key={file.id}>
                  <span
                    className="text-teal-700 underline cursor-pointer"
                    onClick={() =>
                      openFileSecurely("changeOrder", co.id, file.id)
                    }
                  >
                    {file.originalName}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetCOByID;
