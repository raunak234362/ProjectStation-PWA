import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Service from "../../api/Service";
import logo from "../../assets/logo.png";
import { useDispatch } from "react-redux";
import { incrementModalCount, decrementModalCount } from "../../store/uiSlice";

const loadImageAsDataUrl = async (imageUrl: string): Promise<string> => {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error("Unable to load invoice logo");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Unable to read invoice logo"));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
};

const downloadInvoicePdfInBrowser = async (
  html: string,
  filename: string,
  invoice: Record<string, any>,
): Promise<void> => {
  const totalValue = Number(invoice.totalInvoiceValue);
  const replacements: Record<string, string> = {
    '$ ${invoice.totalInvoiceValue?.toFixed(0) || "0"}': `$ ${Number.isFinite(totalValue) ? totalValue.toFixed(0) : "0"}`,
    '$ ${invoice.totalInvoiceValue?.toFixed(2) || "0.00"}': `$ ${Number.isFinite(totalValue) ? totalValue.toFixed(2) : "0.00"}`,
    '${invoice.totalInvoiceValueInWords || "—"}': String(invoice.totalInvoiceValueInWords || "—"),
    '${INVOICE.TOTALINVOICEVALUEINWORDS || "—"}': String(invoice.totalInvoiceValueInWords || "—"),
  };
  const resolvedHtml = Object.entries(replacements).reduce(
    (content, [placeholder, value]) => content.replaceAll(placeholder, value),
    html,
  );
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;";
  const htmlUrl = URL.createObjectURL(new Blob([resolvedHtml], { type: "text/html" }));
  const frameReady = new Promise<void>((resolve, reject) => {
    frame.onload = () => resolve();
    frame.onerror = () => reject(new Error("Unable to render invoice content"));
    frame.src = htmlUrl;
  });
  document.body.appendChild(frame);

  try {
    await frameReady;
    const frameDocument = frame.contentDocument;
    if (!frameDocument) throw new Error("Unable to access invoice content");
    await frameDocument.fonts?.ready;
    await Promise.all(
      Array.from(frameDocument.images, (image) => image.decode().catch(() => undefined)),
    );

    const pages = Array.from(frameDocument.querySelectorAll<HTMLElement>(".print-page"));
    if (!pages.length) throw new Error("No invoice pages were generated");

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    for (const [index, page] of pages.entries()) {
      if (index > 0) pdf.addPage("a4", "portrait");
      const canvas = await html2canvas(page, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        width: page.scrollWidth,
        height: page.scrollHeight,
      });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 210, 297);
    }

    const safeFilename = filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");
    pdf.save(safeFilename.toLowerCase().endsWith(".pdf") ? safeFilename : `${safeFilename}.pdf`);
  } finally {
    frame.remove();
    URL.revokeObjectURL(htmlUrl);
  }
};


