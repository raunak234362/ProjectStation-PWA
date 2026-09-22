/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Service from "../../../api/Service";
import { Loader2, AlertCircle } from "lucide-react";
import RenderFiles from "../../ui/RenderFiles";

interface DesignDrawingDetailsProps {
  id: string;
  onUpdate: () => void;
}

const DesignDrawingDetails = ({ id }: DesignDrawingDetailsProps) => {
  const [drawing, setDrawing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrawing = async () => {
    try {
      setLoading(true);
      const response = await Service.GetDesignDrawingById(id);
      setDrawing(response.data);
    } catch (err) {
      setError("Failed to load design drawing details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDrawing();
  }, [id]);

  if (loading) return <Loader2 className="w-5 h-5 animate-spin mx-auto" />;
  if (error || !drawing)
    return (
      <div className="text-red-500 flex items-center">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </div>
    );

  return (
    <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-green-700">
            Stage: {drawing.stage}
          </h4>
          <p className="text-sm text-gray-600">{drawing.description}</p>
        </div>
      </div>

      {drawing.files && drawing.files.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Attachments ({drawing.files.length})
          </p>
          <RenderFiles
            files={drawing.files}
            table="designDrawings"
            parentId={id}
            hideHeader
          />
        </div>
      )}

    </div>
  );
};

export default DesignDrawingDetails;
