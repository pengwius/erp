import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import InputField from "../components/InputField";
import SoftPrimaryButton, { GhostButton } from "../components/PrimaryButton";
import { Company } from "../types/company";

type Invoice = {
  id: number;
  issuer_company_id: number;
  invoice_number: string;
  invoice_type: string;
  document_type: string;
  issue_date: string;
  currency: string;
  seller_name: string;
  buyer_name: string;
  net_amount?: string | null;
  tax_amount?: string | null;
  gross_amount?: string | null;
  created_at?: string;
};

export const Invoices: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [issuerCompanyId, setIssuerCompanyId] = useState<number | null>(null);

  useEffect(() => {
    if (issuerCompanyId) {
      const company = companies.find((c) => c.id === issuerCompanyId);
      if (company) {
        setSellerName(company.name || "");
        setSellerNip(company.nip || "");
        setSellerStreet(company.street || "");
        setSellerBuildingNumber(company.building_number || "");
        setSellerCity(company.city || "");
        setSellerPostalCode(company.postal_code || "");
      }
    }
  }, [issuerCompanyId, companies]);

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
  const [warehouseId, setWarehouseId] = useState("");
  const [productId, setProductId] = useState("");
  const [lineName, setLineName] = useState("Product");
  const [lineQuantity, setLineQuantity] = useState("1");
  const [lineNetPrice, setLineNetPrice] = useState("0.00");
  const [lineTaxRate, setLineTaxRate] = useState("23");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"draft" | "issued">("draft");
  const [documentType, setDocumentType] = useState<"invoice" | "receipt">(
    "invoice",
  );
  const [saveNewCustomer, setSaveNewCustomer] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    loadCompanies();
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (issuerCompanyId) {
      loadWarehouses(issuerCompanyId);
      loadProducts(issuerCompanyId);
      loadCustomers(issuerCompanyId);
    }
  }, [issuerCompanyId]);

  async function loadWarehouses(companyId: number) {
    try {
      const res: any[] = await invoke("cmd_get_warehouses", { companyId });
      setWarehouses(res);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadCustomers(companyId: number) {
    try {
      const res: any[] = await invoke("cmd_list_customers", { companyId });
      setCustomers(res);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadProducts(companyId: number) {
    try {
      const res: any[] = await invoke("cmd_list_products", {
        companyId,
        onlyActive: true,
        limit: 1000,
      });
      setProducts(res);
    } catch (e) {
      console.error(e);
    }
  }

  function handleCustomerSelect(id: string) {
    if (!id || id === "none") {
      setBuyerName("");
      setBuyerNip("");
      return;
    }
    const c = customers.find((x) => x.id.toString() === id);
    if (c) {
      setBuyerName(c.name || "");
      setBuyerNip(c.nip || "");
    }
  }

  function handleProductSelect(id: string) {
    setProductId(id);
    if (!id || id === "none") return;
    const p = products.find((x) => x.id.toString() === id);
    if (p) {
      setLineName(p.name || "");
      setLineNetPrice(p.sale_price_net ? p.sale_price_net.toString() : "0.00");
      setLineTaxRate(p.vat_rate ? p.vat_rate.toString() : "23");
    }
  }

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
      setError(t("invoices.choose_issuer"));
      return;
    }
    if (!invoiceNumber.trim()) {
      setError(t("invoices.invoice_number_required"));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        issuer_company_id: issuerCompanyId,
        warehouse_id: warehouseId ? parseInt(warehouseId) : null,
        seller_company_id: null,
        buyer_company_id: null,
        invoice_number: invoiceNumber,
        invoice_type: "fa_3",
        document_type: documentType,
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
            product_id:
              productId && productId !== "none" ? parseInt(productId) : null,
            name: lineName,
            unit: "szt",
            quantity: lineQuantity,
            net_price: lineNetPrice,
            tax_rate: lineTaxRate,
          },
        ],
        status,
        save_new_customer: saveNewCustomer,
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
    setWarehouseId("");
    setProductId("");
    setLineName("Product");
    setLineQuantity("1");
    setLineNetPrice("0.00");
    setLineTaxRate("23");
    setError(null);
    setStatus("draft");
    setSaveNewCustomer(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("invoices.title")}</h1>
        <div className="flex items-center gap-3">
          <SoftPrimaryButton onClick={() => setShowCreate(true)}>
            {t("invoices.new_invoice")}
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
                <span className="label-text">
                  {t("invoices.issuer_company")}
                </span>
              </label>
              <Select
                value={issuerCompanyId?.toString() || ""}
                onValueChange={(val) => setIssuerCompanyId(Number(val))}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder={t("invoices.select_issuer")} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">
                  {t(
                    "invoices.warehouse",
                    "Magazyn (opcjonalnie) / Warehouse (optional)",
                  )}
                </span>
              </label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue
                    placeholder={t(
                      "invoices.select_warehouse",
                      "Select warehouse",
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t("common.none", "Brak")}
                  </SelectItem>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id.toString()}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <InputField
              label={t("invoices.invoice_number")}
              value={invoiceNumber}
              onChange={setInvoiceNumber}
              placeholder="FV/2026/0001"
              required
            />
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-foreground">
                Typ dokumentu
              </label>
              <Select
                value={documentType}
                onValueChange={(val: "invoice" | "receipt") =>
                  setDocumentType(val)
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Wybierz typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Faktura</SelectItem>
                  <SelectItem value="receipt">Paragon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <InputField
              label={t("invoices.issue_date")}
              value={issueDate}
              onChange={setIssueDate}
              placeholder="YYYY-MM-DD"
            />
            <InputField
              label={t("invoices.currency")}
              value={currency}
              onChange={setCurrency}
            />

            <InputField
              label={t("invoices.seller_name")}
              value={sellerName}
              onChange={setSellerName}
            />
            <InputField
              label={t("invoices.seller_nip")}
              value={sellerNip}
              onChange={setSellerNip}
            />
            <InputField
              label={t("invoices.seller_street")}
              value={sellerStreet}
              onChange={setSellerStreet}
            />
            <InputField
              label={t("invoices.seller_building_number")}
              value={sellerBuildingNumber}
              onChange={setSellerBuildingNumber}
            />
            <InputField
              label={t("invoices.seller_city")}
              value={sellerCity}
              onChange={setSellerCity}
            />
            <InputField
              label={t("invoices.seller_postal_code")}
              value={sellerPostalCode}
              onChange={setSellerPostalCode}
            />

            <div className="flex flex-col gap-2 col-span-1 md:col-span-2 border p-4 rounded-md">
              <h3 className="font-medium">Customer (Buyer)</h3>

              <div>
                <label className="label">
                  <span className="label-text">Select Existing Customer</span>
                </label>
                <Popover>
                  <PopoverTrigger className="flex w-full items-center justify-between h-10 font-normal border rounded-md px-3 text-sm">
                    {buyerName &&
                    !saveNewCustomer &&
                    customers.find((c) => c.name === buyerName)
                      ? customers.find((c) => c.name === buyerName)?.name
                      : "Choose customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search customer..." />
                      <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="none"
                            onSelect={() => {
                              handleCustomerSelect("none");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !buyerName ? "opacity-100" : "opacity-0",
                              )}
                            />
                            None / Custom
                          </CommandItem>
                          {customers.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={`${c.name} ${c.nip}`}
                              onSelect={() => {
                                handleCustomerSelect(c.id.toString());
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  buyerName === c.name
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {c.name} {c.nip ? `(${c.nip})` : ""}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label={t("invoices.buyer_name")}
                  value={buyerName}
                  onChange={setBuyerName}
                />
                <InputField
                  label={t("invoices.buyer_nip")}
                  value={buyerNip}
                  onChange={setBuyerNip}
                />
              </div>

              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="saveNewCustomer"
                  checked={saveNewCustomer}
                  onChange={(e) => setSaveNewCustomer(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="saveNewCustomer" className="text-sm">
                  Save this buyer as a new customer in the database
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="font-medium">{t("invoices.line_title")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-2 items-end">
              <div>
                <label className="label">
                  <span className="label-text">
                    {t("invoices.product", "Product")}
                  </span>
                </label>
                <Select value={productId} onValueChange={handleProductSelect}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue
                      placeholder={t(
                        "invoices.select_product",
                        "Select product",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t("common.none", "Brak / Custom")}
                    </SelectItem>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <InputField
                label={t("invoices.line_name")}
                value={lineName}
                onChange={setLineName}
              />
              <InputField
                label={t("invoices.line_quantity")}
                value={lineQuantity}
                onChange={setLineQuantity}
              />
              <InputField
                label={t("invoices.line_net_price")}
                value={lineNetPrice}
                onChange={setLineNetPrice}
              />
              <InputField
                label={t("invoices.line_tax_rate")}
                value={lineTaxRate}
                onChange={setLineTaxRate}
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <div>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as any)}
              >
                <SelectTrigger className="w-[150px] h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <GhostButton
              onClick={() => {
                setShowCreate(false);
                resetForm();
              }}
            >
              {t("common.cancel")}
            </GhostButton>
            <SoftPrimaryButton
              onClick={handleCreateInvoice}
              disabled={submitting}
              iconPosition="right"
            >
              {submitting
                ? t("invoices.creating")
                : t("invoices.create_invoice")}
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
                <TableHead>{t("invoices.number")}</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>{t("invoices.date", "Data")}</TableHead>
                <TableHead>{t("invoices.buyer")}</TableHead>
                <TableHead>{t("invoices.amount", "Kwota")}</TableHead>
                <TableHead>{t("invoices.actions", "Akcje")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    {t("invoices.no_invoices")}
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.id}</TableCell>
                    <TableCell>{inv.invoice_number}</TableCell>
                    <TableCell>
                      {inv.document_type === "receipt" ? "Paragon" : "Faktura"}
                    </TableCell>
                    <TableCell>{inv.issue_date}</TableCell>
                    <TableCell>{inv.buyer_name}</TableCell>
                    <TableCell>{inv.gross_amount ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                        >
                          {t("invoices.view")}
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
