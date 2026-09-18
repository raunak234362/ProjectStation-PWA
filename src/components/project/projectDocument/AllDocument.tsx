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
      {view === "add" && (
        <div className="flex justify-end items-center mb-4 -mt-4">
          <button
            onClick={() => setView("list")}
            className="px-4 py-1.5 border-2 border-[#6bbd45] bg-green-50 text-black rounded text-sm font-bold uppercase hover:bg-[#6bbd45] hover:text-white transition-colors"
          >
            Back to Files
          </button>
        </div>
      )}

      {view === "list" ? (
        <AllDocumentsByProjectID projectId={finalId as string} onAddClick={() => setView("add")} />
      ) : (
        <AddDesignDrawing
          projectId={finalId as string}
          onClose={() => {}}
          onSuccess={() => setView("list")}
        />
      )}
    </div>
  );
};

export default AllDocument;
