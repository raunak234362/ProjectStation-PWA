import Service from "../../api/Service";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";

interface ConnectionDesigner {
  id: string;
  name: string;
  state: string[] | string;
  contactInfo: string;
  email: string;
  location: string;
  websiteLink: string;
  CDEngineers?: { id: string; username: string;[key: string]: any }[];
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
  const { handleSubmit, control, watch } = useForm<any>();
  const selectedDesignerIds = watch("ConnectionDesignerIds");
  const [connectionDesigners, setConnectionDesigners] = useState<ConnectionDesigner[]>([]);
  const [filteredDesigners, setFilteredDesigners] = useState<ConnectionDesigner[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  const fetchCD = async () => {
    try {
      const response = await Service.FetchAllConnectionDesigner();
      const rawData = response?.data || [];
      const parsedData = rawData.map((cd: any) => {
        let parsedState: string[] = [];
        if (Array.isArray(cd.state)) {
          parsedState = cd.state;
        } else if (typeof cd.state === "string") {
          try {
            const parsed = JSON.parse(cd.state);
            parsedState = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            parsedState = [];
          }
        }
        return { ...cd, state: parsedState };
      });
      setConnectionDesigners(parsedData);
      setFilteredDesigners(parsedData);
    } catch (error) {
      toast.error("Failed to load connection designers");
    }
  };

  useEffect(() => {
    fetchCD();
  }, []);

  const allStates = Array.from(
    new Set(
      connectionDesigners.flatMap((cd) =>
        Array.isArray(cd.state) ? cd.state : []
      )
    )
  ).map((state) => ({ label: state, value: state }));

  useEffect(() => {
    if (selectedStates.length === 0) {
      setFilteredDesigners(connectionDesigners);
    } else {
      const filtered = connectionDesigners.filter((cd) =>
        Array.isArray(cd.state) && cd.state.some((state) => selectedStates.includes(state))
      );
      setFilteredDesigners(filtered);
    }
  }, [selectedStates, connectionDesigners]);

  const availableEngineers = filteredDesigners
    .filter((cd) => Array.isArray(selectedDesignerIds) && selectedDesignerIds.some((item: any) => item.value === cd.id))
    .flatMap((cd) => cd.CDEngineers || [])
    .map((eng) => ({
      label: eng.username,
      value: eng.id,
      designerName: connectionDesigners.find((cd) => cd.CDEngineers?.some(e => e.id === eng.id))?.name
    }));

  const RaiseForQuotation = async (data: any) => {
    try {
      const payload = {
        ConnectionDesignerIds: data.ConnectionDesignerIds?.map((cd: any) => cd.value) || [],
        connectionEngineerIds: data.EngineerIds?.map((eng: any) => eng.value) || [],
      };
      await Service.UpdateRFQById(rfqId, payload);
      toast.success("Quotation raised successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to raise quotation");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-2xl md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-black/10">
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-black/5 bg-white">
          <div className="flex flex-col">
            <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
              Raise Connection Designer Quotation
            </h2>
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.3em]">Designer Solicitation Protocol</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(RaiseForQuotation)} className="p-6 sm:p-10 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest">Geographical Constraints</label>
            <Select
              options={allStates}
              isMulti
              placeholder="Search vector states..."
              onChange={(selected: any) => setSelectedStates(selected.map((s: any) => s.value))}
              styles={{
                control: (base) => ({
                  ...base, borderColor: "rgba(0,0,0,0.1)", borderRadius: "0.75rem", padding: "4px", fontSize: "14px", boxShadow: "none", "&:hover": { borderColor: "#6bbd45" }
                }),
                multiValue: (base) => ({ ...base, backgroundColor: "rgba(107,189,69,0.1)", borderRadius: "0.5rem", padding: "0 4px" }),
                multiValueLabel: (base) => ({ ...base, color: "#2d5a1e", fontWeight: 800, fontSize: "10px", textTransform: "uppercase" }),
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest">Authorized Designer Entities</label>
            <Controller
              name="ConnectionDesignerIds"
              control={control}
              rules={{ required: "Please select at least one connection designer" }}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  placeholder="Identify entities..."
                  options={filteredDesigners.map((cd) => ({ label: `${cd.name} (${cd.location})`, value: cd.id, states: cd.state }))}
                  styles={{
                    control: (base) => ({ ...base, borderColor: "rgba(0,0,0,0.1)", borderRadius: "0.75rem", padding: "4px", fontSize: "14px", boxShadow: "none", "&:hover": { borderColor: "#6bbd45" } }),
                    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? "rgba(107,189,69,0.05)" : "white", color: "black", fontWeight: 700 }),
                  }}
                  formatOptionLabel={(option: any) => (
                    <div>
                      <p className="font-black text-black uppercase text-xs tracking-tight">{option.label}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(option.states) && option.states.map((s: string) => (
                          <span key={s} className="text-[9px] font-black bg-gray-100 text-black/60 px-2 py-0.5 rounded-full uppercase tracking-tighter">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                />
              )}
            />
          </div>

          {availableEngineers.length > 0 && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest">Specialist Targeting</label>
              <Controller
                name="EngineerIds"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    isMulti
                    placeholder="Specific index targeting..."
                    options={availableEngineers}
                    styles={{ control: (base) => ({ ...base, borderColor: "rgba(0,0,0,0.1)", borderRadius: "0.75rem", padding: "4px", fontSize: "14px", boxShadow: "none", "&:hover": { borderColor: "#6bbd45" } }) }}
                    formatOptionLabel={(option: any) => (
                      <div className="flex flex-col">
                        <span className="font-black text-black uppercase text-xs">{option.label}</span>
                        {option.designerName && <span className="text-[9px] text-black/40 uppercase font-bold tracking-widest italic">from {option.designerName}</span>}
                      </div>
                    )}
                  />
                )}
              />
            </div>
          )}

          <div className="flex justify-end pt-6 border-t border-black/5">
            <button type="submit" className="w-full sm:w-auto px-10 py-4 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-black/90 transition-all shadow-xl">
              Raise Solicitation Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuotationRaise;