const GetInvoiceById = ({
  id,
  onClose,
  close,
}: {
  id: string;
  onClose?: () => void;
  close?: () => void;
}) => {
  const handleClose = onClose || close;
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(incrementModalCount());
    return () => {
      dispatch(decrementModalCount());
    };
  }, [dispatch]);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await Service.GetInvoiceById(id);
        const data = response?.data || response || null;
        setInvoice(data);
      } catch (err) {
        setError("Failed to load invoice details");
        console.error("Error fetching invoice:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchInvoice();
  }, [id]);

  const handleDownloadPdfVector = async () => {
    if (!invoice || downloadingPdf) return;
    setDownloadingPdf(true);

    try {
      const doc = new jsPDF({ format: "a4", unit: "mm" });
      const green: [number, number, number] = [107, 189, 69];
      const ink: [number, number, number] = [25, 25, 25];
      const muted: [number, number, number] = [90, 90, 90];
      const left = 14;
      const width = 182;
      let y = 17;

      const writeHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(...green);
        doc.text("Whiteboard Technologies LLC", left, y);
        doc.setDrawColor(...green);
        doc.setLineWidth(0.5);
        doc.line(left, y + 4, left + width, y + 4);
        y += 13;
      };

      const drawLabelValue = (label: string, value: unknown, x: number, rowY: number, maxWidth: number) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...ink);
        doc.text(label, x, rowY);
        doc.setFont("helvetica", "normal");
        const labelWidth = doc.getTextWidth(label) + 2;
        const lines = doc.splitTextToSize(String(value || "—"), maxWidth - labelWidth);
        doc.text(lines, x + labelWidth, rowY);
        return Math.max(5, lines.length * 4);
      };

      const formatDate = (date?: string) => date
        ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "—";
      const address = [
        invoice.pointOfContact?.[0]?.address || invoice.address || invoice.client?.address || invoice.fabricator?.branches?.[0]?.address,
        [
          invoice.pointOfContact?.[0]?.city || invoice.city || invoice.client?.city || invoice.fabricator?.branches?.[0]?.city,
          invoice.pointOfContact?.[0]?.state || invoice.state || invoice.stateCode || invoice.client?.state || invoice.fabricator?.branches?.[0]?.state,
          invoice.pointOfContact?.[0]?.zipCode || invoice.zipCode || invoice.client?.zipCode || invoice.fabricator?.branches?.[0]?.zipCode,
        ].filter(Boolean).join(", "),
        invoice.pointOfContact?.[0]?.country || invoice.country || invoice.client?.country || invoice.fabricator?.branches?.[0]?.country,
        invoice.pointOfContact?.[0]?.phone || invoice.phone || invoice.client?.phone || invoice.fabricator?.branches?.[0]?.phone,
      ].filter(Boolean).join("\n") || "—";

      writeHeader();
      doc.setFontSize(10);
      doc.setTextColor(...ink);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", left, y);
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice No: ${invoice.invoiceNumber || "—"}`, left + 115, y);
      y += 7;

      const billingStartY = y;
      const billingHeight = drawLabelValue("Billed to:", invoice.fabricator?.fabName || invoice.customerName, left, y, 105);
      drawLabelValue("Invoice date:", formatDate(invoice.invoiceDate), left + 118, y, 64);
      y += billingHeight;
      const addressHeight = drawLabelValue("Address:", address, left, y, 105);
      drawLabelValue("Date of supply:", formatDate(invoice.dateOfSupply), left + 118, y, 64);
      y += addressHeight;
      drawLabelValue("Contact:", invoice.contactName, left, y, 105);
      drawLabelValue("Place of supply:", invoice.placeOfSupply || "Electronic", left + 118, y, 64);
      y += 6;
      drawLabelValue("GSTIN / UNIQUE ID:", invoice.GSTIN, left, y, 105);
      drawLabelValue("Job name:", invoice.jobName, left + 118, y, 64);
      y = Math.max(y + 9, billingStartY + 30);

      const itemRows = (invoice.invoiceItems || []).map((item: any, index: number) => [
        `${index + 1}.`,
        item.description || "—",
        item.sacCode || "998333",
        item.unit || "—",
        item.rateUSD?.toFixed?.(0) || "000",
        item.totalUSD?.toFixed?.(0) || "000",
        item.totalUSD?.toFixed?.(0) || "000",
      ]);
      autoTable(doc, {
        startY: y,
        head: [["SL #", "Description of Engineering Services", "SAC", "Unit", "Rate (USD)", "Total", "Total (USD)"]],
        body: itemRows.length ? itemRows : [["—", "No invoice items", "—", "—", "—", "—", "—"]],
        theme: "grid",
        headStyles: { fillColor: green, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7 },
        styles: { font: "helvetica", fontSize: 7, cellPadding: 2, textColor: ink, overflow: "linebreak" },
        columnStyles: {
          0: { cellWidth: 9 },
          1: { cellWidth: 72 },
          2: { cellWidth: 16 },
          3: { cellWidth: 14 },
          4: { cellWidth: 23, halign: "right" },
          5: { cellWidth: 22, halign: "right" },
          6: { cellWidth: 26, halign: "right" },
        },
        margin: { left, right: left },
      });
      y = (doc as any).lastAutoTable.finalY + 5;

      autoTable(doc, {
        startY: y,
        body: [
          ["Total", `$ ${invoice.totalInvoiceValue?.toFixed?.(0) || "0"}`],
          ["IGST", "—"],
          ["Total GST", "—"],
          ["Total Invoice Value (in Figures)", `$ ${invoice.totalInvoiceValue?.toFixed?.(2) || "0.00"}`],
          ["Total Invoice Value (in Words)", invoice.totalInvoiceValueInWords || "—"],
        ],
        theme: "grid",
        styles: { font: "helvetica", fontSize: 8, cellPadding: 2.5, textColor: ink },
        columnStyles: { 0: { cellWidth: 125, fontStyle: "bold" }, 1: { cellWidth: 57, halign: "right" } },
        margin: { left, right: left },
      });
      y = (doc as any).lastAutoTable.finalY + 8;

      if (y > 235) {
        doc.addPage();
        y = 18;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...green);
      doc.text("INSTRUCTIONS", left, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...ink);
      const instructions = `Consulting Proforma Invoice for Steel Detailing of ${invoice.jobName || "—"} - ${invoice.fabricator?.fabName || "—"} P.O. #${invoice.project?.projectNumber || invoice.project?.projectCode || "—"}`;
      doc.text(doc.splitTextToSize(instructions, width), left, y);
      y += 9;
      doc.text("All payments to be made to Whiteboard Technologies LLC in the invoice currency via wire transfer within 15 days.", left, y, { maxWidth: width });
      y += 16;
      doc.setTextColor(...green);
      doc.setFont("helvetica", "italic");
      doc.text("Thank you for your business!", 105, y, { align: "center" });
      y += 8;
      doc.setTextColor(...ink);
      doc.setFont("helvetica", "bold");
      doc.text("For Whiteboard Technologies Pvt Ltd", 196, y, { align: "right" });
      y += 20;
      doc.setDrawColor(...muted);
      doc.line(145, y, 196, y);
      y += 4;
      doc.setFontSize(7);
      doc.text("Authorised signatory", 170, y, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...muted);
      doc.text("For invoice questions: raj@whiteboardtec.com | +1 612.605.5833 | www.whiteboardtec.com", left, 282, { maxWidth: width });

      doc.addPage();
      y = 17;
      writeHeader();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...ink);
      doc.text("ACH / DOMESTIC WIRE INSTRUCTIONS", left, y + 5);
      y += 15;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Please initiate the ACH/Wire Transfer in ${invoice.currencyType || "USD"} currency from your local bank.`, left, y, { maxWidth: width });
      y += 12;

      const bank = invoice.fabricator?.bankAccount;
      autoTable(doc, {
        startY: y,
        body: bank
          ? [
              ["ABA/Routing number", bank.abaRoutingNumber || "—"],
              ["Account number", bank.accountNumber || "—"],
              ["Account type", bank.accountType || "—"],
              ["Recipient / beneficiary", bank.accountName || "Whiteboard Technologies LLC."],
              ["Beneficiary address", bank.beneficiaryAddress || "—"],
              ["Bank information", bank.bankName || "—"],
              ["Bank address", bank.bankAddress || "—"],
            ]
          : [["Bank account", "No bank account information attached to this invoice."]],
        theme: "grid",
        styles: { font: "helvetica", fontSize: 9, cellPadding: 4, textColor: ink, overflow: "linebreak" },
        columnStyles: { 0: { cellWidth: 58, fontStyle: "bold", fillColor: [248, 250, 252] }, 1: { cellWidth: 124 } },
        margin: { left, right: left },
      });
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text("*Use the beneficiary name above as the recipient's name for the wire.", left, (doc as any).lastAutoTable.finalY + 9, { maxWidth: width });
      doc.text("For invoice questions: raj@whiteboardtec.com | +1 612.605.5833 | www.whiteboardtec.com", left, 282, { maxWidth: width });

      const invoiceNumber = String(invoice.invoiceNumber || "NA").replace(/[^\w.-]+/g, "_");
      doc.save(`Invoice_${invoiceNumber}.pdf`);
    } catch (err) {
      console.error("Error generating invoice PDF:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  void handleDownloadPdfVector;

  const handleDownloadPdf = async () => {
    if (!invoice || downloadingPdf) return;
    setDownloadingPdf(true);

    const formatDateStr = (date?: string) => {
      if (!date) return "—";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const itemsHtml =
      invoice.invoiceItems
        ?.map(
          (item: any, index: number) => `
      <tr style="border-bottom: 1px solid black;">
        <td style="padding: 8px; text-align: left;">${index + 1}.</td>
        <td style="padding: 8px 12px; text-align: left; vertical-align: top;"><strong>${item.description || "—"}</strong>${item.remarks ? `<br/><span style="font-size: 10px; color: #888; font-style: italic;">(${item.remarks})</span>` : ""}</td>
        <td style="padding: 8px; text-align: center;">${item.sacCode || "998333"}</td>
        <td style="padding: 8px; text-align: center;">${item.unit}</td>
        <td style="padding: 8px; text-align: center;">${item.rateUSD?.toFixed(0) || "000"}</td>
        <td style="padding: 8px; text-align: center;">${item.totalUSD?.toFixed(0) || "000"}</td>
        <td style="padding: 8px; text-align: center;">${item.totalUSD?.toFixed(0) || "000"}</td>
      </tr>
    `,
        )
        .join("") || "";

    const bankInfo = invoice?.fabricator?.bankAccount || null;
    const logoDataUrl = await loadImageAsDataUrl(logo).catch(() => logo);

    const invoiceHtml = `
     <html>
  <head>
    <title>Invoice_${invoice.invoiceNumber || "NA"}</title>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap");

      /* Page setup */
      @page {
        size: A4;
        margin: 0;
      }

      /* Base */
      html,
      body {
        margin: 0;
        padding: 0;
        background: white;
        font-family: "Roboto", Arial, sans-serif;
        color: #000;
      }

      /* Print page */
      .print-page {
        width: 210mm;
        min-height: 297mm;
        height: auto;
        padding: 15mm;
        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        background: white;
        position: relative;

        margin: 0;
        box-shadow: none;

        page-break-after: always;
        break-after: page;
      }

      .print-page:last-child {
        page-break-after: auto;
        break-after: auto;
      }

      /* Force print colors/backgrounds */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* Print-specific styles */
      @media print {
        @page {
          size: A4;
          margin: 0;
        }

        html,
        body {
          background: white !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .print-page {
          box-shadow: none !important;
          margin: 0 !important;

          page-break-after: always !important;
          break-after: page !important;

          width: 100% !important;
          min-height: 297mm !important;

          padding: 15mm !important;
          box-sizing: border-box !important;

          display: flex !important;
          flex-direction: column !important;

          background: white !important;
          position: relative !important;
        }

        .print-page:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
      }

      /* Header */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-center;
        margin-bottom: 20px;
      }

      .company-name {
        font-family: serif;
        color: #6bbd45;
        font-size: 34px;
        font-weight: 500;
        margin: 20px 0 0;
        line-height: 1;
      }

      .logo {
        height: 100px;
        object-fit: contain;
      }

      .divider-green {
        height: 1px;
        background: #6bbd45;
        width: 100%;
        margin-bottom: 8px;
      }

      /* Invoice details */
      .details-container {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        font-size: 12px;
        margin-bottom: 8px;
        line-height: 1.2;
      }

      .billing-details {
        width: 50%;
      }

      .meta-details {
        width: 220px;
        text-align: left;
      }

      .section-title {
        font-weight: bold;
        font-size: 13px;
        margin-bottom: 8px;
      }

      .grid-details {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 4px 0;
        text-align: left;
      }

      .label {
        color: #000;
        font-weight: bold;
      }

      .value {
        font-weight: normal;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: 100px 1fr;
        gap: 8px 0;
        text-align: left;
      }

      /* Invoice table */
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 32px;
        border: 1px solid #6bbd45;
      }

      thead {
        background: #6bbd45;
        color: white;
        font-size: 11px;
        font-weight: bold;
      }

      th {
        padding: 8px 8px;
        text-align: center;
        text-transform: uppercase;
        border-right: 1px solid rgba(255, 255, 255, 0.8);
      }

      th:last-child {
        border-right: none;
      }

      tbody {
        font-size: 12px;
      }

      /* Invoice summary */
      .total-row {
        font-weight: normal;
        border-top: 1px solid #000;
        border-bottom: 1px solid #000;
      }

      .total-row td:last-child,
      .value-row td:last-child {
        font-weight: bold;
      }

      .gst-row {
        font-size: 11px;
        font-weight: bold;
        border-bottom: 1px solid #000;
      }

      .gst-row td {
        padding-top: 8px !important;
        padding-bottom: 8px !important;
        vertical-align: middle;
      }

      .value-row {
        font-weight: normal;
        font-size: 13px;
        border-bottom: 1px solid #000;
      }

      /* Instructions */
      .instructions {
        margin-bottom: 12px;
      }

      .instr-title {
        color: #6bbd45;
        font-weight: bold;
        font-size: 12px;
        margin-bottom: 4px;
      }

      .instr-box {
        border: 1px solid rgba(107, 189, 69, 0.25);
        background: rgba(107, 189, 69, 0.04);
        border-radius: 8px;
        padding: 8px;
        font-size: 12px;
        margin-bottom: 4px;
      }

      .instr-text {
        font-size: 12px;
      }

      /* Signature */
      .signature-area {
        margin-top: auto;
        padding-bottom: 0;

        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .thank-you {
        color: #6bbd45;
        font-weight: bold;
        font-size: 13px;
        font-style: italic;
        margin-bottom: 32px;
        align-self: center;
      }

      .sig-box {
        text-align: center;
        width: 220px;
      }

      .sig-company {
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 40px;
      }

      .sig-line {
        border-top: 1px solid #000;
        padding-top: 5px;
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
      }

      /* Footer */
      .footer {
        border-top: 0;
        padding-top: 32px;
        margin-top: 48px;

        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;

        font-size: 11px;
        color: #666;
      }

      .footer-green {
        color: #6bbd45;
        font-weight: bold;
        text-transform: uppercase;
      }

      /* Bank information */
      .bank-grid {
        display: grid;
        grid-template-columns: 250px 1fr;
        gap: 40px 0;

        font-size: 14px;
        margin-bottom: 30px;
      }
    </style>
  </head>
  <body>
    <!-- Page 1 -->
    <div class="print-page">
      <div class="header">
        <h1 class="company-name">Whiteboard Technologies LLC</h1>
        <img src="${logoDataUrl}" class="logo" />
      </div>
      <div class="divider-green"></div>

      <div class="details-container">
        <div class="billing-details">
          <div class="section-title">Details of Receiver (Billed to)</div>
          <div class="grid-details">
            <span class="label">Name:</span
            ><span class="value">${invoice.fabricator?.fabName || "—"}</span>
            <span class="label">Contact Name:</span
            ><span class="value">${invoice.contactName || "—"}</span>
            <span class="label">Address:</span>
            <span class="value" style="line-height: 1.2">
              ${invoice.pointOfContact?.[0]?.address || invoice.address ||
              invoice.client?.address ||
              invoice.fabricator?.branches?.[0]?.address || "—"}<br />
              ${invoice.pointOfContact?.[0]?.city || invoice.city ||
              invoice.client?.city || invoice.fabricator?.branches?.[0]?.city ||
              ""}${invoice.pointOfContact?.[0]?.city || invoice.city ||
              invoice.client?.city || invoice.fabricator?.branches?.[0]?.city ?
              ", " : ""}${invoice.pointOfContact?.[0]?.state || invoice.state ||
              invoice.stateCode || invoice.client?.state ||
              invoice.fabricator?.branches?.[0]?.state ||
              ""}${invoice.pointOfContact?.[0]?.zipCode || invoice.zipCode ||
              invoice.client?.zipCode ||
              invoice.fabricator?.branches?.[0]?.zipCode ? `
              ${invoice.pointOfContact?.[0]?.zipCode || invoice.zipCode ||
              invoice.client?.zipCode ||
              invoice.fabricator?.branches?.[0]?.zipCode}` : ""}<br />
              ${invoice.pointOfContact?.[0]?.country || invoice.country ||
              invoice.client?.country ||
              invoice.fabricator?.branches?.[0]?.country || ""}<br />
              ${invoice.pointOfContact?.[0]?.phone || invoice.phone ||
              invoice.client?.phone || invoice.fabricator?.branches?.[0]?.phone
              || ""}
            </span>
            <span class="label">Country/State /Code:</span><br />
            <span class="label">GSTIN / UNIQUE ID:</span
            ><span class="value">${invoice.GSTIN || "-"}</span>
          </div>
        </div>
        <div class="meta-details">
          <div style="margin-bottom: 10px; font-weight: bold">
            Original for Recipient
          </div>
          <div class="meta-grid">
            <span class="label">Invoice No:</span
            ><span class="value">${invoice.invoiceNumber || "—"}</span>
            <span class="label">Invoice Date:</span
            ><span class="value">${formatDateStr(invoice.invoiceDate)}</span>
            <span class="label">Date of Supply:</span
            ><span class="value">${formatDateStr(invoice.dateOfSupply)}</span>
            <span class="label">Place of Supply:</span
            ><span class="value">${invoice.placeOfSupply || "USA"}</span>
            <span class="label">Job Name:</span
            ><span class="value" style="font-weight: bold"
              >${invoice.jobName}</span
            >
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 10%">SL #</th>
            <th style="text-align: center; width: 50%">
              DESCRIPTION OF ENGINEERING<br />SERVICES
            </th>
            <th style="">SAC</th>
            <th style="">UNIT</th>
            <th style="width: 20%;">RATE (USD)</th>
            <th style="">TOTAL</th>
            <th style="width: 10%;">TOTAL (USD)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}${Array.from(
            { length: Math.max(0, 3 - (invoice.invoiceItems?.length || 0)) },
            () => '<tr style="height: 28px; border-bottom: 1px solid #000"><td colspan="7">&nbsp;</td></tr>',
          ).join("")}
          <tr class="total-row">
            <td
              colspan="5"
              style="padding: 10px 8px; text-align: left"
            >
              Total
            </td>
            <td
              colspan="2"
              style="padding: 10px; text-align: right; font-size: 15px"
            >
              $ ${invoice.totalInvoiceValue?.toFixed(0) || "0"}
            </td>
          </tr>
          <tr class="gst-row">
            <td colspan="4" style="border: none"></td>
            <td style="text-align: center; padding: 5px">IGST</td>
            <td style="text-align: center; padding: 5px">Rate</td>
            <td style="text-align: center; padding: 5px">Amount</td>
          </tr>
          <tr class="gst-row" style="font-weight: normal">
            <td colspan="4" style="border: none"></td>
            <td style="text-align: center; padding: 5px">IGST</td>
            <td style="text-align: center; padding: 5px">-</td>
            <td style="text-align: center; padding: 5px">-</td>
          </tr>
          <tr class="gst-row">
            <td colspan="4" style="border: none"></td>
            <td colspan="2" style="text-align: center; padding: 5px">
              Total GST
            </td>
            <td style="text-align: center; padding: 5px">-</td>
          </tr>
          <tr class="value-row">
            <td colspan="5" style="padding: 8px; text-align: left">
              Total Invoice Value (in Figures)
            </td>
            <td colspan="2" style="padding: 8px; text-align: right; white-space: nowrap">
              $ ${invoice.totalInvoiceValue?.toFixed(2) || "0.00"}
            </td>
          </tr>
          <tr>
            <td
              colspan="7"
              style="
                padding: 8px;
                border-bottom: 1.5px solid #000;
                font-weight: normal;
              "
            >
              Total Invoice Value (in Words):
              <span style="text-transform: uppercase; margin-left: 10px"
                >${invoice.totalInvoiceValueInWords || "—"}</span
              >
            </td>
          </tr>
        </tbody>
      </table>

      <div class="instructions">
        <div class="instr-title">Instructions</div>
        <div class="instr-box">
          Consulting Proforma Invoice for Steel Detailing of ${invoice.jobName}
          - ${invoice.fabricator?.fabName} P.O.
          #${invoice.project?.projectNumber || invoice.project?.projectCode ||
          ""}
        </div>
        <div class="instr-text">
          All payments to be made to
          <span style="font-weight: bold; text-transform: uppercase"
            >Whiteboard Technologies LLC</span
          >
          in ${invoice.currencyType || "USD"} Dollars via Wire Transfers within
          15 days.
        </div>
      </div>

      <div class="signature-area">
        <div class="thank-you">Thank you for your business!</div>
        <div class="sig-box">
          <div class="sig-company">For Whiteboard Technologies Pvt Ltd</div>
          <div style="height: 60px"></div>
          <div class="sig-line">Authorised signatory</div>
        </div>
      </div>

      <div class="footer">
        <div>
          <p style="margin-bottom: 5px">
            For any questions please contact Raj:
          </p>
          <p><span class="footer-green">Tel:</span> USA: +1 612.605.5833</p>
          <p><span class="footer-green">Email:</span> raj@whiteboardtec.com</p>
        </div>
        <div style="text-align: right">
          <p>
            <span style="visibility: hidden">Tel:</span> INDIA: +1 770.256.6888
          </p>
          <p><span class="footer-green">Web:</span> www.whiteboardtec.com</p>
        </div>
      </div>
    </div>

    <!-- Page 2 -->
    <div class="print-page">
      <div class="header">
        <h1 class="company-name">Whiteboard Technologies LLC</h1>
        <img src="${logoDataUrl}" class="logo" />
      </div>
      <div class="divider-green"></div>

      <p style="font-size: 14px; margin-bottom: 40px; line-height: 1.5">
        Please initiate the ACH/Wire Transfer in
        <span style="font-weight: bold; text-decoration: underline">USD</span>
        currency from your local Bank with the following information:
      </p>

      <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 30px">
        ACH / Domestic Wire instructions:
      </h3>

      ${bankInfo ? `
      <div class="bank-grid">
        <span class="label">ABA/Routing number:</span
        ><span class="value">${bankInfo.abaRoutingNumber || "—"}</span>
        <span class="label">Account number:</span
        ><span class="value">${bankInfo.accountNumber || "—"}</span>
        <span class="label">Account type:</span
        ><span class="value">${bankInfo.accountType || "—"}</span>
        <span class="label">Recipient / beneficiary information*:</span
        ><span class="value" style="text-transform: uppercase"
          >${bankInfo.accountName || "Whiteboard Technologies LLC."}</span
        >
        <span class="label">Beneficiary address:</span
        ><span class="value">${bankInfo.beneficiaryAddress || "—"}</span>
        <span class="label">Bank information:</span
        ><span class="value">${bankInfo.bankName || "—"}</span>
        <span class="label">Bank Address:</span
        ><span class="value">${bankInfo.bankAddress || "—"}</span>
      </div>
      ` : `
      <div
        style="
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #991b1b;
          padding: 30px;
          text-align: center;
          border-radius: 4px;
          font-weight: bold;
        "
      >
        No bank account information attached to this invoice.
      </div>
      ` }

      <p
        style="
          font-size: 11px;
          color: #666;
          font-style: italic;
          margin-top: 20px;
        "
      >
        *Use this name as the recipient's name of the wire.
      </p>

      <div class="footer" style="margin-top: auto">
        <div>
          <p style="margin-bottom: 5px">
            For any questions please contact Raj:
          </p>
          <p><span class="footer-green">Tel:</span> USA: +1 612.605.5833</p>
          <p><span class="footer-green">Email:</span> raj@whiteboardtec.com</p>
        </div>
        <div style="text-align: right">
          <p>
            <span style="visibility: hidden">Tel:</span> INDIA: +1 770.256.6888
          </p>
          <p><span class="footer-green">Web:</span> www.whiteboardtec.com</p>
        </div>
      </div>
    </div>
  </body>
