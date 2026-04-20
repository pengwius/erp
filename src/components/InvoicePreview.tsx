import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";
import { FileText, Download } from "lucide-react";

type InvoicePreviewProps = {
  invoice: any;
  onClose?: () => void;
};

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    const content = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoice_number}</title>
            <style>
              body { font-family: sans-serif; padding: 20px; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f9f9f9; }
              .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
              .company-details { margin-bottom: 20px; }
              .totals { margin-top: 20px; text-align: right; }
              .total-row { font-weight: bold; font-size: 1.2em; }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleDownloadXml = async () => {
    try {
      const xml: string = await invoke("cmd_generate_invoice_xml", {
        id: invoice.id,
      });
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeNumber = invoice.invoice_number.replace(/\//g, "_");
      a.download = `${safeNumber || "invoice"}_${invoice.id}.xml`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to generate XML", e);
      alert(String(e));
    }
  };

  if (!invoice) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 text-foreground rounded-md">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">Invoice Preview</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <FileText className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="default" onClick={handleDownloadXml}>
            <Download className="w-4 h-4 mr-2" />
            Download XML
          </Button>
        </div>
      </div>

      <div className="p-8 overflow-y-auto" ref={printRef}>
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              INVOICE
            </h1>
            <p className="text-gray-500">#{invoice.invoice_number}</p>
          </div>
          <div className="text-right text-gray-600 dark:text-gray-300">
            <p>
              <strong>Issue Date:</strong> {invoice.issue_date || "-"}
            </p>
            <p>
              <strong>Sale Date:</strong> {invoice.sale_date || "-"}
            </p>
            <p>
              <strong>Due Date:</strong> {invoice.due_date || "-"}
            </p>
          </div>
        </div>

        <div className="flex justify-between mb-10 text-sm">
          <div className="w-1/2 pr-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-1 mb-2">
              Seller
            </h3>
            <p className="font-bold">{invoice.seller_name}</p>
            {invoice.seller_nip && <p>NIP: {invoice.seller_nip}</p>}
            <p>
              {invoice.seller_street} {invoice.seller_building_number}
            </p>
            <p>
              {invoice.seller_postal_code} {invoice.seller_city}
            </p>
            <p>{invoice.seller_country}</p>
          </div>
          <div className="w-1/2 pl-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-1 mb-2">
              Buyer
            </h3>
            <p className="font-bold">{invoice.buyer_name}</p>
            {invoice.buyer_nip && <p>NIP: {invoice.buyer_nip}</p>}
            <p>
              {invoice.buyer_street} {invoice.buyer_building_number}
            </p>
            <p>
              {invoice.buyer_postal_code} {invoice.buyer_city}
            </p>
            <p>{invoice.buyer_country}</p>
          </div>
        </div>

        <table className="w-full text-left text-sm mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-2">Item</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Unit</th>
              <th className="py-2">Net Price</th>
              <th className="py-2">Tax Rate</th>
              <th className="py-2 text-right">Net Value</th>
              <th className="py-2 text-right">Gross Value</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.lines || []).map((line: any, idx: number) => {
              const netValue =
                parseFloat(line.net_price || "0") *
                parseFloat(line.quantity || "0");
              const taxRate = parseFloat(line.tax_rate || "0") / 100;
              const grossValue = netValue * (1 + taxRate);

              return (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2">{line.name}</td>
                  <td className="py-2">{line.quantity}</td>
                  <td className="py-2">{line.unit || "szt"}</td>
                  <td className="py-2">
                    {line.net_price} {invoice.currency}
                  </td>
                  <td className="py-2">{line.tax_rate}%</td>
                  <td className="py-2 text-right">
                    {netValue.toFixed(2)} {invoice.currency}
                  </td>
                  <td className="py-2 text-right">
                    {grossValue.toFixed(2)} {invoice.currency}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-64 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-gray-600 dark:text-gray-400">
                Net Amount:
              </span>
              <span className="font-medium">
                {invoice.net_amount || "0.00"} {invoice.currency}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200 mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                Tax Amount:
              </span>
              <span className="font-medium">
                {invoice.tax_amount || "0.00"} {invoice.currency}
              </span>
            </div>
            <div className="flex justify-between py-1 text-lg font-bold">
              <span>Total:</span>
              <span>
                {invoice.gross_amount || "0.00"} {invoice.currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
