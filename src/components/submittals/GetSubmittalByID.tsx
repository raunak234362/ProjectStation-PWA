import React, { useEffect, useState } from "react";
import Service from "../../api/Service";
import { Loader2, AlertCircle } from "lucide-react";
import { openFileSecurely } from "../../utils/openFileSecurely";

const Info = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="mb-2">
    <h4 className="text-sm text-gray-500">{label}</h4>
    <div className="font-medium text-gray-800">{value}</div>
  </div>
);

const GetSubmittalByID = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState(true);
  const [submittal, setSubmittal] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);



const fetchData = async () => {
  try {
    setLoading(true);
    const response = await Service.GetSubmittalbyId(id);

    const raw = response?.data || null;

    const normalized = {
      ...raw,
      milestone: raw.mileStoneBelongsTo || null, 
      recipient: raw.recepients || null,        
      createdAt: raw.createdAt || raw.date,
    };

    setSubmittal(normalized);
  } catch {
    setError("Failed to load submittal.");
  } finally {
    setLoading(false);
  }
};

console.log(submittal);


  useEffect(() => {
    void fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center gap-2 text-gray-500 py-8">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading submittal details...
      </div>
    );

  if (!submittal || error)
    return (
      <div className="flex items-center gap-2 text-red-600 py-8">
        <AlertCircle className="w-5 h-5" /> {error || "Submittal not found"}
      </div>
    );

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-5">

        
      <h1 className="text-2xl font-bold text-teal-700">{submittal.subject}</h1>

      <Info label="Project" value={submittal.project?.name || "—"} />
      

<Info
  label="Milestone"
  value={
    submittal.mileStoneBelongsTo?.subject ||
    submittal.mileStoneBelongsTo?.description ||
    "—"
  }
/>
      <Info label="Submitted By" value={submittal.sender?.firstName || "—"} />
      <Info label="Created On" value={new Date(submittal.date).toLocaleString()} />

      <div>
        <h4 className="font-semibold text-gray-700">Description</h4>
        <p className="p-3 bg-gray-50 border rounded-lg">{submittal.description}</p>
      </div>
      <Info
  label="Sender"
  value={
    submittal.sender
      ? `${submittal.sender.firstName} ${submittal.sender.lastName}`
      : "—"
  }
/>

<Info
  label="Recipient"
  value={
    submittal.recepients
      ? `${submittal.recepients.firstName} ${submittal.recepients.lastName}`
      : "—"
  }
/>



      {submittal.files?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Attachments</h4>
          {submittal.files.map((file: any) => (
            <p
              key={file.id}
              className="text-teal-600 underline cursor-pointer"
              onClick={() => openFileSecurely("submittal", submittal.id, file.id)}
            >
              {file.originalName}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default GetSubmittalByID;
