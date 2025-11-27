import { X, Paperclip, CalendarDays } from "lucide-react";

interface ResponseDetailsModalProps {
  response: any;
  onClose: () => void;
}

const ResponseDetailsModal = ({ response, onClose }: ResponseDetailsModalProps) => {
console.log(response);

    return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-xl space-y-4 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-semibold text-teal-700">
          Response Details
        </h2>

        {/* Message */}
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Message</p>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-md border">
            {response.description}
          </p>
        </div>

        {/* Attachments */}
        {response.files?.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Attachments</p>
            <ul className="space-y-2">
              {response.files.map((file: any) => (
                <li key={file.id} className="flex items-center gap-2">
                  <Paperclip size={16} className="text-teal-600" />
                  <span className="text-sm text-teal-700 underline cursor-pointer">
                    {file.originalName}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Created At */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarDays size={16} />
          {new Date(response.createdAt).toLocaleString()}
        </div>

        {/* Future actions */}
        <div className="flex justify-end gap-3 pt-3">
          <button className="px-4 py-2 rounded-lg bg-red-100 text-red-600 font-medium hover:bg-red-200 transition">
            Delete
          </button>
          <button className="px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResponseDetailsModal;
