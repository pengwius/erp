import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import SoftPrimaryButton from "@/components/PrimaryButton";
import { useCompanies } from "@/hooks/useCompanies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Warehouse {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  is_service: number;
}

interface LineItem {
  product_id: string;
  quantity: string;
  purchase_price: string;
}

export default function StockDocumentForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeCompanyId: selectedCompany } = useCompanies();

  const [documentType, setDocumentType] = useState<string>("PZ");
  const [documentNumber, setDocumentNumber] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [sourceWarehouseId, setSourceWarehouseId] = useState<string>("");
  const [targetWarehouseId, setTargetWarehouseId] = useState<string>("");

  const [lines, setLines] = useState<LineItem[]>([
    { product_id: "", quantity: "1", purchase_price: "" },
  ]);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedCompany) return;

    invoke<Warehouse[]>("cmd_get_warehouses", { companyId: selectedCompany })
      .then(setWarehouses)
      .catch((err) => console.error("Failed to load warehouses", err));

    invoke<Product[]>("cmd_list_products", { companyId: selectedCompany })
      .then((data) => setProducts(data.filter((p) => !p.is_service)))
      .catch((err) => console.error("Failed to load products", err));
  }, [selectedCompany]);

  const handleAddLine = () => {
    setLines([...lines, { product_id: "", quantity: "1", purchase_price: "" }]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (
    index: number,
    field: keyof LineItem,
    value: string,
  ) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    if (documentType === "WZ" || documentType === "MM") {
      if (!sourceWarehouseId) {
        alert(
          t(
            "stock_documents.error_source_warehouse_required",
            "Source warehouse is required for WZ and MM",
          ),
        );
        return;
      }
    }
    if (documentType === "PZ" || documentType === "MM") {
      if (!targetWarehouseId) {
        alert(
          t(
            "stock_documents.error_target_warehouse_required",
            "Target warehouse is required for PZ and MM",
          ),
        );
        return;
      }
    }

    if (lines.length === 0 || lines.some((l) => !l.product_id || !l.quantity)) {
      alert(
        t(
          "stock_documents.error_lines_required",
          "At least one product with quantity is required",
        ),
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        company_id: selectedCompany,
        document_type: documentType,
        document_number: documentNumber,
        source_warehouse_id: sourceWarehouseId
          ? parseInt(sourceWarehouseId)
          : null,
        target_warehouse_id: targetWarehouseId
          ? parseInt(targetWarehouseId)
          : null,
        issue_date: new Date(issueDate).toISOString(),
        created_at: new Date().toISOString(),
        lines: lines.map((l) => ({
          product_id: parseInt(l.product_id),
          quantity: l.quantity,
          purchase_price: l.purchase_price ? l.purchase_price : null,
        })),
      };

      await invoke("cmd_create_stock_document", { payload });
      navigate("/stock-documents");
    } catch (err) {
      console.error("Failed to create document", err);
      alert(t("common.error", "An error occurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/stock-documents")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">
          {t("stock_documents.create", "Create Stock Document")}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t("stock_documents.document_type", "Type")}</Label>
              <Select
                value={documentType}
                onValueChange={(val) => {
                  setDocumentType(val);
                  if (val === "PZ") setSourceWarehouseId("");
                  if (val === "WZ") setTargetWarehouseId("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t(
                      "stock_documents.select_type",
                      "Select type",
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PZ">
                    {t("stock_documents.type_pz", "PZ (Przyjęcie Zewnętrzne)")}
                  </SelectItem>
                  <SelectItem value="WZ">
                    {t("stock_documents.type_wz", "WZ (Wydanie Zewnętrzne)")}
                  </SelectItem>
                  <SelectItem value="MM">
                    {t(
                      "stock_documents.type_mm",
                      "MM (Przesunięcie Międzymagazynowe)",
                    )}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("stock_documents.document_number", "Number")}</Label>
              <Input
                required
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder={t(
                  "stock_documents.number_placeholder",
                  "e.g. PZ/2023/10/01",
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("stock_documents.issue_date", "Date")}</Label>
              <Input
                required
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>

            <div className="hidden md:block"></div>

            {(documentType === "WZ" || documentType === "MM") && (
              <div className="space-y-2">
                <Label>
                  {t("stock_documents.source_warehouse", "Source Warehouse")} *
                </Label>
                <Select
                  required
                  value={sourceWarehouseId}
                  onValueChange={(val) => setSourceWarehouseId(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t(
                        "stock_documents.select_warehouse",
                        "Select warehouse",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id.toString()}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(documentType === "PZ" || documentType === "MM") && (
              <div className="space-y-2">
                <Label>
                  {t("stock_documents.target_warehouse", "Target Warehouse")} *
                </Label>
                <Select
                  required
                  value={targetWarehouseId}
                  onValueChange={(val) => setTargetWarehouseId(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t(
                        "stock_documents.select_warehouse",
                        "Select warehouse",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id.toString()}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              {t("stock_documents.products", "Products")}
            </h2>
          </div>

          <div className="space-y-4">
            {lines.map((line, index) => (
              <div
                key={index}
                className="flex items-end gap-4 p-4 border rounded-lg bg-muted/20"
              >
                <div className="flex-1 space-y-2">
                  <Label>{t("common.product", "Product")}</Label>
                  <Select
                    value={line.product_id}
                    onValueChange={(val) =>
                      handleLineChange(index, "product_id", val)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t(
                          "common.select_product",
                          "Select product",
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24 space-y-2">
                  <Label>{t("common.quantity", "Quantity")}</Label>
                  <Input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={line.quantity}
                    onChange={(e) =>
                      handleLineChange(index, "quantity", e.target.value)
                    }
                  />
                </div>

                <div className="w-32 space-y-2">
                  <Label>
                    {t("common.price", "Price")} (
                    {t("common.optional", "Optional")})
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.purchase_price}
                    onChange={(e) =>
                      handleLineChange(index, "purchase_price", e.target.value)
                    }
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveLine(index)}
                  disabled={lines.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleAddLine}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("stock_documents.add_line", "Add Product")}
          </Button>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/stock-documents")}
          >
            {t("common.cancel", "Cancel")}
          </Button>
          <SoftPrimaryButton type="submit" disabled={isSubmitting}>
            {t("common.save", "Save")}
          </SoftPrimaryButton>
        </div>
      </form>
    </div>
  );
}
