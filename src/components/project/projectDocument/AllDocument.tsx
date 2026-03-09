import { useState } from "react";
import AllDesignDrawings from "../designDrawings/AllDesignDrawings";
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
        <h2 className="text-xl  text-black">Design Drawings</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              view === "list"
                ? "border border-black bg-green-50 text-black"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Drawings
          </button>
          <button
            onClick={() => setView("add")}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              view === "add"
                ? "border border-black bg-green-50 text-black"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Add Drawing
          </button>
        </div>
      </div>

      {view === "list" ? (
        <AllDesignDrawings projectId={finalId as string} />
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
