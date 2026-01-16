import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import Service from "../../api/Service";
import logo from "../../assets/logo.png";

const GetInvoiceById = ({ id }: { id: string }) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await Service.GetInvoiceById(id);
        setInvoice(response?.data || response || null);
      } catch (err) {
        setError("Failed to load invoice details");
        console.error("Error fetching invoice:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchInvoice();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-12 text-gray-700">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading invoice...
      </div>
    );

  if (error || !invoice)
    return (
      <div className="flex items-center justify-center py-12 text-red-600">
        <AlertCircle className="w-6 h-6 mr-2" />
        {error || "Invoice not found"}
      </div>
    );

  const formatDate = (date?: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);

  return (
    <div className="max-w-[210mm] mx-auto bg-white shadow-lg my-8 print:shadow-none print:my-0">
      {/* Main Invoice Page */}
      <div className="p-8 md:p-12 min-h-[297mm] relative flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-normal text-[#4ade80] mt-4">
            Whiteboard Technologies LLC
          </h1>
          <img src={logo} alt="Whiteboard Technologies" className="h-16" />
        </div>

        <div className="border-b-2 border-red-500 mb-2"></div>

        <div className="flex justify-between items-center mb-8">
          <span className="text-xs text-gray-700">acc</span>
          <h2 className="text-lg font-bold text-gray-700">
            Original for Recipient
          </h2>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left Column: Receiver Details */}
          <div>
            <h3 className="font-bold text-gray-700 mb-2">
              Details of Receiver (Billed to)
            </h3>
            <div className="grid grid-cols-[140px_1fr] gap-y-1 text-sm">
              <span className="text-gray-700">Name:</span>
              <span className="font-bold">{invoice.customerName}</span>

              <span className="text-gray-700">Contact Name:</span>
              <span className="font-bold">{invoice.receiptId || "—"}</span>

              <span className="text-gray-700">Address:</span>
              <span className="font-bold whitespace-pre-wrap">
                {invoice.address || "—"}
              </span>

              <span className="text-gray-700">Country/State/State code:</span>
              <span className="font-bold">{invoice.stateCode || "—"}</span>

              <span className="text-gray-700">GSTIN / UNIQUE ID:</span>
              <span className="font-bold">{invoice.GSTIN || "-"}</span>
            </div>
          </div>

          {/* Right Column: Invoice Metadata */}
          <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
            <span className="text-gray-700">Invoice No:</span>
            <span className="font-bold">{invoice.invoiceNumber}</span>

            <span className="text-gray-700">Invoice Date:</span>
            <span className="font-bold">{formatDate(invoice.invoiceDate)}</span>

            <span className="text-gray-700">Date of Supply:</span>
            <span className="font-bold">
              {formatDate(invoice.dateOfSupply)}
            </span>

            <span className="text-gray-700">Place of Supply:</span>
            <span className="font-bold">
              {invoice.placeOfSupply || "Electronic"}
            </span>

            <span className="text-gray-700 mt-4">Job Name:</span>
            <span className="font-bold mt-4">{invoice.jobName}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-0">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-[#4ade80] text-white text-sm">
                <th className="py-3 px-2 text-center w-[5%] font-semibold">Sl. #</th>
                <th className="py-3 px-2 text-left w-[35%] font-semibold">Description of Engineering Services</th>
                <th className="py-3 px-2 text-center w-[10%] font-semibold">SAC</th>
                <th className="py-3 px-2 text-center w-[10%] font-semibold">Unit</th>
                <th className="py-3 px-2 text-right w-[13%] font-semibold">Rate ({invoice.currencyType})</th>
                <th className="py-3 px-2 text-right w-[13%] font-semibold">Total</th>
                <th className="py-3 px-2 text-right w-[14%] font-semibold">Total ({invoice.currencyType})</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {invoice.invoiceItems?.map((item: any, index: number) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 px-2 text-center">{index + 1}.</td>
                  <td className="py-3 px-2 text-left">
                    {item.description}
                    {item.remarks && (
                      <div className="text-xs text-gray-500 mt-1 italic">
                        ({item.remarks})
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">{item.sacCode || ""}</td>
                  <td className="py-3 px-2 text-center">{item.unit}</td>
                  <td className="py-3 px-2 text-right">
                    {item.rateUSD?.toFixed(2) || item.rate?.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {item.totalUSD?.toFixed(2) || item.amount?.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right font-medium">
                    {item.totalUSD?.toFixed(2) || item.amount?.toFixed(2)}
                  </td>
                </tr>
              ))}
              {/* Filler Rows to maintain min height if needed, implies professional space */}
              {[...Array(Math.max(0, 3 - (invoice.invoiceItems?.length || 0)))].map((_, i) => (
                <tr key={`filler-${i}`} className="border-b border-gray-100">
                  <td colSpan={7} className="py-4">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col items-end mb-8">
          <div className="w-full max-w-md">
            <div className="flex justify-between py-2 border-b border-gray-300 text-sm">
              <span className="font-bold text-gray-700">Total</span>
              <span className="font-bold text-gray-900">{formatCurrency(invoice.totalInvoiceValue, invoice.currencyType)}</span>
            </div>
            {/* Optional Rate/Amount breakdown row if needed per image, usually redundant with bottom totals but adding placeholder */}
            <div className="flex justify-end gap-12 py-1 text-xs text-gray-500 border-b border-gray-200">
              <span className="w-20 text-right">Rate</span>
              <span className="w-20 text-right">Amount</span>
            </div>
            <div className="flex justify-end gap-12 py-1 text-sm border-b border-gray-800 mb-2">
              <span className="w-20 text-right">-</span>
              <span className="w-20 text-right">-</span>
            </div>

            <div className="flex justify-between py-2 text-sm border-b border-gray-300">
              <span className="font-bold text-gray-700">Total Invoice Value (in Figures)</span>
              <span className="font-bold text-gray-900">{formatCurrency(invoice.totalInvoiceValue, invoice.currencyType)}</span>
            </div>
          </div>

          <div className="w-full mt-4 p-3 bg-gray-50 border border-gray-200 rounded lg:w-full">
            <div className="flex gap-2 text-sm">
              <span className="font-bold text-gray-700 whitespace-nowrap">Total Invoice Value (in Words):</span>
              <span className="uppercase font-medium text-gray-900">{invoice.totalInvoiceValueInWords || "—"} ONLY</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8">
          <h4 className="text-[#4ade80] font-bold mb-1">Instructions</h4>
          <div className="border border-black p-2 text-sm">
            <p>
              Consulting Proforma Invoice for Steel Detailing of{" "}
              {invoice.jobName} - <span className="font-bold">Cobb P.O #</span>
            </p>
          </div>
          <p className="text-xs mt-1">
            All payments to be made to{" "}
            <span className="font-bold">WHITEBOARD TECHNOLOGIES LLC</span> in US
            Dollars via Wire Transfers within 15 days.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto">
          <div className="flex flex-col items-end mb-8">
            <p className="text-[#4ade80] mb-4">Thank you for your business!</p>
            <p className="text-sm mb-8">For Whiteboard Technologies Pvt Ltd</p>
            {/* Signature Placeholder */}
            {/* <img src={signature} alt="Signature" className="h-12 mb-2" /> */}
            <div className="h-12 w-32 mb-2"></div>
            <p className="text-sm text-gray-700">Authorised signatory</p>
          </div>

          <div className="text-xs text-gray-700">
            <p className="mb-2">For any questions please contact Raj:</p>
            <div className="flex gap-8">
              <div>
                <span className="text-[#4ade80]">Tel:</span> USA: +1
                612.605.5833
                <br />
                <span className="ml-[22px]">INDIA: +1 770.256.6888</span>
              </div>
              <div>
                <span className="text-[#4ade80]">Email:</span>{" "}
                raj@whiteboardtec.com
                <br />
                <span className="text-[#4ade80]">Web:</span>{" "}
                www.whiteboardtec.com
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Break for Bank Info */}
      <div className="print:break-before-page p-8 md:p-12 bg-white border-t-4 border-gray-100 md:border-t-0">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-3xl font-normal text-[#4ade80]">
            Whiteboard Technologies LLC
          </h1>
          <img src={logo} alt="Whiteboard Technologies" className="h-16" />
        </div>
        <div className="border-b-2 border-red-500 mb-8"></div>

        <p className="mb-8 text-sm">
          Please initiate the ACH/Wire Transfer in {invoice.currencyType}{" "}
          currency from your local Bank with the following information:
        </p>

        <h3 className="font-bold mb-6">ACH /Domestic Wire instructions:</h3>

        {invoice.accountInfo && invoice.accountInfo.length > 0 ? (
          <div className="grid grid-cols-[250px_1fr] gap-y-6 text-sm">
            <span className="font-medium">ABA/Routing number:</span>
            <span>{invoice.accountInfo[0].abaRoutingNumber || "—"}</span>

            <span className="font-medium">Account number:</span>
            <span>{invoice.accountInfo[0].accountNumber || "—"}</span>

            <span className="font-medium">Account type:</span>
            <span>
              {invoice.accountInfo[0].accountType || "Business checking"}
            </span>

            <span className="font-medium">
              Recipient / beneficiary information*:
            </span>
            <span>Whiteboard Technologies LLC.</span>

            <span className="font-medium">Beneficiary address:</span>
            <span className="whitespace-pre-wrap">
              {invoice.accountInfo[0].beneficiaryAddress ||
                "2055, Limestone Rd STE 200-C, Wilmington New Castle Country,\nWilmington, DE, 19808."}
            </span>

            <span className="font-medium">Bank information:</span>
            <span>{invoice.accountInfo[0].bankName || "Column Bank"}</span>

            <span className="font-medium">Bank Address:</span>
            <span className="whitespace-pre-wrap">
              {invoice.accountInfo[0].bankAddress ||
                "1110, Gorgas Ave Suite A4-700, San Francisco, CA 94129."}
            </span>
          </div>
        ) : (
          <p className="text-red-500">
            No bank account information attached to this invoice.
          </p>
        )}

        <p className="mt-8 text-sm">
          *Use this name as the recipient's name of the wire.
        </p>

        {/* Footer Repeated */}
        <div className="mt-24">
          <div className="text-xs text-gray-700">
            <p className="mb-2">For any questions please contact Raj:</p>
            <div className="flex gap-8">
              <div>
                <span className="text-[#4ade80]">Tel:</span> USA: +1
                612.605.5833
                <br />
                <span className="ml-[22px]">INDIA: +1 770.256.6888</span>
              </div>
              <div>
                <span className="text-[#4ade80]">Email:</span>{" "}
                raj@whiteboardtec.com
                <br />
                <span className="text-[#4ade80]">Web:</span>{" "}
                www.whiteboardtec.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetInvoiceById;
