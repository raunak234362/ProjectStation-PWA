/* eslint-disable @typescript-eslint/no-explicit-any */
import { X } from "lucide-react";
import Service from "../../api/Service";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ConnectionDesigner {
  id: string;
  name: string;
  state: string[];
  contactInfo: string;
  email: string;
  location: string;
  websiteLink: string;
}

const QuotationRaise = ({
  rfqId,
  onClose,
  onSuccess,
}: {
  rfqId: string;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const { handleSubmit, control } = useForm<any>();
  const [connectionDesigners, setConnectionDesigners] = useState<
    ConnectionDesigner[]
  >([]);
  const [filteredDesigners, setFilteredDesigners] = useState<
    ConnectionDesigner[]
  >([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  // Fetch all Connection Designers
  const fetchCD = async () => {
    try {
      const response = await Service.FetchAllConnectionDesigner();
      const data = response?.data || [];
      setConnectionDesigners(data);
      setFilteredDesigners(data);
    } catch (error) {
      console.error("Error fetching connection designers:", error);
      toast.error("Failed to load connection designers");
    }
  };

  useEffect(() => {
    fetchCD();
  }, []);

  // Extract unique states from all designers
  const allStates = Array.from(
    new Set(connectionDesigners.flatMap((cd) => cd.state))
  ).map((state) => ({ label: state, value: state }));

  // Filter designers when states are selected
  useEffect(() => {
    if (selectedStates.length === 0) {
      setFilteredDesigners(connectionDesigners);
    } else {
      const filtered = connectionDesigners.filter((cd) =>
        cd.state.some((state) => selectedStates.includes(state))
      );
      setFilteredDesigners(filtered);
    }
  }, [selectedStates, connectionDesigners]);

  // Submit — send only IDs
  const RaiseForQuotation = async (data: any) => {
    try {
      const payload = {
        ConnectionDesignerIds: data.ConnectionDesignerIds.map(
          (cd: any) => cd.value
        ),
      };

      console.log("📦 Final Payload:", payload);

      const response = await Service.UpdateRFQById(rfqId, payload);
      console.log("Quotation raised successfully:", response);

      toast.success("Quotation raised successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error raising quotation:", error);
      toast.error("Failed to raise quotation");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-gray-50 rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-700">
            Raise Connection Designer Quotation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(RaiseForQuotation)}
          className="p-6 space-y-6 overflow-y-auto"
        >
          {/* Multi-State Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by States
            </label>
            <Select
              options={allStates}
              isMulti
              placeholder="Search or select multiple states..."
              onChange={(selected: any) =>
                setSelectedStates(selected.map((s: any) => s.value))
              }
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#cbd5e1",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#0d9488" },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "rgba(13,148,136,0.1)",
                  borderRadius: "0.5rem",
                  padding: "0 4px",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: "#0f766e",
                  fontWeight: 500,
                }),
              }}
            />
          </div>

          {/* Connection Designer Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Connection Designers
            </label>
            <Controller
              name="ConnectionDesignerIds"
              control={control}
              rules={{
                required: "Please select at least one connection designer",
              }}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  isSearchable
                  placeholder="Search or select connection designers..."
                  options={filteredDesigners.map((cd) => ({
                    label: `${cd.name} (${cd.location})`,
                    value: cd.id,
                    states: cd.state,
                  }))}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#cbd5e1",
                      boxShadow: "none",
                      "&:hover": { borderColor: "#0d9488" },
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused
                        ? "rgba(13,148,136,0.1)"
                        : "white",
                      color: "black",
                    }),
                  }}
                  formatOptionLabel={(option: any) => (
                    <div>
                      <p className="font-medium text-gray-700">{option.label}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {option.states?.map((s: string) => (
                          <span
                            key={s}
                            className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                />
              )}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-all duration-200"
            >
              Raise for Quotation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuotationRaise;
