import { useEffect, useState } from "react";
import DataTable, { type ExtendedColumnDef } from "../ui/table";
import type { RFQItem } from "../../interface";
import GetRFQByID from "./GetRFQByID";
import { formatDate } from "../../utils/dateUtils";
import { Search, X } from "lucide-react";
import { connectionDesignerService, rfqService } from "../../api/Service1";

const getRFQStatus = (row: any) => {
  const status = row.status?.toUpperCase()?.trim();
  const wbtStatus = row.wbtStatus?.toUpperCase()?.trim();
  const responses = row.responses || [];

  if (wbtStatus === "AWARDED" || status === "AWARDED") return "AWARDED";
  if (wbtStatus === "REVISE" || status === "REVISE") return "REVISE";
  if (wbtStatus === "REJECTED" || status === "REJECTED") return "REJECTED";
  if (wbtStatus === "CLOSED" || status === "CLOSED") return "CLOSED";
  if (responses.length > 0 || row.latestResponseDate) return "WBT_SUBMITTED";
  if (status === "IN_REVIEW") return "IN_REVIEW";

  return wbtStatus && wbtStatus !== "RECEIVED" ? wbtStatus : status;
};

const AllRFQ = ({ rfq }: { rfq?: RFQItem[] }) => {
  const userRole = sessionStorage.getItem("userRole");

  const [rfqList, setRfqList] = useState<RFQItem[]>(rfq || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"ALL" | "MTO" | "DETAILING" | "BOTH">("ALL");
  const [activeTab] = useState<"all" | "awarded">("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const statusOptions = [
    { label: "ALL STATUS", value: "ALL" },
    { label: "AWARDED", value: "AWARDED" },
    { label: "REJECTED", value: "REJECTED" },
    { label: "IN REVIEW / ESTIMATION IN PROGRESS", value: "IN_REVIEW" },
    { label: "RE-ESTIMATION REQUIRED", value: "RE_ESTIMATION_REQUESTED" },
    { label: "WBT SUBMITTED", value: "WBT_SUBMITTED" },
    { label: "CLARIFICATION REQUIRED", value: "CLARIFICATION_REQUIRED" },
    { label: "REVISE", value: "REVISE" },
  ];

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      let response;
      const searchParam = searchQuery.trim() || undefined;
      const statusParam = selectedStatus !== "ALL" ? selectedStatus : undefined;

      if (userRole === "CLIENT") {
        response = await rfqService.RfqSent(currentPage, 25, searchParam, statusParam);
      } else if (
        userRole === "OPERATION_EXECUTIVE" ||
        userRole === "DEPUTY_MANAGER" ||
        userRole === "ESTIMATION_HEAD" ||
        userRole === "ADMIN"
      ) {
        response = await rfqService.FetchAllRFQ(currentPage, 25, searchParam, statusParam);
      } else if (
        userRole === "CLIENT_ESTIMATOR" ||
        userRole === "CLIENT_ADMIN" ||
        userRole === "CONNECTION_DESIGNER_ENGINEER" ||
        userRole === "CONNECTION_DESIGNER_ADMIN"
      ) {
        if (userRole === "CLIENT_ESTIMATOR") {
          response = await rfqService.GetClientEstimatorRFQ();
        } else if (userRole === "CLIENT_ADMIN") {
          response = await rfqService.getAllRFQFab();
        } else {
          response = await connectionDesignerService.getConnectionEngineerQuotation();
        }
      } else {
        response = await rfqService.RFQRecieved(currentPage, 25, searchParam, statusParam);
      }

      if (response) {
        let list: RFQItem[] = [];
        let totalP = 1;

        if (Array.isArray(response)) {
          list = response;
          totalP = list.length === 25 ? currentPage + 1 : currentPage;
        } else {
          const resData = response.data || response;
          const pagination = response.meta || response.pagination || resData?.meta || resData?.pagination;

          if (Array.isArray(resData)) {
            list = resData;
          } else if (resData && Array.isArray(resData.data)) {
            list = resData.data;
          }

          if (pagination) {
            totalP = pagination.totalPages || pagination.totalPage || totalP;
          } else {
            totalP = list.length === 25 ? currentPage + 1 : currentPage;
          }
        }

        setRfqList(list);
        setTotalPages(totalP);
      }
    } catch (error) {
      console.error("Error fetching RFQs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, [currentPage]);

  // Sync with prop updates if any
  useEffect(() => {
    if (rfq && rfq.length > 0) {
      setRfqList(rfq);
    }
  }, [rfq]);

  // Reset page when search or filter options change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchRFQs();
    }
  }, [searchQuery, selectedType, selectedMonth, selectedStatus]);

  const monthOptions = [
    { label: "January", value: "0" },
    { label: "February", value: "1" },
    { label: "March", value: "2" },
    { label: "April", value: "3" },
    { label: "May", value: "4" },
    { label: "June", value: "5" },
    { label: "July", value: "6" },
    { label: "August", value: "7" },
    { label: "September", value: "8" },
    { label: "October", value: "9" },
    { label: "November", value: "10" },
    { label: "December", value: "11" },
  ];

  const isTrue = (val: any) => val === true || val === "true";

  // Premium styled columns
  const columns: ExtendedColumnDef<RFQItem>[] = [
    {
      accessorKey: "projectName",
      header: "Project Name",
      enableColumnFilter: true,
      filterType: "text",
      filterFn: "includesString",
    },
  ];

  if (userRole !== "CLIENT" && userRole !== "CLIENT_ADMIN") {
    columns.push({
      accessorKey: "fabricator",
      header: "Fabricator",
      cell: ({ row }) => (row.original as any).fabricator?.fabName || "—",
    });
  }

  columns.push(
    {
      accessorKey: "sender",
      header: "Requested By",
      cell: ({ row }) => {
        const sender = row.original.sender;
        const s = sender as any;
        return sender
          ? `${s.firstName ?? ""} ${s.middleName ?? ""} ${s.lastName ?? ""}`
          : "—";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableColumnFilter: true,
      filterType: "select",
      filterFn: "equals",
      filterOptions: [
        { label: "In Review", value: "IN_REVIEW" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Pending", value: "PENDING" },
      ],
      cell: ({ row }) => (
        <span
          className="px-3 py-1 text-xs md:text-sm lg:text-base xl:text-lg uppercase tracking-widest rounded-lg bg-gray-100 text-black border border-gray-200"
        >
          {row.original.status?.replace("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "estimationDate",
      header: "Due Date",
      cell: ({ row }) => formatDate(row.original.estimationDate),
    },
  );

  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <DataTable
        columns={columns}
        data={rfq || []}
        onRowClick={(row: any) => setSelectedRfqId(row.id)}
        pageSizeOptions={[25]}
      />
      {selectedRfqId && (
        <GetRFQByID id={selectedRfqId} onClose={() => setSelectedRfqId(null)} />
      )}
    </div>
  );
};

export default AllRFQ;
