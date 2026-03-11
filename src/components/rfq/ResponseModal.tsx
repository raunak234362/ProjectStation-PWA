import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import Service from "../../api/Service";
import { Printer } from "lucide-react";
import type { RfqResponsePayload } from "../../interface";
import mainLogo from "../../assets/mainLogo.png";
import Logo from "../../assets/Logo.svg";
import ASCI from "../../assets/asci.webp";
import Button from "../fields/Button";
import RichTextEditor from "../fields/RichTextEditor";
import Select from "../fields/Select";
import { formatDate } from "../../utils/dateUtils";

interface ResponseModalProps {
  rfqId: string;
  onClose: () => void;
  onSuccess: () => void; // callback to refresh RFQ after submission
}

const ResponseModal: React.FC<ResponseModalProps> = ({
  rfqId,
  onClose,
  onSuccess,
}) => {
  const { register, handleSubmit, control, reset, setValue, getValues } =
    useForm<RfqResponsePayload>();

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [estimations, setEstimations] = useState<any[]>([]);
  const [selectedEstimationId, setSelectedEstimationId] = useState<string>("");
  const [selectedEstimation, setSelectedEstimation] = useState<any>(null);
  const [pricingItems, setPricingItems] = useState([
    { label: "Main Steel Detailing", price: "", weeks: "", selected: false },
    { label: "Misc Steel Detailing", price: "", weeks: "", selected: false },
    {
      label: "Main & Misc Steel Detailing",
      price: "",
      weeks: "",
      selected: false,
    },
    { label: "Main Steel Design", price: "", weeks: "", selected: false },
    { label: "Misc Steel Design", price: "", weeks: "", selected: false },
  ]);

  useEffect(() => {
    const fetchEstimations = async () => {
      try {
        const res = await Service.AllEstimation();
        const allEst = Array.isArray(res?.data)
          ? res.data
          : res?.data?.data || [];
        // Filter estimations by rfqId
        const filtered = allEst.filter(
          (est: any) => String(est.rfqId) === String(rfqId),
        );
        setEstimations(filtered);
      } catch (error) {
        console.error("Error fetching estimations:", error);
      }
    };
    fetchEstimations();
  }, [rfqId]);

  const generateProposalHtml = (est: any, items: typeof pricingItems) => {
    if (!est) return "";

    const currency = est.fabricators?.currencyType || "USD";
    const currencySymbol = currency === "INR" ? "₹" : "$";

    const headerHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 5mm 10mm; margin-bottom: 15px; margin-top:15px; width: 100%; box-sizing: border-box;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${mainLogo}" alt="Whiteboard Technologies" style="height: 60px; width: auto;" />
        </div>
        <div style="display: flex; align-items: center; gap: 5px;">
           <div style="display: flex; align-items: center; gap: 5px;">
              <img src="${Logo}" alt="Whiteboard Technologies" style="height: 60px; width: auto;" />
           </div>
           <div style="text-align: center;">
               <img src="${ASCI}" alt="Whiteboard Technologies" style="height: 70px; width: auto;" />
           </div>
        </div>
      </div>
    `;

    // Helper to safely parse JSON arrays
    const parseArray = (data: any) => {
      if (Array.isArray(data)) return data;
      if (typeof data === "string") {
        try {
          const parsed = JSON.parse(data);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const inclusions = parseArray(est.inclusions);
    const exclusions = parseArray(est.exclusions);

    const inclusionsHtml =
      inclusions.length > 0
        ? inclusions
            .map((item: string) => `<li><span>${item}</span></li>`)
            .join("")
        : `<li><span>No inclusions specified</span></li>`;

    const exclusionsHtml =
      exclusions.length > 0
        ? exclusions
            .map((item: string) => `<li><span>${item}</span></li>`)
            .join("")
        : `<li><span>No exclusions specified</span></li>`;

    const selectedItems = items.filter((item) => item.selected);
    const tableRows = selectedItems
      .map(
        (item) => `
      <tr style="text-align: center;">
        <td style="border: 2px solid #333; padding: 5px; font-weight: bold; color: #333;">${item.label.toUpperCase()}</td>
        <td style="border: 2px solid #333; padding: 5px; font-weight: bold; color: #0056b3;"><span>${currency}: ${currencySymbol} ${
          item.price || "—"
        }/-</span></td>
        <td style="border: 2px solid #333; padding: 15px; font-weight: bold;"><span>${
          item.weeks || "—"
        } weeks</span></td>
      </tr>
    `,
      )
      .join("");

    return `
      <div style="background: #f0f0f0; padding: 10px 0; display: flex; flex-direction: column; align-items: center; gap: 40px;">
        <!-- Page 1 -->
        <div style="width: 210mm; height: 297mm; background: white; box-shadow: 0 0 15px rgba(0,0,0,0.1); font-family: 'Arial', sans-serif; color: #333; line-height: 1.5; box-sizing: border-box; overflow: hidden; position: relative;">
          ${headerHtml}
          <div style="padding: 0 25mm 25mm 25mm;">
            <div style="border-left: 6px solid #6bbd45; padding-left: 20px; margin-bottom: 35px;">
              <h1 style="font-size: 24px; margin: 0; color: #6bbd45; text-transform: uppercase; font-weight: 900; line-height: 1.2;">
                WHITEBOARD TECHNOLOGIES <span style="color: #6bbd45; font-weight: 900;">PROPOSAL FOR</span>
              </h1>
              <h1 style="font-size: 16px; margin: 5px 0 0 0; color: #6bbd45; text-transform: uppercase; font-weight: 900; line-height: 1.2;">
                DETAILING <span>${est.projectName || "Project Name"}</span> JOB
              </h1>
              <div style="margin-top: 5px;">
                <span style="font-weight: bold; font-size: 12px; color: #0056b3;">For ${
                  est.fabricators?.fabName || "Fabricator Name"
                }</span>
              </div>
              ${
                est.fabricators?.branches?.[0]
                  ? `
                <div style="display: block; font-size: 11px; margin-top: 8px; color: #555;">
                  ${est.fabricators.branches[0].address || ""}, ${
                    est.fabricators.branches[0].city || ""
                  }, ${est.fabricators.branches[0].state || ""} ${
                    est.fabricators.branches[0].zipCode || ""
                  }, Tel: ${est.fabricators.branches[0].phone || ""}
                </div>
              `
                  : ""
              }
            </div>

            <!-- Proposal ID & Date -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 12px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              <div><span>Our Proposal ID: <span>WBT/${
                est.estimationNumber || "Estimation Number"
              }/${new Date().getFullYear()}/VER 1.0</span></span></div>
              <div><span>Date: <span>${formatDate(new Date())}</span></span></div>
            </div>

            <p style="font-size: 12px; margin-bottom: 25px; color: #444;">
              WHITEBOARD TECHNOLOGIES is pleased to submit this proposal for taking some of the detailing activities of 
              <span style="font-weight: bold; color: #333;">${
                est.projectName || "SAMPLE PROJECT"
              }</span> JOB.
            </p>

            <!-- Pricing Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 12px; border: 2px solid #333;">
              <thead>
                <tr style="text-align: center; font-weight: bold;">
                  <th style="border: 2px solid #333; padding: 5px; width: 40%;">Item</th>
                  <th style="border: 2px solid #333; padding: 5px; width: 30%;">Price</th>
                  <th style="border: 2px solid #333; padding: 5px; width: 30%;">Approximate Job Duration</th>
                </tr>
              </thead>
              <tbody>
                ${
                  tableRows ||
                  `<tr><td colspan="3" style="border: 2px solid #333; padding: 10px; text-align: center;">No items selected</td></tr>`
                }
              </tbody>
            </table>

            <!-- Scope of Work -->
            <div style="margin-bottom: 35px;">
              <h3 style="color: #6bbd45; font-size: 16px; margin-bottom: 10px; display: inline-block; padding-bottom: 2px;">Scope of work</h3>
              
              <div style="margin-top: 10px;margin-bottom: 10px;">
                <h4 style="color: #6bbd45; text-decoration: underline; margin-bottom: 12px; font-size: 14px;">Inclusions:</h4>
                <ul style="list-style-type: disc; margin: 0; padding-left: 25px; font-size: 12px; line-height: 1.5; color: #444;">
                  ${inclusionsHtml}
                </ul>
              </div>
              <div style="margin-bottom: 35px;">
              <h4 style="color: #6bbd45; text-decoration: underline; margin-bottom: 12px; font-size: 14px;">Exclusions:</h4>
              <ul style="list-style-type: disc; margin: 0; padding-left: 25px; font-size: 12px; line-height: 1.5; color: #444;">
                ${exclusionsHtml}
              </ul>
            </div>

            </div>
          </div>
        </div>

        <!-- Page 2 -->
        <div style="width: 210mm; height: 297mm; background: white; box-shadow: 0 0 15px rgba(0,0,0,0.1); font-family: 'Arial', sans-serif; color: #333; line-height: 1.5; box-sizing: border-box; overflow: hidden; page-break-before: always; position: relative;">
          ${headerHtml}
          <div style="padding: 0 25mm 25mm 25mm;">
            
            <!-- Standard Deliverables -->
            <div style="margin-bottom: 20px;">
              <h3 style="color: #6bbd45; font-size: 14px; margin-bottom: 10px; border-bottom: 2px solid #6bbd45; display: inline-block; padding-bottom: 2px;">Our Standard Deliverables</h3>
              <ul style="list-style-type: disc; margin: 5px 0 0 0; padding-left: 25px; font-size: 12px; line-height: 1.6; color: #444;">
                <li>Erection drawings</li>
                <li>Shop drawings.</li>
                <li>Embed plan</li>
                <li>ABMs for columns, beam</li>
                <li>DSTV, KSS files</li>
                <li>Bolt lists</li>
                <li>ISO View of the job model</li>
              </ul>
            </div>

            <!-- Delivery Mode -->
            <div style="margin-bottom: 20px;">
              <h3 style="color: #6bbd45; font-size: 14px; margin-bottom: 5px; border-bottom: 2px solid #6bbd45; display: inline-block; padding-bottom: 2px;">Delivery mode:</h3>
              <p style="font-size: 12px; margin-top: 5px; color: #444;">Electronic format of all deliverables through FTP</p>
            </div>

            <!-- Terms and Conditions -->
            <div style="margin-bottom: 20px;">
              <h3 style="color: #6bbd45; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; border-bottom: 2px solid #6bbd45; display: inline-block; padding-bottom: 2px;">Our Proposal terms and conditions</h3>
              <ul style="list-style-type: decimal; margin: 0; padding-left: 25px; font-size: 12px; line-height: 1.4; color: #444;">
                <li style="margin-bottom: 8px;">ORIGINAL SUBCONTRACT BID DOCUMENTS: The full and complete extent of the original subcontract bid documents is given at the time of bidding.</li>
                <li style="margin-bottom: 8px;">ORIGINAL SUBCONTRACT SCOPE: The full and complete extent of the original subcontract work scope is given above in this proposal.</li>
                <li style="margin-bottom: 8px;"><span style="font-weight: bold; color: #333;">EXTRA WORK RATE: USD 50 / hour.</span></li>
                <li style="margin-bottom: 8px;">CANCELLATION OR DELAY: If the project is canceled or delayed, the steel detailing firm will be paid for all material and labor expenditures plus a reasonable profit on all work that has been authorized by the Buyer and is complete as of the stoppage.</li>
                <li style="margin-bottom: 8px;">TERMS OF PAYMENT: Payment to the steel detailing firm is the express obligation of the Buyer and is not dependent upon "the condition precedent" of the Buyer receiving funds from other sources. The detailer is to be paid per the following:
                  <ul style="list-style-type: lower-alpha; padding-left: 20px; margin-top: 5px;">
                    <li>Invoices will be submitted when the drawings are submitted for approval. Payment is to be made, within 30 days after the Buyer's receipt of such invoice. Final payment shall be due within 30 days after substantial completion of the work by the detailing firm, less the value of any uncompleted work. An amount past due by these terms and conditions will be subject to a 14% per month service charge.</li>
                  </ul>
                </li>
                <li style="margin-bottom: 8px;">EXTRA WORK: Extra Work is to be considered which is defined in the NISD Industry Standard, Chapter 3. Charges for Extra Work shall be paid in the same manner and time frame as the original agreement.</li>
                <li style="margin-bottom: 8px;">BACKCHARGES: In the event of detailing errors and omissions, confirmed by the detailing firm, the detailing firm agrees to pay charges limited to 6% of the steel detailing price on this job. The buyer agrees to hold the detailing firm and its officers harmless of any litigation, the cost of direct labor, taxes, insurance and material costs and transportation needed to correct the deficiency. The detailing firm liability for damage to the buyer for any cause whatsoever and regardless of the form of action shall not exceed 6% of the amount paid by the buyer.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Page 3 -->
        <div style="width: 210mm; min-height: 297mm; background: white; box-shadow: 0 0 15px rgba(0,0,0,0.1); font-family: 'Arial', sans-serif; color: #333; line-height: 1.5; box-sizing: border-box; overflow: hidden; page-break-before: always; position: relative;">
          ${headerHtml}
          <div style="padding: 0 25mm 25mm 25mm;">
            <!-- Billing Cycle -->
            <div style="margin-bottom: 35px;">
              <div style="background: #f5f5f5; padding: 10px 15px; border-left: 5px solid #6bbd45; margin-bottom: 20px;">
                <h3 style="font-size: 16px; font-weight: bold; margin: 0; color: #333;">BILLING CYCLE: Job progress billing.</h3>
              </div>
              <table style="width: 90%; border-collapse: collapse; font-size: 14px; margin-left: 25px;">
                <tr>
                  <td style="border: 1.5px solid #333; padding: 12px; width: 65%; color: #444;">Submission of Shop drawings for approval</td>
                  <td style="border: 1.5px solid #333; padding: 12px; text-align: center; font-weight: bold; color: #333;">80% of total amount</td>
                </tr>
                <tr>
                  <td style="border: 1.5px solid #333; padding: 12px; color: #444;">Submission of Shop drawings for fabrication</td>
                  <td style="border: 1.5px solid #333; padding: 12px; text-align: center; font-weight: bold; color: #333;">20% of total amount</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; font-weight: bold; margin-bottom: 30px; color: #333; border-top: 1px solid #eee; padding-top: 20px;">
              All Purchase Orders and Payments should be made to Whiteboard Technologies LLC, 1209 Orange Street, Wilmington, DE, 19801.
            </p>

            <!-- Schedule & Delivery -->
            <div style="margin-bottom: 35px;">
              <ul style="list-style-type: disc; padding-left: 25px; font-size: 14px; line-height: 1.6; color: #444;">
                <li style="margin-bottom: 15px;"><span style="font-weight: bold; color: #333;">SCHEDULE & DELIVERY:</span> Upon receipt of signed Purchase Order Whiteboard Technologies LLC will perform detailing activities and deliver drawings as per the schedule above. The delivery schedule can be adjusted to suit customer needs.
                  <ul style="list-style-type: disc; padding-left: 20px; margin-top: 10px;">
                    <li>The delivery schedule is contingent on:</li>
                    <li style="list-style-type: circle; margin-top: 5px;">Complete and correct design documents, drawings and specifications</li>
                    <li style="list-style-type: circle; margin-top: 5px;">Timely receipt of RFI answers. We require the RFI's to be addressed and answered within 48 hours to maintain the schedule. Any delay in the RFI response will affect the delivery schedule.</li>
                  </ul>
                </li>
              </ul>
            </div>

            <p style="font-size: 14px; margin-bottom: 20px; color: #444;">
              We look forward to working with <span style="font-weight: bold; color: #333;">${
                est.fabricatorName || "Cobb Industrial, Inc"
              }</span> and supporting your efforts on this job. We are confident that we can meet the challenges ahead and stand ready to partner with you in delivering an effective detailing solution.
            </p>
            
            <p style="font-size: 14px; margin-bottom: 30px; color: #444;">
              If you have questions on this proposal, feel free to contact Rajeshwari at your convenience by email at <span style="color: #0056b3; text-decoration: underline;">raj@whiteboardtec.com</span> or by phone at <span style="font-weight: bold;">612-605-5833</span>.
            </p>

            <div style="margin-top: 40px;">
              <p style="font-size: 14px; margin-bottom: 5px; color: #444;">Thank you for your consideration,</p>
              <p style="font-size: 16px; font-weight: bold; margin: 0; color: #333;">Rajeshwari Vishal Khandappanavar</p>
              <p style="font-size: 14px; margin: 0; color: #666;">President</p>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const handleEstimationChange = async (estId: string) => {
    setSelectedEstimationId(estId);
    if (!estId) {
      setSelectedEstimation(null);
      setValue("description", "");
      return;
    }

    try {
      const res = await Service.GetEstimationById(estId);
      const est = res?.data;
      if (!est) return;

      setSelectedEstimation(est);
      const proposalHtml = generateProposalHtml(est, pricingItems);
      setValue("description", proposalHtml);
    } catch (error) {
      console.error("Error fetching estimation details:", error);
    }
  };

  const handlePricingItemChange = (
    index: number,
    field: string,
    value: any,
  ) => {
    const updatedItems = [...pricingItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setPricingItems(updatedItems);

    if (selectedEstimation) {
      const proposalHtml = generateProposalHtml(
        selectedEstimation,
        updatedItems,
      );
      setValue("description", proposalHtml);
    }
  };

  const handlePrint = () => {
    const content = getValues("description");
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Proposal Print</title>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  // Submit Handler
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      const userId = sessionStorage.getItem("userId") || ""; // assuming userId stored in session
      const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";

      const formData = new FormData();
      formData.append("rfqId", rfqId);
      formData.append("description", data.description);
      formData.append("status", "OPEN"); // response status
      formData.append("wbtStatus", data.wbtStatus || "OPEN"); // parent rfq status
      formData.append("userRole", userRole ?? "");
      formData.append("userId", userId ?? "");

      if (data.link) formData.append("link", data.link);

      if (files.length > 0) {
        files.forEach((file) => formData.append("files", file));
      }

      await Service.addResponse(formData, rfqId);
      toast.success("Response added successfully!");
      reset();
      setFiles([]);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Response submission failed:", err);
      toast.error("Failed to add response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white shadow-2xl rounded-2xl md:rounded-3xl w-full max-w-6xl relative flex flex-col h-[95vh] md:h-auto md:max-h-[90vh] border border-black/10">
        {/* Fixed Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-black/10 flex justify-between items-center bg-white rounded-t-2xl md:rounded-t-3xl shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
              Add Response
            </h2>
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
              RFQ Response Protocol
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-3 bg-red-50 hover:bg-red-100 text-black rounded-lg border border-red-600 transition-all flex items-center justify-center font-bold text-xs"
          >
            Close
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8">
          <form
            id="response-form"
            className="space-y-6 sm:space-y-8"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Estimation Selection */}
            <div className="bg-gray-50/50 p-4 sm:p-6 rounded-2xl border border-black/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] sm:text-xs font-black text-black/40 uppercase tracking-[0.2em] mb-2">
                    Select Estimation for Proposal
                  </label>
                  <Select
                    name="estimationId"
                    options={estimations.map((est) => ({
                      label: `${est.estimationNumber} - ${est.projectName}`,
                      value: est.id,
                    }))}
                    value={selectedEstimationId}
                    onChange={(_: any, val: any) =>
                      handleEstimationChange(val as string)
                    }
                    placeholder="Search intelligence..."
                    className="h-12"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handlePrint}
                  disabled={!selectedEstimationId}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-12 bg-white text-black rounded-xl border border-black hover:bg-gray-50 transition-all disabled:opacity-30 shadow-sm font-black uppercase text-xs tracking-widest shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  Print Proposal
                </Button>
              </div>

              {/* Pricing Items Selection */}
              {selectedEstimationId && (
                <div className="mt-6 pt-6 border-t border-black/5 space-y-6">
                  <h3 className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Quantification Matrix
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {pricingItems.map((item, index) => (
                      <div
                        key={item.label}
                        className="bg-white p-4 rounded-xl border border-black/10 shadow-sm hover:border-green-400 group transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <label className="flex items-center gap-3 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={(e) =>
                                handlePricingItemChange(
                                  index,
                                  "selected",
                                  e.target.checked,
                                )
                              }
                              className="w-5 h-5 text-green-600 rounded-lg border-black/20 focus:ring-green-500 cursor-pointer"
                            />
                            <span className="text-sm font-black text-black uppercase tracking-tight group-hover:text-green-600 transition-colors">
                              {item.label}
                            </span>
                          </label>

                          {item.selected && (
                            <div className="flex flex-row gap-2 sm:gap-3 items-center animate-in slide-in-from-right-4 duration-300">
                              <div className="relative flex-1 sm:w-32">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 text-[10px] font-black uppercase">
                                  {selectedEstimation?.fabricators
                                    ?.currencyType || "USD"}
                                </span>
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) =>
                                    handlePricingItemChange(
                                      index,
                                      "price",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0.00"
                                  className="w-full pl-12 pr-3 h-10 text-sm border border-black/10 rounded-lg focus:ring-1 focus:ring-green-500 outline-none font-black"
                                />
                              </div>
                              <div className="relative flex-1 sm:w-28">
                                <input
                                  type="number"
                                  value={item.weeks}
                                  onChange={(e) =>
                                    handlePricingItemChange(
                                      index,
                                      "weeks",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0"
                                  className="w-full pl-3 pr-12 h-10 text-sm border border-black/10 rounded-lg focus:ring-1 focus:ring-green-500 outline-none font-black"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 text-[10px] font-black uppercase">
                                  WKS
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">
                Proposal Narrative / Detailed Description *
              </label>
              <div className="border border-black/10 rounded-2xl overflow-hidden focus-within:border-green-400 transition-all">
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: "Message is required" }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Synthesize your response here..."
                    />
                  )}
                />
              </div>
            </div>

            {/* Optional Link & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">
                  Lifecycle Status Transition
                </label>
                <div className="relative">
                  <select
                    {...register("wbtStatus")}
                    className="w-full h-12 px-4 border border-black/10 rounded-xl bg-white focus:ring-2 focus:ring-green-100 outline-none font-black uppercase text-xs tracking-widest appearance-none cursor-pointer"
                    defaultValue="OPEN"
                  >
                    <option value="OPEN">OPEN - ACTIVE</option>
                    <option value="IN_PROGRESS">
                      IN PROGRESS - SYNTHESIZING
                    </option>
                    <option value="CLOSED">CLOSED - TERMINATED</option>
                    <option value="AWARDED">AWARDED - SUCCESS</option>
                    <option value="RE_APPROVED">RE-APPROVED - REITERATE</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black/20">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">
                  Asset Link (External)
                </label>
                <input
                  {...register("link")}
                  placeholder="HTTPS://EXTERNAL.RESOURCE.LINK"
                  className="w-full h-12 px-4 border border-black/10 rounded-xl focus:ring-2 focus:ring-green-100 outline-none font-medium text-sm"
                />
              </div>
            </div>

            {/* Files */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">
                Technical Appendices / Supporting Files
              </label>
              <div className="p-1 rounded-2xl border-2 border-dashed border-black/10 hover:border-green-400/50 transition-all bg-gray-50/30">
                <Controller
                  name="files"
                  control={control}
                  render={() => (
                    <MultipleFileUpload
                      onFilesChange={(uploadedFiles) => setFiles(uploadedFiles)}
                    />
                  )}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="px-5 sm:px-8 py-4 sm:py-6 border-t border-black/10 bg-gray-50/50 rounded-b-2xl md:rounded-b-3xl flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 shrink-0">
          <Button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 text-black border border-black/20 bg-white rounded-xl hover:bg-gray-50 font-black uppercase text-xs tracking-widest transition-all"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="response-form"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-3 bg-green-200 text-black rounded-xl border border-black hover:bg-green-300 transition-all disabled:opacity-50 font-black uppercase text-xs tracking-[0.2em] shadow-sm"
          >
            {loading ? "Transmitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResponseModal;
