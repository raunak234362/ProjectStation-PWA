import React, { useEffect, useState } from "react";
import Service from "../../api/Service";
import { Loader2, AlertCircle } from "lucide-react";
import { openFileSecurely } from "../../utils/openFileSecurely";
import Button from "../fields/Button";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import SubmittalResponseModal from "./SubmittalResponseModal";

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
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);

  const submittalResponseTableData = submittal?.submittalsResponse
  console.log(submittalResponseTableData);
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await Service.GetSubmittalbyId(id);
      console.log(response);

      const raw = response?.data || null;

      setSubmittal(raw);
    } catch {
      setError("Failed to load submittal.");
    } finally {
      setLoading(false);
    }
  };
  console.log(submittal);

  useEffect(() => {
    fetchData();
  }, [id]);

  console.log(id);


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
  
  const userRole = sessionStorage.getItem("userRole");

  const responseColumns: ColumnDef<any>[] = [
    
     { accessorKey: "description", header: "Project Name" },
    {
      accessorKey: "description",
      header: "Message",
      cell: ({ row }) => (
        <div style={{ marginLeft: row.original.parentResponseId ? "20px" : "0px" }}>
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "files",
      header: "Files",
      cell: ({ row }) => {
        const count = row.original.files?.length ?? 0;
        return count > 0 ? `${count} file(s)` : "—";
      },
    },
    {
      accessorKey: "description",
      header: "description",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
  ];


  return (
    <>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


          <div className="bg-white p-6 rounded-xl shadow-md space-y-5">
            <div className="flex justify-between items-center">

              <h1 className="text-2xl font-bold text-teal-700">{submittal.subject}</h1>
            </div>
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


          {/* RIGHT PANEL — RESPONSES */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-6">

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-teal-700">Responses</h2>

              <Button
                onClick={() => setShowResponseModal(true)}
                className="bg-teal-600 text-white"
              >
                + Add Response
              </Button>
            </div>

            {submittalResponseTableData.length > 0 ? (
              <DataTable
                columns={responseColumns}
                data={submittalResponseTableData}
                onRowClick={(row) => setSelectedResponse(row)}
                detailComponent={({ row }) => (
                  <SubmittalResponseModal
                    submittalId={row.id}
                    parentResponseId={row.id}
                    onClose={() => setSelectedResponse(null)}
                    onSuccess={() => {
                      fetchData();
                      setSelectedResponse(null);
                    }}
                  />
                )}
                pageSizeOptions={[5, 10]}
              />
            ) : (
              <p className="text-gray-500 italic">No responses yet.</p>
            )}
          </div>


        </div>
      </div>

    

    </>
  );

};

export default GetSubmittalByID;
