import { useEffect, useState } from "react";
import Service from "../../../api/Service";
import { Check, Loader2, Search, X } from "lucide-react";
import Button from "../../fields/Button";

interface WBSTemplate {
  id: string;
  name: string;
  type: string;
  templateKey: string;
  lineItems: any[];
}

interface FetchWBSTemplateProps {
  onSelect?: (selectedIds: string) => void;
  onClose?: () => void;
  id?: string;
}

const FetchWBSTemplate = ({ id, onSelect, onClose }: FetchWBSTemplateProps) => {
  const [templates, setTemplates] = useState<WBSTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchWbsTemplate = async () => {
      try {
        setLoading(true);
        const response = await Service.GetWBSTemplate();
        // Assuming response.data contains the array based on user's provided JSON structure
        setTemplates(response.data || []);
      } catch (error) {
        console.error("Error fetching WBS templates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWbsTemplate();
  }, []);

  const toggleSelection = (id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredTemplates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTemplates.map((t) => t.id)));
    }
  };

  const handleSubmit = async () => {
    if (!id) {
      console.error("Project ID is missing");
      return;
    }
    const wbsTemplateIds = Array.from(selectedIds);
    if (onSelect) {
      onSelect(wbsTemplateIds.join(","));
    }
    const response = await Service.AddWBSFromTemplate(id, { wbsTemplateIds });
    console.log("Selected IDs:", wbsTemplateIds);
    console.log("Response:", response);
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">
          Fetching WBS Templates...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden w-full mx-auto animate-in fade-in zoom-in duration-300">
      <div className="p-2 space-y-6">
        {/* Search and Select All */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={handleSelectAll}
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors px-4 py-2 rounded-lg hover:bg-teal-50"
          >
            {selectedIds.size === filteredTemplates.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        {/* Template List */}
        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => toggleSelection(template.id)}
                className={`group relative flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedIds.has(template.id)
                    ? "border-teal-500 bg-teal-50/50 shadow-sm"
                    : "border-gray-100 hover:border-teal-200 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    selectedIds.has(template.id)
                      ? "bg-teal-500 border-teal-500"
                      : "border-gray-300 group-hover:border-teal-400"
                  }`}
                >
                  {selectedIds.has(template.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>

                <div className="ml-4 grow">
                  <h3
                    className={`font-bold transition-colors ${
                      selectedIds.has(template.id)
                        ? "text-teal-900"
                        : "text-gray-800"
                    }`}
                  >
                    {template.name}
                  </h3>
                  {/* Tooltip for Line Items */}
                  <div className="invisible group-hover:visible absolute left-full ml-4 top-0 z-50 w-64 p-4 bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none">
                    <h4 className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">
                      Line Items
                    </h4>
                    <ul className="space-y-1">
                      {template.lineItems?.map((item, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-600 border-l-2 border-teal-200 pl-2"
                        >
                          {item.name || item.title || "Unnamed Item"}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center mt-1 space-x-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 uppercase tracking-wider">
                      {template.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {template.lineItems?.length || 0} Line Items
                    </span>
                  </div>
                </div>

                {selectedIds.has(template.id) && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 italic">
                No templates found matching your search.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex items-center justify-between border-t border-gray-100">
          <p className="text-sm text-gray-500">
            <span className="font-bold text-teal-600">{selectedIds.size}</span>{" "}
            templates selected
          </p>
          <div className="flex space-x-3">
            {onClose && (
              <Button
                onClick={onClose}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none shadow-none"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={selectedIds.size === 0}
              className={`px-8 py-2.5 rounded-xl font-bold transition-all ${
                selectedIds.size > 0
                  ? "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Add Selected Templates
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default FetchWBSTemplate;
