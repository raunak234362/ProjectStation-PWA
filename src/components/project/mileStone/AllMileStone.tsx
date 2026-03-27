/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { Inbox } from "lucide-react";
import Service from "../../../api/Service";
import DataTable from "../../ui/table";
import GetMilestoneByID from "./GetMilestoneByID";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "../../../utils/dateUtils";
import { useDispatch, useSelector } from "react-redux";
import { setMilestonesForProject } from "../../../store/milestoneSlice";

interface AllMileStoneProps {
  project: any;
  onUpdate: () => Promise<void>;
}

const AllMileStone = ({ project, onUpdate }: AllMileStoneProps) => {
  const dispatch = useDispatch();
  const milestonesByProject = useSelector(
    (state: any) => state.milestoneInfo?.milestonesByProject || {},
  );
  const milestones = milestonesByProject[project.id] || [];

  const fetchMileStone = async () => {
    try {
      const response = await Service.GetProjectMilestoneById(project.id);
      if (response && response.data) {
        dispatch(
          setMilestonesForProject({
            projectId: project.id,
            milestones: response.data,
          }),
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!milestonesByProject[project.id]) {
      fetchMileStone();
    }
  }, [project.id, milestonesByProject, dispatch]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <span className="font-bold text-black">{row.original.subject}</span>
      ),
    },
    {
      accessorKey: "approvalDate",
      header: "Approval Date",
      cell: ({ row }) => (
        <span className="text-black/60 text-xs font-bold">
          {formatDate(row.original.approvalDate)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className="px-2 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-md bg-gray-50 text-black border border-black/5">
          {row.original.status || "—"}
        </span>
      ),
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: ({ row }) => (
        <span className="px-2 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-md bg-gray-50 text-black border border-black/5">
          {row.original.stage || "—"}
        </span>
      ),
    },
  ];

  const handleRowClick = (row: any) => {
    const milestonesId = (row as any).id ?? (row as any).fabId ?? "";
    console.debug("Selected milestones:", milestonesId);
  };

  const MilestoneDetailWrapper = (props: { row: any; close: () => void }) => (
    <GetMilestoneByID {...props} onUpdate={onUpdate} />
  );

  return (
    <div className="flex-1 min-h-0">
      {milestones && milestones.length > 0 ? (
        <DataTable
          columns={columns}
          data={milestones}
          onRowClick={handleRowClick}
          detailComponent={MilestoneDetailWrapper}
          pageSizeOptions={[5, 10, 25]}
          noBorder
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4 py-40 bg-white rounded-3xl border border-dashed border-gray-100 italic text-gray-400">
          <div className="p-4 bg-gray-50 rounded-full">
            <Inbox className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-black font-black text-lg not-italic">No Milestones Available</p>
          <p className="text-sm">No milestones have been added for this project yet.</p>
        </div>
      )}
    </div>
  );
};

export default AllMileStone;
