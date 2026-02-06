import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Service from "../../../api/Service";
import {
  Loader2,
  AlertCircle,
  FileText,
  Link2,
  MapPin,
  Calendar,
} from "lucide-react";
import Button from "../../fields/Button";
import { openFileSecurely } from "../../../utils/openFileSecurely";
import type { ConnectionDesigner } from "../../../interface";
import EditConnectionDesigner from "./EditConnectionDesigner";
import { AllCDEngineer } from "../..";

interface GetConnectionDesignerByIDProps {
  id: string;
}

const GetConnectionDesignerByID = ({ id }: GetConnectionDesignerByIDProps) => {
  const [designer, setDesigner] = useState<ConnectionDesigner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModel, setEditModel] = useState<ConnectionDesigner | null>(null);
  const [engineerModel, setEngineerModel] = useState<ConnectionDesigner | null>(
    null,
  );

  const fetchData = async () => {
    if (!id) {
      setError("Invalid Connection Designer ID");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Fetch only designer data as statistics were unused
      const designerRes = await Service.FetchConnectionDesignerByID(id);

      let designerData = designerRes?.data || null;
      if (designerData && typeof designerData.state === "string") {
        try {
          designerData.state = JSON.parse(designerData.state);
        } catch {
          designerData.state = [designerData.state];
        }
      }

      setDesigner(designerData);
    } catch (err) {
      console.error("Error fetching Designer data:", err);
      setError("Failed to load designer intelligence");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-IN", { dateStyle: "medium" });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
        <p className="text-sm font-medium animate-pulse">
          Synchronizing designer data...
        </p>
      </div>
    );

  if (error || !designer)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <AlertCircle className="w-10 h-10 mb-4" />
        <p className="font-semibold">
          {error || "Connection Designer not found"}
        </p>
      </div>
    );

  return (
    <div className="space-y-8 pb-10">
      {/* Header with Edit Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-green-100 shrink-0">
            {designer.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
              {designer.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-green-500" /> Since{" "}
                {formatDate(designer.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-green-500" />{" "}
                {designer.location || "Global"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setEditModel(designer)}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-100 transition-all active:scale-95"
          >
            Edit Profile
          </Button>
          <Button
            onClick={() => setEngineerModel(designer)}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
          >
            Manage Engineers
          </Button>
        </div>
      </div>

      {/* Files Section */}
      {Array.isArray(designer.files) && designer.files.length > 0 && (
        <div className="mt-6 pt-5 border-t border-green-200">
          <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
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
                  className="text-green-600 text-sm flex items-center gap-1 hover:underline cursor-pointer"
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

      {/* Buttons */}
      <div className="py-3 flex flex-wrap items-center gap-2 sm:gap-3">
        <Button
          onClick={() => setEditModel(designer)}
          className="py-1 px-3 text-sm sm:text-base font-semibold"
        >
          Edit
        </Button>
        <Button className="py-1 px-3 text-sm sm:text-base font-semibold bg-red-200 text-red-700 hover:bg-red-300">
          Archive
        </Button>
        <Button
          onClick={() => setEngineerModel(designer)}
          className="py-1 px-3 text-sm sm:text-base font-semibold"
        >
          Connection Designer Engineer
        </Button>
      </div>

      {editModel &&
        createPortal(
          <EditConnectionDesigner
            onClose={() => setEditModel(null)}
            designerData={designer}
            onSuccess={fetchData}
          />,
          document.body,
        )}
      {engineerModel &&
        createPortal(
          <AllCDEngineer
            onClose={() => setEngineerModel(null)}
            designerData={designer}
          />,
          document.body,
        )}
    </div>
  );
};

export default GetConnectionDesignerByID;
