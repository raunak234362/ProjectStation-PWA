import React, { useState, useMemo } from "react";

interface InvoiceSummaryProps {
  invoices: any[];
  projects: any[];
  rfqs: any[];
  onInvoiceClick?: (invoiceId: string) => void;
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  invoices = [],
  projects = [],
  rfqs = [],
  onInvoiceClick,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const { jobSummaries, totalRaised, totalPaid, totalPending } = useMemo(() => {
    const jobMap: Record<string, any> = {};

    const filteredInvoices = invoices.filter((inv) => {
      let dateField = inv.invoiceDate || inv.createdAt;
      if (!dateField) return true;
      try {
        const date = new Date(dateField);
        if (selectedYear !== "all" && date.getFullYear().toString() !== selectedYear) return false;
        if (selectedMonth !== "all" && date.getMonth().toString() !== selectedMonth) return false;
      } catch (e) {
        return true;
      }
      return true;
    });

    filteredInvoices.forEach((inv) => {
      const job = inv.jobName || "Unknown Job";
      if (!jobMap[job]) {
        const project = projects.find(
          (p) => p.name === job || p.projectNumber === job,
        );
        let bidPrice = 0;
        let rfqSerial = "";

        // Attempt to find RFQ by project.rfqId, or by matching jobName to projectName/projectNumber
        let matchedRfq = null;
        if (project && project.rfqId) {
          matchedRfq = rfqs.find((r) => r.id === project.rfqId);
        }
        if (!matchedRfq) {
          matchedRfq = rfqs.find(
            (r) =>
              r.projectName?.toLowerCase() === job.toLowerCase() ||
              r.projectNumber === job ||
              (project && r.projectNumber === project.projectNumber),
          );
        }

        if (matchedRfq) {
          if (matchedRfq.bidPrice) {
            bidPrice =
              parseFloat(matchedRfq.bidPrice.toString().replace(/[^0-9.-]+/g, "")) || 0;
          }
          if (matchedRfq.serialNo) {
            rfqSerial = matchedRfq.serialNo;
          }
        }

        jobMap[job] = {
          jobName: job,
          projectIds: project ? `${project.projectNumber || ""}` : "",
          rfqSerial: rfqSerial,
          totalRaised: 0,
          paid: 0,
          pending: 0,
          bidPrice: bidPrice,
          invoices: [],
          invoiceNumbers: [],
        };
      }

      const amount = parseFloat(inv.totalInvoiceValue) || 0;
      jobMap[job].totalRaised += amount;
      if (inv.paymentStatus === true || inv.paymentStatus === "Paid") {
        jobMap[job].paid += amount;
      } else {
        jobMap[job].pending += amount;
      }
      jobMap[job].invoices.push(inv);
      if (inv.invoiceNumber && !jobMap[job].invoiceNumbers.includes(inv.invoiceNumber)) {
        jobMap[job].invoiceNumbers.push(inv.invoiceNumber);
      }
    });

    let tr = 0;
    let tp = 0;
    let tpen = 0;

    const jobArray = Object.values(jobMap).map((job: any) => {
      tr += job.totalRaised;
      tp += job.paid;
      tpen += job.pending;

      const formatStr = (s: string) => (s.startsWith("#") ? s : `#${s}`);
      const parts = [...job.invoiceNumbers.map(formatStr)];
      job.invoiceNumber = parts.join(", ") || "No Invoices";

      return job;
    });

    return {
      jobSummaries: jobArray,
      totalRaised: tr,
      totalPaid: tp,
      totalPending: tpen,
    };
  }, [invoices, projects, rfqs, selectedYear, selectedMonth]);

