import { useEffect, useState } from "react";
import {
  Loader2,
  AlertCircle,
  FileText,
  Calendar,
  User,
  Briefcase,
  DollarSign,
  CheckCircle,
  Clock,
} from "lucide-react";
import Service from "../../api/Service";

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
        console.log("Invoice data:", response);
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
      <div className="flex items-center justify-center py-8 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading invoice details...
      </div>
    );

  if (error || !invoice)
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error || "Invoice not found"}
      </div>
    );

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString() : "—";

  const formatCurrency = (amount: number, currency: string = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-teal-600" />
            Invoice #{invoice.invoiceNumber}
          </h2>
          <p className="text-gray-500 mt-1">ID: {id}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            invoice.paymentStatus
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {invoice.paymentStatus ? (
            <span className="flex items-center gap-1">
              <CheckCircle size={14} /> Paid
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Clock size={14} /> Pending
            </span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <DetailItem
            icon={<User size={18} className="text-gray-400" />}
            label="Customer"
            value={invoice.customerName}
          />
          <DetailItem
            icon={<Briefcase size={18} className="text-gray-400" />}
            label="Job Name"
            value={invoice.jobName}
          />
          <DetailItem
            icon={<Calendar size={18} className="text-gray-400" />}
            label="Invoice Date"
            value={formatDate(invoice.invoiceDate)}
          />
        </div>

        <div className="space-y-4">
          <DetailItem
            icon={<DollarSign size={18} className="text-gray-400" />}
            label="Total Amount"
            value={formatCurrency(
              invoice.totalInvoiceValue,
              invoice.currencyType
            )}
            valueClassName="text-lg font-bold text-teal-700"
          />
          {invoice.GSTIN && (
            <DetailItem
              icon={<FileText size={18} className="text-gray-400" />}
              label="GSTIN"
              value={invoice.GSTIN}
            />
          )}
        </div>
      </div>

      {/* Invoice Items */}
      {invoice.invoiceItems && invoice.invoiceItems.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Invoice Items
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2 text-right">Unit</th>
                  <th className="px-4 py-2 text-right">SAC</th>
                  <th className="px-4 py-2 text-right">Quantity</th>
                  <th className="px-4 py-2 text-right">Rate</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.invoiceItems.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        {item.remarks && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            Note: {item.remarks}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{item.unit || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {item.sacCode || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(
                        item.rateUSD || item.rate,
                        invoice.currencyType
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(
                        item.totalUSD || item.amount,
                        invoice.currencyType
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bank Account Info */}
      {invoice.accountInfo && invoice.accountInfo.length > 0 && (
        <div className="mt-8 p-4 bg-teal-50 rounded-xl border border-teal-100">
          <h3 className="text-sm font-bold text-teal-800 mb-2 uppercase tracking-wider">
            Payment Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Account Name</p>
              <p className="font-medium">
                {invoice.accountInfo[0].accountName}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Bank Name</p>
              <p className="font-medium">{invoice.accountInfo[0].bankName}</p>
            </div>
            <div>
              <p className="text-gray-500">Account Number</p>
              <p className="font-medium">
                {invoice.accountInfo[0].accountNumber}
              </p>
            </div>
            {invoice.accountInfo[0].abaRoutingNumber && (
              <div>
                <p className="text-gray-500">ABA Routing Number</p>
                <p className="font-medium">
                  {invoice.accountInfo[0].abaRoutingNumber}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({
  icon,
  label,
  value,
  valueClassName = "text-gray-900",
}: any) => (
  <div className="flex items-start gap-3">
    <div className="mt-1">{icon}</div>
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </p>
      <p className={`font-medium ${valueClassName}`}>{value || "—"}</p>
    </div>
  </div>
);

export default GetInvoiceById;
