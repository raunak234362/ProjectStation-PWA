import { useState } from "react";
import AllDocumentsByProjectID from "../designDrawings/AllDocumentsByProjectID";
import AddDesignDrawing from "../designDrawings/AddDesignDrawing";
import { useParams } from "react-router-dom";

const AllDocument = ({ projectId }: { projectId?: string }) => {
  const { id } = useParams<{ id: string }>();
  const finalId = projectId || id;
  const [view, setView] = useState<"list" | "add">("list");

  if (!finalId) return null;

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-xl font-black text-black uppercase tracking-tight">Project Explorer</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              view === "list"
                ? "bg-green-50 text-[#4a8a1a] border-2 border-green-200 shadow-sm"
                : "bg-white text-gray-400 border-2 border-gray-100 hover:border-gray-200 hover:text-gray-600"
            }`}
          >
            All Files
          </button>
          <button
            onClick={() => setView("add")}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              view === "add"
                ? "bg-green-50 text-[#4a8a1a] border-2 border-green-200 shadow-sm"
                : "bg-white text-gray-400 border-2 border-gray-100 hover:border-gray-200 hover:text-gray-600"
            }`}
          >
            + Add Drawing
          </button>
        </div>
      </div>

      {view === "list" ? (
        <AllDocumentsByProjectID projectId={finalId as string} />
      ) : (
        <AddDesignDrawing
          projectId={finalId as string}
          onSuccess={() => setView("list")}
        />
      )}
    </div>
  );
};

export default AllDocument;