  const months = [
    { label: "Jan", value: "0" },
    { label: "Feb", value: "1" },
    { label: "Mar", value: "2" },
    { label: "Apr", value: "3" },
    { label: "May", value: "4" },
    { label: "Jun", value: "5" },
    { label: "Jul", value: "6" },
    { label: "Aug", value: "7" },
    { label: "Sep", value: "8" },
    { label: "Oct", value: "9" },
    { label: "Nov", value: "10" },
    { label: "Dec", value: "11" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-6 w-full mt-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-[13px] font-black text-gray-600 uppercase tracking-[0.15em] mb-4">
            INVOICE SUMMARY
          </h2>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Total Raised
              </span>
              <span className="text-xl md:text-2xl font-black text-gray-900 mt-1">
                ${totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="hidden md:block w-px h-10 bg-gray-200"></div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Total Paid
              </span>
              <span className="text-xl md:text-2xl font-black text-[#5da63c] mt-1">
                ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="hidden md:block w-px h-10 bg-gray-200"></div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Total Pending
              </span>
              <span className="text-xl md:text-2xl font-black text-red-500 mt-1">
                ${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="py-2 px-4 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6bbd45] font-bold text-gray-700 bg-white shadow-sm cursor-pointer hover:border-gray-300 transition-all"
          >
            <option value="all">All Years</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="py-2 px-4 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6bbd45] font-bold text-gray-700 bg-white shadow-sm cursor-pointer hover:border-gray-300 transition-all"
          >
            <option value="all">All Months</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs List */}
      <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        {jobSummaries.map((job) => {
          const blockTotal = Math.max(job.totalRaised, job.bidPrice || 0);
          const paidPercent = blockTotal > 0 ? (job.paid / blockTotal) * 100 : 0;
          const pendingPercent =
            blockTotal > 0 ? (job.pending / blockTotal) * 100 : 0;

          return (
            <div
              key={job.jobName}
              className="bg-gray-50/60 p-5 rounded-2xl border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow hover:bg-white"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h4 className="text-sm md:text-[15px] font-bold text-gray-800 uppercase tracking-tight leading-snug">
                    {job.jobName}
                  </h4>
                  <div className="text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-wide flex flex-wrap gap-1">
                    {job.invoices && job.invoices.length > 0 ? (
                      job.invoices.map((inv: any, i: number) => {
                        const invNum = inv.invoiceNumber 
                          ? (inv.invoiceNumber.startsWith("#") ? inv.invoiceNumber : `#${inv.invoiceNumber}`) 
                          : `#UNNAMED`;
                        return (
                          <span 
                            key={inv.id || i} 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onInvoiceClick) onInvoiceClick(inv.id);
                            }}
                            className="cursor-pointer hover:text-[#6bbd45] transition-colors"
                          >
                            {invNum}{i < job.invoices.length - 1 ? "," : ""}
                          </span>
                        );
                      })
                    ) : (
                      "No Invoices"
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end whitespace-nowrap">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    TOTAL RAISED / BID PRICE
                  </span>
                  <span className="text-sm md:text-[15px] font-black text-gray-900 mt-1">
                    ${job.totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / $
                    {(job.bidPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end mt-2">
                <span className="text-xs font-black text-[#5da63c] uppercase tracking-wide">
                  PAID: ${job.paid.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{" "}
                  <span className="text-gray-400 font-bold ml-1 text-[10px]">
                    ({job.invoices.length} INVOICES)
                  </span>
                </span>
                <span className="text-xs font-black text-red-500 uppercase tracking-wide">
                  PENDING: ${job.pending.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="w-full h-3 bg-gray-200/80 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="h-full bg-[#5da63c] transition-all duration-500 ease-out"
                  style={{ width: `${paidPercent}%` }}
                />
                <div
                  className="h-full bg-red-500 transition-all duration-500 ease-out"
                  style={{ width: `${pendingPercent}%` }}
                />
              </div>
            </div>
          );
        })}

        {jobSummaries.length === 0 && (
          <div className="text-center py-10 text-gray-400 font-medium italic text-sm">
            No invoice data found for the selected period.
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceSummary;
