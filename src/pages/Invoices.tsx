import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import InputField from "../components/InputField";
import SoftPrimaryButton, { GhostButton } from "../components/PrimaryButton";

type Invoice = {
  id: number;
  issuer_company_id: number;
  invoice_number: string;
  invoice_type: string;
  issue_date: string;
  currency: string;
  seller_name: string;
  buyer_name: string;
  net_amount?: string | null;
  tax_amount?: string | null;
  gross_amount?: string | null;
  created_at?: string;
};

type Company = {
  id: number;
  name: string;
};

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [issuerCompanyId, setIssuerCompanyId] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [currency, setCurrency] = useState("PLN");
  const [sellerName, setSellerName] = useState("");
  const [sellerNip, setSellerNip] = useState("");
  const [sellerStreet, setSellerStreet] = useState("");
  const [sellerBuildingNumber, setSellerBuildingNumber] = useState("");
  const [sellerCity, setSellerCity] = useState("");
  const [sellerPostalCode, setSellerPostalCode] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerNip, setBuyerNip] = useState("");
  const [lineName, setLineName] = useState("Product");
  const [lineQuantity, setLineQuantity] = useState("1");
  const [lineNetPrice, setLineNetPrice] = useState("0.00");
  const [lineTaxRate, setLineTaxRate] = useState("23");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCompanies() {
    try {
      const res: Company[] = await invoke("cmd_list_companies");
      setCompanies(res);
      if (res.length > 0 && issuerCompanyId === null) {
        setIssuerCompanyId(res[0].id);
      }
    } catch (e) {
      console.error("Failed to load companies", e);
    }
  }

  async function loadInvoices() {
    setLoading(true);
    try {
      const res: Invoice[] = await invoke("cmd_list_invoices", { limit: 100 });
      setInvoices(res);
    } catch (e) {
      console.error("Failed to load invoices", e);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateInvoice() {
    setError(null);
    if (!issuerCompanyId) {
      setError("Choose issuer company");
      return;
    }
    if (!invoiceNumber.trim()) {
      setError("Invoice number is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        issuer_company_id: issuerCompanyId,
        seller_company_id: null,
        buyer_company_id: null,
        invoice_number: invoiceNumber,
        invoice_type: "fa_3",
        issue_date: issueDate,
        sale_date: null,
        due_date: null,
        currency,
        seller_name:
          sellerName ||
          (companies.find((c) => c.id === issuerCompanyId)?.name ?? ""),
        seller_nip: sellerNip || null,
        seller_country: "PL",
        seller_street: sellerStreet || "",
        seller_building_number: sellerBuildingNumber || "",
        seller_flat_number: null,
        seller_city: sellerCity || "",
        seller_postal_code: sellerPostalCode || "",
        buyer_name: buyerName || "Unknown",
        buyer_nip: buyerNip || null,
        buyer_country: "PL",
        buyer_street: null,
        buyer_building_number: null,
        buyer_flat_number: null,
        buyer_city: null,
        buyer_postal_code: null,
        net_amount: null,
        tax_amount: null,
        gross_amount: null,
        lines: [
          {
            name: lineName,
            unit: "szt",
            quantity: lineQuantity,
            net_price: lineNetPrice,
            tax_rate: lineTaxRate,
          },
        ],
      };

      await invoke("cmd_create_invoice", { payload });
      await loadInvoices();
      resetForm();
      setShowCreate(false);
    } catch (e) {
      console.error("Create invoice failed", e);
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setInvoiceNumber("");
    setIssueDate(new Date().toISOString().slice(0, 10));
    setCurrency("PLN");
    setSellerName("");
    setSellerNip("");
    setSellerStreet("");
    setSellerBuildingNumber("");
    setSellerCity("");
    setSellerPostalCode("");
    setBuyerName("");
    setBuyerNip("");
    setLineName("Product");
    setLineQuantity("1");
    setLineNetPrice("0.00");
    setLineTaxRate("23");
    setError(null);
  }

  async function handleGenerateXml(inv: Invoice) {
    try {
      const xml: string = await invoke("cmd_generate_invoice_xml", {
        id: inv.id,
      });
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeNumber = inv.invoice_number.replace(/\//g, "_");
      a.download = `${safeNumber || "invoice"}_${inv.id}.xml`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to generate XML", e);
      setError(String(e));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <div className="flex items-center gap-3">
          <GhostButton onClick={() => loadInvoices()}>Refresh</GhostButton>
          <SoftPrimaryButton onClick={() => setShowCreate(true)}>
            New Invoice
          </SoftPrimaryButton>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
          <div className="flex-1">
            <label>{error}</label>
          </div>
        </div>
      )}

      {showCreate && (
        <Card className="p-4 bg-muted/50 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Issuer company</span>
              </label>
              <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={issuerCompanyId ?? ""}
                onChange={(e) => setIssuerCompanyId(Number(e.target.value))}
              >
                <option value="">Select issuer</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <InputField
              label="Invoice number"
              value={invoiceNumber}
              onChange={setInvoiceNumber}
              placeholder="FV/2026/0001"
              required
            />

            <InputField
              label="Issue date"
              value={issueDate}
              onChange={setIssueDate}
              placeholder="YYYY-MM-DD"
            />
            <InputField
              label="Currency"
              value={currency}
              onChange={setCurrency}
            />

            <InputField
              label="Seller name"
              value={sellerName}
              onChange={setSellerName}
            />
            <InputField
              label="Seller NIP"
              value={sellerNip}
              onChange={setSellerNip}
            />
            <InputField
              label="Seller street"
              value={sellerStreet}
              onChange={setSellerStreet}
            />
            <InputField
              label="Seller building number"
              value={sellerBuildingNumber}
              onChange={setSellerBuildingNumber}
            />
            <InputField
              label="Seller city"
              value={sellerCity}
              onChange={setSellerCity}
            />
            <InputField
              label="Seller postal code"
              value={sellerPostalCode}
              onChange={setSellerPostalCode}
            />

            <InputField
              label="Buyer name"
              value={buyerName}
              onChange={setBuyerName}
            />
            <InputField
              label="Buyer NIP"
              value={buyerNip}
              onChange={setBuyerNip}
            />
          </div>

          <div className="pt-4">
            <h3 className="font-medium">Line (single, add more later)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-2">
              <InputField
                label="Name"
                value={lineName}
                onChange={setLineName}
              />
              <InputField
                label="Quantity"
                value={lineQuantity}
                onChange={setLineQuantity}
              />
              <InputField
                label="Net price"
                value={lineNetPrice}
                onChange={setLineNetPrice}
              />
              <InputField
                label="Tax rate"
                value={lineTaxRate}
                onChange={setLineTaxRate}
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <GhostButton
              onClick={() => {
                setShowCreate(false);
                resetForm();
              }}
            >
              Cancel
            </GhostButton>
            <SoftPrimaryButton
              onClick={handleCreateInvoice}
              disabled={submitting}
              iconPosition="right"
            >
              {submitting ? "Creating..." : "Create invoice"}
            </SoftPrimaryButton>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Issue date</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No invoices yet.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.id}</TableCell>
                    <TableCell>{inv.invoice_number}</TableCell>
                    <TableCell>{inv.issue_date}</TableCell>
                    <TableCell>{inv.seller_name}</TableCell>
                    <TableCell>{inv.buyer_name}</TableCell>
                    <TableCell>{inv.gross_amount ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm"
                          onClick={() => {
                            handleGenerateXml(inv);
                          }}
                        >
                          XML
                        </Button>
                        <Button variant="outline" size="sm"
                          onClick={async () => {
                            try {
                              const full = await invoke("cmd_get_invoice", {
                                id: inv.id,
                              });
                              alert(JSON.stringify(full, null, 2));
                            } catch (e) {
                              console.error(e);
                              setError(String(e));
                            }
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Invoices;
