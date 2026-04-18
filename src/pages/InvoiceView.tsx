import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile, writeFile } from "@tauri-apps/plugin-fs";
import html2pdf from "html2pdf.js";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, FileText, Loader2 } from "lucide-react";

export const InvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const printRef = useRef<HTMLDivElement>(null);

  const [invoice, setInvoice] = useState<any>(null);
  const [lines, setLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      if (!id) return;
      try {
        setLoading(true);
        const [invData, invLines] = await invoke<[any, any[]]>(
          "cmd_get_invoice",
          {
            id: parseInt(id, 10),
          },
        );
        setInvoice(invData);
        setLines(invLines || []);
      } catch (e) {
        console.error("Failed to load invoice", e);
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    loadInvoice();
  }, [id]);

  const handlePrint = async () => {
    if (!printRef.current || !invoice) return;

    try {
      const safeNumber = invoice.invoice_number.replace(/\//g, "_");
      const defaultPath = `${safeNumber || "invoice"}_${invoice.id}.pdf`;

      const filePath = await save({
        filters: [{ name: "PDF", extensions: ["pdf"] }],
        defaultPath,
      });

      if (!filePath) return;

      const opt = {
        margin: 10,
        filename: defaultPath,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          onclone: (doc: any) => {
            const elements = doc.querySelectorAll(
              'style, link[rel="stylesheet"]',
            );
            elements.forEach((el: any) => el.remove());

            const safeStyle = doc.createElement("style");
            safeStyle.innerHTML = `
              * { box-sizing: border-box; }
              body { font-family: ui-sans-serif, system-ui, sans-serif; padding: 20px; color: #000; line-height: 1.5; background-color: #fff; font-size: 12px; }
              .flex { display: flex; } .justify-between { justify-content: space-between; } .justify-end { justify-content: flex-end; } .items-start { align-items: flex-start; }
              .mb-12 { margin-bottom: 3rem; } .mb-8 { margin-bottom: 2rem; } .mb-6 { margin-bottom: 1.5rem; } .mb-4 { margin-bottom: 1rem; } .mb-2 { margin-bottom: 0.5rem; }
              .mt-24 { margin-top: 6rem; } .mt-4 { margin-top: 1rem; } .mt-2 { margin-top: 0.5rem; } .mt-1 { margin-top: 0.25rem; }
              .pb-2 { padding-bottom: 0.5rem; } .pb-1 { padding-bottom: 0.25rem; } .pt-8 { padding-top: 2rem; } .pt-2 { padding-top: 0.5rem; }
              .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; } .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; } .pr-4 { padding-right: 1rem; }
              .text-right { text-align: right; } .text-center { text-align: center; } .text-left { text-align: left; }
              .w-full { width: 100%; } .w-1\\/2 { width: 50%; } .w-64 { width: 16rem; } .w-12 { width: 3rem; } .w-16 { width: 4rem; } .w-20 { width: 5rem; } .w-24 { width: 6rem; } .w-28 { width: 7rem; }
              .font-bold { font-weight: 700; } .font-semibold { font-weight: 600; } .font-medium { font-weight: 500; } .font-normal { font-weight: 400; }
              .text-3xl { font-size: 1.875rem; line-height: 2.25rem; } .text-xl { font-size: 1.25rem; line-height: 1.75rem; } .text-base { font-size: 1rem; line-height: 1.5rem; } .text-sm { font-size: 0.875rem; line-height: 1.25rem; } .text-xs { font-size: 0.75rem; line-height: 1rem; }
              .text-zinc-500, .text-gray-500, .text-zinc-600 { color: #52525b; } .text-zinc-900, .text-black { color: #000; }
              .bg-zinc-50, .bg-zinc-100 { background-color: #f4f4f5; }
              .border { border: 1px solid #d4d4d8; } .border-t { border-top: 1px solid #d4d4d8; } .border-b { border-bottom: 1px solid #d4d4d8; } .border-l { border-left: 1px solid #d4d4d8; } .border-r { border-right: 1px solid #d4d4d8; }
              .border-zinc-300 { border-color: #d4d4d8; } .border-zinc-400 { border-color: #a1a1aa; }
              .uppercase { text-transform: uppercase; } .tracking-widest { letter-spacing: 0.1em; }
              table { width: 100%; border-collapse: collapse; } th, td { padding: 8px; } th { font-weight: 600; }
              .gap-8 { gap: 2rem; }
            `;
            doc.head.appendChild(safeStyle);
          },
        },
        jsPDF: {
          unit: "mm" as const,
          format: "a4" as const,
          orientation: "portrait" as const,
        },
      };

      const pdfOutput = await html2pdf()
        .set(opt)
        .from(printRef.current)
        .outputPdf("arraybuffer");

      await writeFile(filePath, new Uint8Array(pdfOutput));
    } catch (e) {
      console.error("Failed to generate PDF", e);
    }
  };

  const handleDownloadXml = async () => {
    if (!invoice) return;
    try {
      const xml: string = await invoke("cmd_generate_invoice_xml", {
        id: invoice.id,
      });
      const safeNumber = invoice.invoice_number.replace(/\//g, "_");
      const defaultPath = `${safeNumber || "invoice"}_${invoice.id}.xml`;

      const filePath = await save({
        filters: [{ name: "XML", extensions: ["xml"] }],
        defaultPath,
      });

      if (!filePath) return;
      await writeTextFile(filePath, xml);
    } catch (e) {
      console.error("Failed to generate XML", e);
      alert(String(e));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">
          Error loading invoice
        </h2>
        <p className="text-muted-foreground mb-6">
          {error || "Invoice not found"}
        </p>
        <Button onClick={() => navigate("/invoices")}>Back to Invoices</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto py-8 px-4 flex flex-col gap-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
        <Button variant="ghost" onClick={() => navigate("/invoices")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print / PDF
          </Button>
          <Button onClick={handleDownloadXml}>
            <FileText className="w-4 h-4 mr-2" />
            Download XML
          </Button>
        </div>
      </div>

      {/* Invoice */}
      <div className="bg-white text-zinc-900 rounded-xl shadow-md border border-border overflow-hidden">
        <div className="p-8 sm:p-12 text-sm" ref={printRef}>
          {/* Top Dates */}
          <div className="flex justify-end mb-8">
            <table className="text-right text-sm">
              <tbody>
                <tr>
                  <td className="pr-4 text-zinc-600">Miejsce wystawienia:</td>
                  <td className="font-medium">{invoice.seller_city || "-"}</td>
                </tr>
                <tr>
                  <td className="pr-4 text-zinc-600">Data wystawienia:</td>
                  <td className="font-medium">{invoice.issue_date || "-"}</td>
                </tr>
                <tr>
                  <td className="pr-4 text-zinc-600">Data sprzedaży:</td>
                  <td className="font-medium">
                    {invoice.sale_date || invoice.issue_date || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold uppercase tracking-widest text-black">
              FAKTURA VAT
            </h1>
            <p className="text-xl mt-1 font-medium">
              NR {invoice.invoice_number}
            </p>
          </div>

          {/* Parties */}
          <div className="flex justify-between mb-12 gap-8">
            <div className="w-1/2">
              <h3 className="font-bold text-base mb-2 border-b border-zinc-300 pb-1 uppercase">
                Sprzedawca
              </h3>
              <p className="font-bold text-base mb-1">{invoice.seller_name}</p>
              {invoice.seller_nip && (
                <p className="mb-1">
                  NIP: <span className="font-medium">{invoice.seller_nip}</span>
                </p>
              )}
              <p>
                {invoice.seller_street} {invoice.seller_building_number}
                {invoice.seller_flat_number
                  ? `/${invoice.seller_flat_number}`
                  : ""}
              </p>
              <p>
                {invoice.seller_postal_code} {invoice.seller_city}
              </p>
              <p>{invoice.seller_country}</p>
            </div>
            <div className="w-1/2">
              <h3 className="font-bold text-base mb-2 border-b border-zinc-300 pb-1 uppercase">
                Nabywca
              </h3>
              <p className="font-bold text-base mb-1">{invoice.buyer_name}</p>
              {invoice.buyer_nip && (
                <p className="mb-1">
                  NIP: <span className="font-medium">{invoice.buyer_nip}</span>
                </p>
              )}
              <p>
                {invoice.buyer_street} {invoice.buyer_building_number}
                {invoice.buyer_flat_number
                  ? `/${invoice.buyer_flat_number}`
                  : ""}
              </p>
              <p>
                {invoice.buyer_postal_code} {invoice.buyer_city}
              </p>
              <p>{invoice.buyer_country}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-100 border border-zinc-300 text-xs uppercase text-zinc-700">
                  <th className="py-2 px-3 border-r border-zinc-300 text-center w-12">
                    Lp.
                  </th>
                  <th className="py-2 px-3 border-r border-zinc-300">
                    Nazwa towaru / usługi
                  </th>
                  <th className="py-2 px-3 border-r border-zinc-300 text-center w-16">
                    Jm.
                  </th>
                  <th className="py-2 px-3 border-r border-zinc-300 text-right w-20">
                    Ilość
                  </th>
                  <th className="py-2 px-3 border-r border-zinc-300 text-right w-24">
                    Cena netto
                  </th>
                  <th className="py-2 px-3 border-r border-zinc-300 text-right w-28">
                    Wartość netto
                  </th>
                  <th className="py-2 px-3 border-r border-zinc-300 text-center w-16">
                    VAT
                  </th>
                  <th className="py-2 px-3 border-r border-zinc-300 text-right w-24">
                    Kwota VAT
                  </th>
                  <th className="py-2 px-3 text-right w-28">Wartość brutto</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => {
                  const netValue = parseFloat(line.line_net_total || "0");
                  const taxValue = parseFloat(line.line_tax_total || "0");
                  const grossValue = parseFloat(line.line_gross_total || "0");

                  return (
                    <tr
                      key={idx}
                      className="border-b border-l border-r border-zinc-300"
                    >
                      <td className="py-2 px-3 border-r border-zinc-300 text-center">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-zinc-300 font-medium">
                        {line.name}
                      </td>
                      <td className="py-2 px-3 border-r border-zinc-300 text-center text-zinc-600">
                        {line.measure_unit || "szt"}
                      </td>
                      <td className="py-2 px-3 border-r border-zinc-300 text-right">
                        {line.quantity}
                      </td>
                      <td className="py-2 px-3 border-r border-zinc-300 text-right">
                        {parseFloat(line.net_price || "0").toFixed(2)}
                      </td>
                      <td className="py-2 px-3 border-r border-zinc-300 text-right font-medium">
                        {netValue.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 border-r border-zinc-300 text-center text-zinc-600">
                        {line.tax_rate}%
                      </td>
                      <td className="py-2 px-3 border-r border-zinc-300 text-right text-zinc-600">
                        {taxValue.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-medium">
                        {grossValue.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end mb-12">
            <div className="w-1/2">
              <table className="w-full text-right text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-t border-l border-r border-zinc-300 bg-zinc-50">
                    <td className="py-2 px-3 border-r border-zinc-300 font-bold w-1/2 text-left uppercase text-xs text-zinc-700">
                      Razem:
                    </td>
                    <td className="py-2 px-3 border-r border-zinc-300 font-medium">
                      {invoice.net_amount || "0.00"}
                    </td>
                    <td className="py-2 px-3 border-r border-zinc-300 font-medium text-center text-zinc-500">
                      X
                    </td>
                    <td className="py-2 px-3 border-r border-zinc-300 font-medium">
                      {invoice.tax_amount || "0.00"}
                    </td>
                    <td className="py-2 px-3 font-bold">
                      {invoice.gross_amount || "0.00"}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-6 text-right">
                <p className="text-2xl mb-2">
                  <span className="text-zinc-600 text-base font-normal mr-2">
                    Do zapłaty:
                  </span>
                  <span className="font-bold">
                    {invoice.gross_amount || "0.00"} {invoice.currency}
                  </span>
                </p>
                {invoice.due_date && (
                  <p className="text-zinc-600 text-base">
                    Termin płatności:{" "}
                    <span className="font-semibold text-black">
                      {invoice.due_date}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-between mt-24 pt-8">
            <div className="w-64 border-t border-zinc-400 text-center pt-2">
              <p className="text-xs text-zinc-500">
                Imię, nazwisko i podpis osoby
                <br />
                upoważnionej do odbioru dokumentu
              </p>
            </div>
            <div className="w-64 border-t border-zinc-400 text-center pt-2">
              <p className="text-xs text-zinc-500">
                Imię, nazwisko i podpis osoby
                <br />
                upoważnionej do wystawienia dokumentu
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
