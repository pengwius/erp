import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import InputField from "../components/InputField";
import SoftPrimaryButton, { GhostButton } from "../components/PrimaryButton";

type Product = {
  id: number;
  company_id: number;
  is_service?: number | boolean;
  sku?: string | null;
  name: string;
  description?: string | null;
  unit?: string | null;
  vat_rate?: string | null;
  is_active?: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function Products() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("szt");
  const [vatRate, setVatRate] = useState("23");

  const [priceAmount, setPriceAmount] = useState("0.00");
  const [priceCurrency, setPriceCurrency] = useState("PLN");
  const [priceValidFrom, setPriceValidFrom] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const cs: any = await invoke("cmd_list_companies");
        if (Array.isArray(cs) && cs.length > 0) {
          setCompanies(cs);
          setSelectedCompany(cs[0].id);
          await loadProductsForCompany(cs[0].id);
        } else {
          setCompanies([]);
          await loadProductsForCompany(1);
        }
      } catch (e) {
        console.error("Failed to load companies (products page)", e);
        await loadProductsForCompany(1);
      }
    })();
  }, [refreshToggle]);

  async function loadProductsForCompany(companyId: number) {
    setLoading(true);
    try {
      const res: any = await invoke("cmd_list_products", {
        companyId,
        onlyActive: true,
        limit: 200,
      });
      if (Array.isArray(res)) {
        setProducts(res as Product[]);
      } else {
        setProducts([]);
      }
    } catch (e) {
      console.error("Failed to list products", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function resetFormFields() {
    setEditingProductId(null);
    setSku("");
    setName("");
    setDescription("");
    setUnit("szt");
    setVatRate("23");
    setPriceAmount("0.00");
    setPriceCurrency("PLN");
    setPriceValidFrom(new Date().toISOString().slice(0, 10));
    setError(null);
  }

  function handleEdit(productId: number) {
    const p = products.find((x) => x.id === productId);
    if (p?.is_service) {
      navigate(`/products/${productId}/edit/service`);
    } else {
      navigate(`/products/${productId}/edit`);
    }
  }

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) {
      setError(t("products.name_required"));
      return;
    }
    setSubmitting(true);
    try {
      const companyId = selectedCompany ?? 1;

      if (editingProductId) {
        const payload = {
          id: editingProductId,
          sku: sku || null,
          name,
          description: description || null,
          unit: unit || null,
          vat_rate: vatRate || null,
          is_active: 1,
        };
        await invoke("cmd_update_product", { payload });
        if (priceAmount && parseFloat(priceAmount) > 0) {
          const pricePayload = {
            product_id: editingProductId,
            currency: priceCurrency,
            price: priceAmount,
            valid_from: priceValidFrom,
            valid_to: null,
          };
          await invoke("cmd_create_product_price", { payload: pricePayload });
        }
      } else {
        const payload = {
          company_id: companyId,
          sku: sku || null,
          name,
          description: description || null,
          unit: unit || null,
          vat_rate: vatRate || null,
        };
        const created: any = await invoke("cmd_create_product", { payload });
        if (created && priceAmount && parseFloat(priceAmount) > 0) {
          const pricePayload = {
            product_id: (created as Product).id,
            currency: priceCurrency,
            price: priceAmount,
            valid_from: priceValidFrom,
            valid_to: null,
          };
          await invoke("cmd_create_product_price", { payload: pricePayload });
        }
      }

      setShowForm(false);
      resetFormFields();
      setRefreshToggle((t) => !t);
    } catch (e) {
      console.error("Failed to save product", e);
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(productId: number) {
    if (!confirm(t("products.delete_confirm"))) return;
    try {
      await invoke("cmd_delete_product", { id: productId });
      setRefreshToggle((t) => !t);
    } catch (e) {
      console.error("Failed to delete product", e);
      setError(String(e));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("products.title")}</h1>
        <div className="flex items-center gap-3">
          <SoftPrimaryButton
            onClick={() => {
              resetFormFields();
              navigate("/products/new");
            }}
          >
            {t("products.new_product")}
          </SoftPrimaryButton>
        </div>
      </div>

      <div style={{ display: "none" }}>{companies.length}</div>

      {showForm && (
        <Card className="p-4 bg-muted/50 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label={t("products.sku")}
              value={sku}
              onChange={setSku}
              inputClassName="bg-base-100"
              info={t("products.sku_tooltip")}
            />
            <InputField
              label={t("products.name")}
              value={name}
              onChange={setName}
              required
              inputClassName="bg-base-100"
            />
            <InputField
              label={t("products.unit")}
              value={unit}
              onChange={setUnit}
              inputClassName="bg-base-100"
            />
            <InputField
              label={t("products.vat_rate")}
              value={vatRate}
              onChange={setVatRate}
              inputClassName="bg-base-100"
            />
            <InputField
              label={t("products.description")}
              value={description}
              onChange={setDescription}
              inputClassName="bg-base-100"
            />
            <div>
              <label className="label">
                <span className="label-text">
                  {t("products.initial_price_optional")}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <InputField
                  label={t("products.amount")}
                  value={priceAmount}
                  onChange={setPriceAmount}
                  inputClassName="bg-base-100"
                />
                <InputField
                  label={t("products.currency")}
                  value={priceCurrency}
                  onChange={setPriceCurrency}
                  inputClassName="bg-base-100"
                />
                <InputField
                  type="date"
                  label={t("products.valid_from")}
                  value={priceValidFrom}
                  onChange={setPriceValidFrom}
                  inputClassName="bg-base-100"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <GhostButton
              onClick={() => {
                setShowForm(false);
                resetFormFields();
              }}
            >
              {t("common.cancel")}
            </GhostButton>
            <SoftPrimaryButton onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? t("common.saving")
                : editingProductId
                  ? t("products.save_changes")
                  : t("products.create_product")}
            </SoftPrimaryButton>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("products.id")}</TableHead>
                <TableHead>{t("products.sku")}</TableHead>
                <TableHead>{t("products.name")}</TableHead>
                <TableHead>{t("products.unit")}</TableHead>
                <TableHead>{t("products.vat_rate")}</TableHead>
                <TableHead>{t("products.created")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    {t("products.no_products")}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.sku ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        {p.is_service ? (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100/80 text-indigo-700 text-[10px] uppercase tracking-wider dark:bg-indigo-900/30 dark:text-indigo-400">
                            {t("products.type_service")}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] uppercase tracking-wider dark:bg-slate-800 dark:text-slate-400">
                            {t("products.type_product")}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{p.unit ?? "-"}</TableCell>
                    <TableCell>{p.vat_rate ?? "-"}</TableCell>
                    <TableCell>{p.created_at ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(p.id)}
                        >
                          {t("common.edit")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(p.id)}
                        >
                          {t("common.delete")}
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

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mt-4">
          <div className="flex-1">
            <label>{error}</label>
          </div>
        </div>
      )}
    </div>
  );
}
