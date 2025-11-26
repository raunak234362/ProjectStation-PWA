import { useEffect, useState } from "react";
import Service from "../../../api/Service";
import { Loader2, AlertCircle, FileText, Link2, MapPin } from "lucide-react";
import Button from "../../fields/Button";
import { openFileSecurely } from "../../../utils/openFileSecurely";
import type { ConnectionDesigner } from "../../../interface";

interface GetConnectionDesignerByIDProps {
  id: string;
}

const truncateText = (text: string, max: number = 40) =>
  text.length > max ? text.substring(0, max) + "..." : text;

const GetConnectionDesignerByID = ({ id }: GetConnectionDesignerByIDProps) => {
  const [designer, setDesigner] = useState<ConnectionDesigner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Connection Designer details
  useEffect(() => {
    const fetchDesigner = async () => {
      if (!id) {
        setError("Invalid Connection Designer ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await Service.FetchConnectionDesignerByID(id);
        setDesigner(response?.data || null);
      } catch (err) {
        console.error("Error fetching Connection Designer:", err);
        setError("Failed to load Connection Designer details");
      } finally {
        setLoading(false);
      }
    };

    fetchDesigner();
  }, [id]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // ---------------- Loading / Error states ----------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading Connection Designer details...
      </div>
    );
  }

  if (error || !designer) {
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error || "Connection Designer not found"}
      </div>
    );
  }

  // ---------------- Render Main Content ----------------
  return (
    <div className="bg-gradient-to-br from-teal-50 to-teal-50 p-6 rounded-xl shadow-inner text-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-teal-800">{designer.name}</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            designer.isDeleted
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-800"
          }`}
        >
          {designer.isDeleted ? "Inactive" : "Active"}
        </span>
      </div>

      {/* Basic Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          {designer.websiteLink && (
            <InfoRow
              label="Website"
              value={
                <a
                  href={designer.websiteLink}
                  target="_blank"
                  rel="noreferrer"
                  title={designer.websiteLink}
                  className="text-cyan-700 underline hover:text-cyan-900"
                >
                  {truncateText(designer.websiteLink, 25)}
                </a>
              }
            />
          )}
          {designer.email && (
            <InfoRow
              label="Email"
              value={
                <a
                  href={`mailto:${designer.email}`}
                  className="text-cyan-700 hover:text-cyan-900"
                >
                  {designer.email}
                </a>
              }
            />
          )}
          {designer.contactInfo && (
            <InfoRow label="Contact Info" value={designer.contactInfo} />
          )}
          {designer.location && (
            <InfoRow
              label="Location"
              value={
                <span className="flex items-center gap-1 text-gray-800">
                  <MapPin className="w-4 h-4 text-teal-600" />{" "}
                  {designer.location}
                </span>
              }
            />
          )}
        </div>

        <div className="space-y-3">
          <InfoRow label="Created" value={formatDate(designer.createdAt)} />
          <InfoRow label="Updated" value={formatDate(designer.updatedAt)} />
          <InfoRow
            label="Total Files"
            value={Array.isArray(designer.files) ? designer.files.length : 0}
          />
          <InfoRow
            label="States"
            value={
              Array.isArray(designer.state) && designer.state.length > 0
                ? designer.state.join(", ")
                : "N/A"
            }
          />
        </div>
      </div>

      {/* Files Section */}
      {Array.isArray(designer.files) && designer.files.length > 0 && (
        <div className="mt-6 pt-5 border-t border-teal-200">
          <h4 className="font-semibold text-teal-700 mb-2 flex items-center gap-1">
            <FileText className="w-4 h-4" /> Files
          </h4>
          <ul className="text-gray-700 space-y-1">
            {designer.files.map((file) => (
              <li
                key={file.id}
                className="flex justify-between items-center bg-white px-3 py-2 rounded-md shadow-sm"
              >
                <span>{file.originalName}</span>
                <a
                  className="text-teal-600 text-sm flex items-center gap-1 hover:underline cursor-pointer"
                  onClick={() =>
                    openFileSecurely("connection-designer", id, file.id)
                  }
                >
                  <Link2 className="w-3 h-3" /> Open
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Buttons (future features like Edit, Disable) */}
      <div className="py-3 flex gap-3">
        <Button
          onClick={() => console.log("Edit", designer)}
          className="py-1 px-2 text-lg"
        >
          Edit
        </Button>
        <Button className="py-1 px-2 text-lg bg-red-200 text-red-700">
          Disable
        </Button>
      </div>
    </div>
  );
};

// ✅ Reusable Info Row
const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between">
    <span className="font-bold text-gray-600">{label}:</span>
    <span className="text-gray-900 text-right">{value}</span>
  </div>
);

export default GetConnectionDesignerByID;
