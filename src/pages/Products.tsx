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
import InputField from "../components/InputField";
import SoftPrimaryButton, { GhostButton } from "../components/PrimaryButton";

type Product = {
  id: number;
  company_id: number;
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
        company_id: companyId,
        only_active: true,
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

  function openCreateForm() {
    resetFormFields();
    navigate("/products/new");
  }

  function handleEdit(productId: number) {
    navigate(`/products/${productId}/edit`);
  }

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) {
      setError("Product name is required");
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
    if (!confirm("Delete this product? This action cannot be undone.")) return;
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
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex items-center gap-3">
          <SoftPrimaryButton onClick={openCreateForm}>
            New Product
          </SoftPrimaryButton>
        </div>
      </div>

      <div style={{ display: "none" }}>{companies.length}</div>

      {showForm && (
        <Card className="p-4 bg-muted/50 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="SKU"
              value={sku}
              onChange={setSku}
              inputClassName="bg-base-100"
              info="Stock Keeping Unit (SKU) — optional identifier used to track items."
            />
            <InputField
              label="Name"
              value={name}
              onChange={setName}
              required
              inputClassName="bg-base-100"
            />
            <InputField
              label="Unit"
              value={unit}
              onChange={setUnit}
              inputClassName="bg-base-100"
            />
            <InputField
              label="VAT %"
              value={vatRate}
              onChange={setVatRate}
              inputClassName="bg-base-100"
            />
            <InputField
              label="Description"
              value={description}
              onChange={setDescription}
              inputClassName="bg-base-100"
            />
            <div>
              <label className="label">
                <span className="label-text">Initial price (optional)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <InputField
                  label="Amount"
                  value={priceAmount}
                  onChange={setPriceAmount}
                  inputClassName="bg-base-100"
                />
                <InputField
                  label="Currency"
                  value={priceCurrency}
                  onChange={setPriceCurrency}
                  inputClassName="bg-base-100"
                />
                <InputField
                  type="date"
                  label="Valid from"
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
              Cancel
            </GhostButton>
            <SoftPrimaryButton onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? "Saving..."
                : editingProductId
                  ? "Save changes"
                  : "Create product"}
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
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>VAT</TableHead>
                <TableHead>Created</TableHead>
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
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No products yet.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.sku ?? "-"}</TableCell>
                    <TableCell>{p.name}</TableCell>
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
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(p.id)}
                        >
                          Delete
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