</html>

    `;

    try {
      const invoiceNumber = String(invoice.invoiceNumber || "NA").replace(/[^\w.-]+/g, "_");
      await downloadInvoicePdfInBrowser(invoiceHtml, `Invoice_${invoiceNumber}.pdf`, invoice);
    } catch (err) {
      console.error("Error generating invoice PDF:", err);
      window.alert("Failed to generate invoice PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

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

  return (
    <>
      {/* Print Styles (kept same) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page { size: A4; margin: 0; }
            body { background: white; margin: 0; padding: 0; }
            .print-page {
              box-shadow: none !important;
              margin: 0 !important;
              page-break-after: always !important;
              break-after: page !important;
              width: 100% !important;
              min-height: 297mm !important;
              padding: 15mm !important;
              box-sizing: border-box !important;
              display: flex !important;
              flex-direction: column !important;
              background: white !important;
              position: relative !important;
            }
            .print-page:last-child { page-break-after: auto !important; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
`,
        }}
      />

      <div className="modal-root fixed inset-0 z-1000 flex items-start justify-center overflow-auto bg-black/80 backdrop-blur-xl pt-0 pb-0">
        {/* Action Header */}
        <div className="fixed top-6 right-10 z-110 flex gap-4 no-print">
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex items-center gap-2 px-6 py-2 bg-green-50 text-black border-2 border-green-700/80 rounded-lg hover:bg-green-100 transition-all font-bold text-sm uppercase tracking-tight shadow-lg cursor-pointer"
          >
            {downloadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {downloadingPdf ? "Generating PDF..." : "Download PDF"}
          </button>

          {handleClose && (
            <button
              onClick={handleClose}
              className="flex items-center justify-center px-6 py-2 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-lg cursor-pointer"
            >
              Close
            </button>
          )}
        </div>

        <div
          className="w-[210mm] flex flex-col gap-0 shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-gray-100 print-content"
        >
          {/* Page 1: Main Invoice */}
          <div className="w-[210mm] min-h-[297mm] bg-white p-[15mm] flex flex-col shadow-none print:shadow-none mx-auto box-border font-roboto print-page">
            {/* Header Letterhead */}
            <div className="flex justify-between items-center mb-2">
              <div>
                <h1
                  className="text-[28px] font-medium text-[#6bbd45] leading-none"
                  style={{ fontFamily: "serif", marginTop: 8 }}
                >
                  Whiteboard Technologies LLC
                </h1>
              </div>
              {/* Ensure logo height is proportional */}
              <img src={logo} alt="Logo" className="h-25 object-contain" />
            </div>
            <div className="h-px bg-[#6bbd45] w-full mb-2"></div>

            <div className="flex justify-between items-start mb-2 text-[12px]">
              {/* Receiver Details */}
              <div className="w-1/2">
                <h2 className=" text-black mb-2 text-[13px]">
                  Details of Receiver (Billed to)
                </h2>
                <div className="grid grid-cols-[120px_1fr] gap-y-1">
                  <span className="text-black">Name:</span>
                  <span className="">{invoice.fabricator?.fabName || "—"}</span>

                  <span className="text-black">Contact Name:</span>
                  <span className="">{invoice.contactName || "—"}</span>

                  <span className="text-black">Address:</span>
                  <div className="flex flex-col leading-tight">
                    <span>{invoice.pointOfContact?.[0]?.address || invoice.address || invoice.client?.address || invoice.fabricator?.branches?.[0]?.address || "—"}</span>
                    <span>
                      {invoice.pointOfContact?.[0]?.city || invoice.city || invoice.client?.city || invoice.fabricator?.branches?.[0]?.city}
                      {(invoice.pointOfContact?.[0]?.city || invoice.city || invoice.client?.city || invoice.fabricator?.branches?.[0]?.city) && ", "}
                      {invoice.pointOfContact?.[0]?.state || invoice.state || invoice.stateCode || invoice.client?.state || invoice.fabricator?.branches?.[0]?.state}{" "}
                      {invoice.pointOfContact?.[0]?.zipCode || invoice.zipCode || invoice.client?.zipCode || invoice.fabricator?.branches?.[0]?.zipCode}
                    </span>
                    <span>{invoice.pointOfContact?.[0]?.country || invoice.country || invoice.client?.country || invoice.fabricator?.branches?.[0]?.country}</span>
                    <span>
                      {invoice.pointOfContact?.[0]?.phone || invoice.phone || invoice.client?.phone || invoice.fabricator?.branches?.[0]?.phone ? ` ${invoice.pointOfContact?.[0]?.phone || invoice.phone || invoice.client?.phone || invoice.fabricator?.branches?.[0]?.phone}` : ""}
                    </span>
                  </div>

                  <span className="text-black ">Country/State /Code:</span>
                  {/* <span className=" "> {invoice.pointOfContact?.[0]?.state || invoice.state || invoice.stateCode || invoice.client?.state || invoice.fabricator?.branches?.[0]?.state || "-"} </span> */}
                  <br/>
                  <span className="text-black ">GSTIN / UNIQUE ID:</span>
                  <span className=" ">{invoice.GSTIN || "-"}</span>
                </div>
              </div>

              {/* Invoice Metadata */}
              <div className="w-[220px]">
                <div className="text-right mb-4">
                  <h2 className=" text-[14px]">Original for Recipient</h2>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-y-2">
                  <span className="text-black">Invoice No:</span>
                  <span className="">
                    {invoice.invoiceNumber || "—"}
                  </span>

                  <span className="text-black">Invoice Date:</span>
                  <span className="">{formatDate(invoice.invoiceDate)}</span>

                  <span className="text-black">Date of Supply:</span>
                  <span className="">{formatDate(invoice.dateOfSupply)}</span>

                  <span className="text-black">Place of Supply:</span>
                  <span className="">
                    {invoice.placeOfSupply || "Electronic"}
                  </span>

                  <span className="text-black">Job Name:</span>
                  <span className="">{invoice.jobName}</span>
                </div>
              </div>
            </div>

            {/* Items Table - Only Rows, No Columns */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-600 text-white">
                    <th className="py-2 px-3 border-r border-gray-300 text-left w-[50px]  text-[11px] uppercase">
                      SL #
                    </th>
                    <th className="py-2 px-3 border-r border-gray-300 text-center  text-[11px] uppercase">
                      Description of Engineering Services
                    </th>
                    <th className="py-2 px-3 border-r border-gray-300 text-center w-[70px]  text-[11px] uppercase">
                      SAC
                    </th>
                    <th className="py-2 px-3 border-r border-gray-300 text-center w-[50px]  text-[11px] uppercase">
                      Unit
                    </th>
                    <th className="py-2 px-3 border-r border-gray-300 text-center w-[90px]  text-[11px] uppercase whitespace-nowrap">
                      Rate (USD)
                    </th>
                    <th className="py-2 px-3 border-r border-gray-300 text-center w-[90px]  text-[11px] uppercase whitespace-nowrap">
                      Total
                    </th>
                    <th className="py-2 px-3 text-center w-[110px]  text-[11px] uppercase whitespace-nowrap">
                      Total (USD)
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[12px] text-black">
                  {invoice.invoiceItems?.map((item: any, index: number) => (
                    <tr key={index} className="border-b border-gray-600">
                      <td className="py-1 px-3 text-left align-top">
                        {index + 1}.
                      </td>
                      <td className="py-1 px-3 text-left align-top whitespace-pre-wrap leading-relaxed">
                        <div className="font-medium">{item.description}</div>
                        {item.remarks && (
                          <div className="text-[10px] text-gray-700 italic">
                            {item.remarks}
                          </div>
                        )}
                      </td>
                      <td className="py-1 px-3 text-center align-top">
                        {item.sacCode}
                      </td>
                      <td className="py-1 px-3 text-center align-top">
                        {item.unit}
                      </td>
                      <td className="py-1 px-3 text-center align-top">
                        {item.rateUSD?.toFixed(0) || "000"}
                      </td>
                      <td className="py-1 px-3 text-center align-top">
                        {item.totalUSD?.toFixed(0) || "000"}
                      </td>
                      <td className="py-1 px-3 text-center align-top">
                        {item.totalUSD?.toFixed(0) || "000"}
                      </td>
                    </tr>
                  ))}
                  {/* Filler Rows */}
                  {[
                    ...Array(
                      Math.max(0, 3 - (invoice.invoiceItems?.length || 0)),
                    ),
                  ].map((_, i) => (
                    <tr
                      key={`filler - ${i} `}
                      className="border-b border-black h-7"
                    >
                      <td colSpan={7}>&nbsp;</td>
                    </tr>
                  ))}

                  {/* Summary Section */}
                  <tr className="border-b border-black  h-7 text-sm">
                    <td colSpan={5} className="px-16 text-left">
                      Total
                    </td>
                    <td colSpan={2} className="px-3 text-right font-semibold">
                      $ {invoice.totalInvoiceValue?.toFixed(0) || "0000"}
                    </td>
                  </tr>

                  <tr className="text-sm  text-gray-900 border-b border-black h-7">
                    <td colSpan={4}></td>
                    <td className="py-1 text-center font-bold">IGST</td>
                    <td className="py-1 text-center font-bold whitespace-nowrap">Rate</td>
                    <td className="py-1 text-center font-bold pr-6">Amount</td>
                  </tr>

                  <tr className="text-sm  text-gray-700 border-b border-black h-7">
                    <td colSpan={4}></td>
                    <td className="py-1 text-center">IGST</td>
                    <td className="py-1 text-center">-</td>
                    <td className="py-1 text-center pr-6">-</td>
                  </tr>

                  <tr className="text-sm  text-gray-900 border-b border-black h-7">
                    <td colSpan={4}></td>
                    <td className="py-1 text-center font-bold">Total GST</td>
                    <td className="py-1 text-center">-</td>
                    <td className="py-1 text-center pr-6">-</td>
                  </tr>

                  <tr className=" h-7 text-[13px] border-b border-black">
                    <td colSpan={5} className="px-3 text-left">
                      Total Invoice Value (in Figures)
                    </td>
                    <td colSpan={2} className="px-3 text-right text-sm whitespace-nowrap">
                      $ {invoice.totalInvoiceValue?.toFixed(2) || "0000.00"}
                    </td>
                  </tr>

                  <tr className="border-b border-black">
                    <td colSpan={7} className="px-3 py-1">
                      <div className="flex gap-2 text-[12px] items-center">
                        <span className="">
                          Total Invoice Value (in Words):
                        </span>
                        <span className=" uppercase tracking-tight text-gray-700">
                          {invoice.totalInvoiceValueInWords || "—"}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Instructions */}
            <div className="mb-3">
              <h4 className="text-green-600  text-[12px] mb-1 tracking-tight">
                Instructions
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed border border-green-500/20 p-2 mb-1 rounded-lg bg-green-50/30">
                Consulting Proforma Invoice for Steel Detailing of{" "}
                {invoice.jobName} - {invoice.fabricator?.fabName} P.O. #{" "}
                {invoice.project?.projectNumber || invoice.project?.projectCode || ""}
              </p>
              <p className="text-xs text-black">
                All payments to be made to{" "}
                <span className=" uppercase">Whiteboard Technologies LLC</span>{" "}
                in {invoice?.currencyType} Dollars via Wire Transfers within 15 days.
              </p>
            </div>

            {/* Signature Area at Base */}
            <div className="mt-auto flex flex-col items-center pr-10 self-end">
              <p className="text-[#6bbd45] font-semibold text-[13px] mb-8 text-center">
                Thank you for your business!
              </p>
              <div className="text-center w-[280px]">
                <p className="text-[12px] font-bold text-gray-900 mb-10">
                  For Whiteboard Technologies Pvt Ltd
                </p>
                <div className="border-t border-[#6bbd45]/20 w-full pt-1">
                  <p className="text-[10px] font-bold text-black uppercase tracking-wider">
                    Authorised signatory
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Footer */}
            <div className="mt-12 pt-8 flex justify-between text-[12px] text-gray-500">
              <div className="flex-1">
                <p className="mb-4 text-gray-700 font-normal">
                  For any questions please contact Raj:
                </p>
                <div className="flex gap-16">
                  <div className="flex flex-col items-start justify-start gap-1">
                    <span className="uppercase  text-[12px]">
                      {" "}
                      <span className="text-[#6bbd45] ">Tel:</span> USA: +1
                      612.605.5833
                    </span>
                    <span className="uppercase  text-[12px]">
                      INDIA: +1 770.256.6888
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[#6bbd45] uppercase  text-[12px]">
                      Email:{" "}
                      <span className="text-gray-500 normal-case font-medium">
                        raj@whiteboardtec.com
                      </span>
                    </span>
                    <span className="text-[#6bbd45] uppercase  text-[12px]">
                      Web:{" "}
                      <span className="text-gray-500 normal-case font-medium">
                        www.whiteboardtec.com
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page 2: Bank Info */}
          <div className="w-[210mm] min-h-[297mm] bg-white p-[20mm] pt-[15mm] relative flex flex-col shrink-0 overflow-visible box-border border-t-10 border-gray-50 print-page">
            {/* Header Letterhead */}
            <div className="flex justify-between items-center mb-5">
              <div>
                <h1
                  className="text-[28px] font-medium text-[#6bbd45] mb-2 leading-none"
                  style={{ fontFamily: "serif", marginTop: 8 }}
                >
                  Whiteboard Technologies LLC
                </h1>
              </div>
              {/* Ensure logo height is proportional */}
              <img src={logo} alt="Logo" className="h-25 object-contain" />
            </div>
            <div className="h-px bg-[#6bbd45] w-full mb-3"></div>
           <p className="mb-10 text-[14px] leading-relaxed text-gray-700">
              Please initiate the ACH/Wire Transfer in{" "}
              <span className="">{invoice?.currencyType}</span> currency from your local
              Bank with the following information:
            </p>

            <h3 className=" text-[15px] text-gray-800 mb-10">
              ACH / Domestic Wire instructions:
            </h3>

            {invoice?.fabricator?.bankAccount ? (
              <div className="grid grid-cols-[250px_1fr] gap-y-10 text-[14px] text-gray-700">
                <span className="">ABA/Routing number:</span>
                <span className="font-medium text-gray-900">
                  {invoice.fabricator.bankAccount.abaRoutingNumber || "—"}
                </span>

                <span className="">Account number:</span>
                <span className="font-medium text-gray-900">
                  {invoice.fabricator.bankAccount.accountNumber || "—"}
                </span>

                <span className="">Account type:</span>
                <span className="text-gray-900">
                  {invoice.fabricator.bankAccount.accountType || "—"}
                </span>

                <span className="">Recipient / beneficiary information*:</span>
                <span className="text-gray-900">
                  {invoice.fabricator.bankAccount.accountName ||
                    "Whiteboard Technologies LLC."}
                </span>

                <span className="">Beneficiary address:</span>
                <span className="text-gray-900 whitespace-pre-wrap leading-snug">
                  {invoice.fabricator.bankAccount.beneficiaryAddress || "—"}
                </span>

                <span className="">Bank information:</span>
                <span className="text-gray-900">
                  {invoice.fabricator.bankAccount.bankName || "—"}
                </span>

                <span className="">Bank Address:</span>
                <span className="text-gray-900 whitespace-pre-wrap leading-snug">
                  {invoice.fabricator.bankAccount.bankAddress || "—"}
                </span>
              </div>
            ) : (
              <div className="bg-red-50 p-8 rounded text-center">
                <p className="text-red-500 ">
                  No bank account information attached to this invoice.
                </p>
              </div>
            )}

            <p className="mt-12 text-[12px] text-gray-600 font-normal">
              *Use this name as the recipient's name of the wire.
            </p>

            {/* Contact Footer Page 2 */}
            <div className="mt-auto pt-8 flex justify-between text-[10px] text-gray-500">
              <div className="flex-1">
                <p className="mb-4 text-gray-700 font-normal text-[12px]">
                  For any questions please contact Raj:
                </p>
                <div className="flex gap-16">
                  <div className="flex flex-col items-start justify-start gap-1">
                    <span className="uppercase  text-[12px]">
                      {" "}
                      <span className="text-[#6bbd45] ">Tel:</span> USA: +1
                      612.605.5833
                    </span>
                    <span className="uppercase  text-[12px]">
                      INDIA: +1 770.256.6888
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[#6bbd45] uppercase  text-[12px]">
                      Email:{" "}
                      <span className="text-gray-500 normal-case font-medium">
                        raj@whiteboardtec.com
                      </span>
                    </span>
                    <span className="text-[#6bbd45] uppercase  text-[12px]">
                      Web:{" "}
                      <span className="text-gray-500 normal-case font-medium">
                        www.whiteboardtec.com
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GetInvoiceById;
