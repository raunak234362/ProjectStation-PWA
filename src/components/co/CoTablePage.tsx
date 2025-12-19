import { useParams } from "react-router-dom";
import CoTable from "./CoTable";

const CoTablePage = () => {
  const { coId } = useParams<{ coId: string }>();

  if (!coId) {
    return <div className="p-6 text-red-500">Invalid Change Order ID</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-teal-700 mb-4">
          Change Order Table
        </h1>

        <CoTable coId={coId} />
      </div>
    </div>
  );
};

export default CoTablePage;
