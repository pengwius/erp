import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import InputField from "../../components/InputField";
import SoftPrimaryButton, { GhostButton } from "../../components/PrimaryButton";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Loader2 } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

type ProductPayload = {
  company_id: number;
  sku?: string | null;
  ean?: string | null;
  name: string;
  category?: string | null;
  brand?: string | null;
  model?: string | null;

  vat_rate?: string | null;
  cn_code?: string | null;
  pkwiu?: string | null;
  gtu_code?: string | null;

  purchase_price_net?: string | null;
  sale_price_net?: string | null;
  sell_price_gross?: string | null;
  currency?: string | null;

  unit?: string | null;
  stock?: string | null;
  location?: string | null;
  weight_net?: string | null;
  weight_gross?: string | null;
  length?: string | null;
  width?: string | null;
  height?: string | null;

  short_description?: string | null;
  description?: string | null;
  images?: any[] | null;
  attributes?: Record<string, string> | null;

  is_service?: number | boolean;
  is_active?: number | boolean;
  expiry_date?: string | null;
  lot_number?: string | null;
  country_of_origin?: string | null;
};

import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

function AsyncImagePreview({
  src,
  index,
  onRemove,
}: {
  src: string;
  index: number;
  onRemove: (i: number) => void;
}) {
  const [imgSrc, setImgSrc] = useState<string>(src);

  useEffect(() => {
    if (
      src &&
      !src.startsWith("data:") &&
      !src.startsWith("http") &&
      !src.startsWith("blob:")
    ) {
      invoke("cmd_get_image", { path: src })
        .then((b64: any) => {
          const ext = src.split(".").pop()?.toLowerCase();
          const mime =
            ext === "png"
              ? "image/png"
              : ext === "gif"
                ? "image/gif"
                : "image/jpeg";
          setImgSrc(`data:${mime};base64,${b64}`);
        })
        .catch(console.error);
    } else {
      setImgSrc(src);
    }
  }, [src]);

  return (
    <div className="relative bg-background border border-border rounded overflow-hidden h-24">
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="inline-flex items-center justify-center rounded-full text-xs h-6 w-6 absolute top-1 right-1 z-10 bg-muted hover:bg-accent"
        aria-label={`Remove image ${index + 1}`}
      >
        <X className="w-3 h-3" />
      </button>
      <img
        src={imgSrc}
        alt={`Preview ${index + 1}`}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default function ProductForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const editingId = params.id ? parseInt(params.id, 10) : null;

  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [ean, setEan] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  const [vatRate, setVatRate] = useState("23");
  const [cnCode, setCnCode] = useState("");
  const [pkwiu, setPkwiu] = useState("");
  const [gtuCode, setGtuCode] = useState("");

  const [purchasePriceNet, setPurchasePriceNet] = useState("0.00");
  const [sellPriceNet, setSellPriceNet] = useState("0.00");
  const [currency, setCurrency] = useState("PLN");

  const [unit, setUnit] = useState("szt");
  const [stock, setStock] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [weightNet, setWeightNet] = useState("");
  const [weightGross, setWeightGross] = useState("");
  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");

  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [hasExpiryDate, setHasExpiryDate] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [lotNumber, setLotNumber] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sellPriceGross = useMemo(() => {
    const net = parseFloat(sellPriceNet || "0") || 0;
    const vat = parseFloat(vatRate || "0") || 0;
    const gross = net * (1 + vat / 100);
    return gross.toFixed(2);
  }, [sellPriceNet, vatRate]);

  const marginPercent = useMemo(() => {
    const purchase = parseFloat(purchasePriceNet || "0") || 0;
    const sell = parseFloat(sellPriceNet || "0") || 0;
    if (purchase <= 0) return "—";
    const margin = ((sell - purchase) / purchase) * 100;
    return margin.toFixed(2) + "%";
  }, [purchasePriceNet, sellPriceNet]);

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["clean"],
      ],
    }),
    [],
  );

  useEffect(() => {
    (async () => {
      try {
        const cs: any = await invoke("cmd_list_companies");
        if (Array.isArray(cs) && cs.length > 0) {
          setCompanies(cs);
          setCompanyId(cs[0].id);
        } else {
          setCompanies([]);
        }

        if (editingId) {
          await loadProduct(editingId);
        }
      } catch (e) {
        console.error("initial load failed", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  async function loadProduct(id: number) {
    setLoading(true);
    try {
      const p: any = await invoke("cmd_get_product", { id });
      if (!p) return;
      setName(p.name || "");
      setSku(p.sku || "");
      setEan(p.ean || "");
      setCategory(p.category || "");
      setBrand(p.brand || "");
      setModel(p.model || "");
      setVatRate(p.vat_rate || "23");
      setCnCode(p.cn_code || "");
      setPkwiu(p.pkwiu || "");
      setGtuCode(p.gtu_code || "");
      setPurchasePriceNet(p.purchase_price_net || "0.00");
      setSellPriceNet(p.sale_price_net || "0.00");
      setCurrency(p.currency || "PLN");
      setUnit(p.unit || "szt");
      setStock(p.stock ? String(p.stock) : null);
      setLocation(p.location || "");
      setWeightNet(p.weight_net || "");
      setWeightGross(p.weight_gross || "");
      setLengthCm(p.length || "");
      setWidthCm(p.width || "");
      setHeightCm(p.height || "");
      setShortDescription(p.short_description || "");
      setLongDescription(p.description || "");
      let imgs: any[] = [];
      if (p.images) {
        try {
          imgs = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
        } catch {
          imgs = Array.isArray(p.images) ? p.images : [];
        }
      }
      const previews = (imgs || []).map((it: any) => {
        if (typeof it === "string") return it;
        if (it && it.data) return it.data;
        return String(it);
      });
      setImagePreviews(previews);
      setHasExpiryDate(!!p.expiry_date);
      setExpiryDate(p.expiry_date || null);
      setLotNumber(p.lot_number || "");
      setCountryOfOrigin(p.country_of_origin || "");
      setCompanyId(p.company_id ?? companyId);
    } catch (e) {
      console.error("Failed to load product", e);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setError(null);
    if (!companyId) {
      setError("No issuer company found — create a company first.");
      return;
    }
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    const payload: ProductPayload = {
      company_id: companyId,
      sku: sku || null,
      ean: ean || null,
      name: name.trim(),
      category: category || null,
      brand: brand || null,
      model: model || null,
      vat_rate: vatRate || null,
      cn_code: cnCode || null,
      pkwiu: pkwiu || null,
      gtu_code: gtuCode || null,
      purchase_price_net: purchasePriceNet || null,
      sale_price_net: sellPriceNet || null,
      sell_price_gross: sellPriceGross || null,
      currency: currency || null,
      unit: unit || null,
      stock: stock || null,
      location: location || null,
      weight_net: weightNet || null,
      weight_gross: weightGross || null,
      length: lengthCm || null,
      width: widthCm || null,
      height: heightCm || null,
      short_description: shortDescription || null,
      description: longDescription || null,
      images: imagePreviews.length ? imagePreviews : null,
      attributes: {},
      is_service: 0,
      is_active: 1,
      expiry_date: hasExpiryDate ? expiryDate || null : null,
      lot_number: lotNumber || null,
      country_of_origin: countryOfOrigin || null,
    };

    setSaving(true);
    try {
      if (editingId) {
        const updatePayload = {
          id: editingId,
          ...payload,
        };
        await invoke("cmd_update_product", { payload: updatePayload });
        if ((sellPriceNet || "0") !== "0" && parseFloat(sellPriceNet) > 0) {
          await invoke("cmd_create_product_price", {
            payload: {
              product_id: editingId,
              currency: currency,
              price: sellPriceNet,
              valid_from: new Date().toISOString(),
              valid_to: null,
            },
          });
        }
      } else {
        const created: any = await invoke("cmd_create_product", { payload });
        if (created && parseFloat(sellPriceNet || "0") > 0) {
          await invoke("cmd_create_product_price", {
            payload: {
              product_id: created.id,
              currency: currency,
              price: sellPriceNet,
              valid_from: new Date().toISOString(),
              valid_to: null,
            },
          });
        }
      }
      navigate("/products");
    } catch (e) {
      console.error("Save failed", e);
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const readers = files.map((f) => {
      return new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = rej;
        r.readAsDataURL(f);
      });
    });
    Promise.all(readers)
      .then((dataUrls) =>
        setImagePreviews((prev) => {
          const combined = [...prev, ...dataUrls];
          return combined.filter((v, i) => combined.indexOf(v) === i);
        }),
      )
      .catch((err) => console.error("Failed to read images", err));
  }

  function removeImagePreview(index: number) {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {editingId ? t("products.edit_product") : t("products.new_product")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("products.form_description")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GhostButton onClick={() => navigate(-1)}>
            {t("common.cancel")}
          </GhostButton>
          <SoftPrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? t("common.saving") : t("products.save_product")}
          </SoftPrimaryButton>
        </div>
      </div>

      {loading && (
        <div className="bg-blue-500/15 text-blue-500 p-3 rounded-md flex items-center gap-2 text-sm shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t("common.loading")}</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-center gap-2 text-sm shadow-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="hidden">{companies.length}</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Basic Information */}
          <Card>
            <CardContent className="p-6">
              <CardHeader className="p-0 mb-4 border-b border-border pb-2">
                <CardTitle className="text-lg">
                  {t("products.basic_information")}
                </CardTitle>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <InputField
                    label={t("products.name")}
                    value={name}
                    onChange={setName}
                    required
                  />
                </div>
                <InputField
                  label={t("products.category_group")}
                  value={category}
                  onChange={setCategory}
                  info={t("products.category_tooltip")}
                  showOptional
                />
                <InputField
                  label={t("products.brand_manufacturer")}
                  value={brand}
                  onChange={setBrand}
                  showOptional
                />
                <InputField
                  label={t("products.model")}
                  value={model}
                  onChange={setModel}
                  showOptional
                />
                <InputField
                  label={t("products.sku_internal")}
                  value={sku}
                  onChange={setSku}
                  info={t("products.sku_tooltip")}
                  showOptional
                />
                <InputField
                  label={t("products.ean_gtin")}
                  value={ean}
                  onChange={setEan}
                  info={t("products.ean_tooltip")}
                  showOptional
                />
              </div>
            </CardContent>
          </Card>

          {/* 5. Descriptions & Media */}
          <Card>
            <CardContent className="p-6">
              <CardHeader className="p-0 mb-4 border-b border-border pb-2">
                <CardTitle className="text-lg">
                  {t("products.descriptions_media")}
                </CardTitle>
              </CardHeader>

              <div className="space-y-4">
                <InputField
                  label={t("products.short_description")}
                  value={shortDescription}
                  onChange={setShortDescription}
                  showOptional
                />

                <div className="flex flex-col gap-2 w-full">
                  <div className="label flex items-center gap-2">
                    <span className="label-text font-medium text-foreground">
                      {t("products.long_description")}
                    </span>
                    <span
                      className="text-[10px] text-muted-foreground rounded-full w-4 h-4 flex items-center justify-center bg-muted border border-border cursor-help"
                      title={t("products.long_desc_tooltip")}
                    >
                      ?
                    </span>
                  </div>
                  <div className="bg-background rounded-md mt-1">
                    <ReactQuill
                      theme="snow"
                      value={longDescription}
                      onChange={setLongDescription}
                      modules={quillModules}
                      className="bg-background"
                    />
                  </div>
                </div>

                <label className="flex flex-col gap-2 w-full">
                  <div className="label flex items-center gap-2">
                    <span className="label-text font-medium text-muted-foreground">
                      {t("products.images")}
                    </span>
                    <span
                      className="text-[10px] text-muted-foreground rounded-full w-4 h-4 flex items-center justify-center bg-muted border border-border cursor-help"
                      title={t("products.images_tooltip")}
                    >
                      ?
                    </span>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesChange}
                  />
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {imagePreviews.map((src, i) => (
                        <AsyncImagePreview
                          key={i}
                          src={src}
                          index={i}
                          onRemove={removeImagePreview}
                        />
                      ))}
                    </div>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Pricing, Inventory, Settings) */}
        <div className="space-y-8">
          {/* 3. Pricing */}
          <Card>
            <CardContent className="p-6">
              <CardHeader className="p-0 mb-4 border-b border-border pb-2">
                <CardTitle className="text-lg">
                  {t("products.pricing")}
                </CardTitle>
              </CardHeader>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <InputField
                      label={t("products.sell_price_net")}
                      value={sellPriceNet}
                      onChange={setSellPriceNet}
                      required
                    />
                  </div>
                  <div className="w-24">
                    <InputField
                      label={t("products.currency")}
                      value={currency}
                      onChange={setCurrency}
                      required
                    />
                  </div>
                </div>

                <InputField
                  label={t("products.purchase_price_net")}
                  value={purchasePriceNet}
                  onChange={setPurchasePriceNet}
                  showOptional
                />

                <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("products.margin")}
                    </span>
                    <span className="font-semibold text-green-500">
                      {marginPercent}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("products.sell_price_gross")}
                    </span>
                    <span className="font-medium">
                      {sellPriceGross} {currency}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Inventory */}
          <Card>
            <CardContent className="p-6">
              <CardHeader className="p-0 mb-4 border-b border-border pb-2">
                <CardTitle className="text-lg">
                  {t("products.inventory_logistics")}
                </CardTitle>
              </CardHeader>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label={t("products.unit")}
                  value={unit}
                  onChange={setUnit}
                  required
                />
              </div>

              <div className="w-full h-px bg-border my-4 relative">
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2 text-sm text-muted-foreground whitespace-nowrap">
                  {t("products.dimensions_weight")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label={t("products.weight_net")}
                  value={weightNet}
                  onChange={setWeightNet}
                  showOptional
                />
                <InputField
                  label={t("products.weight_gross")}
                  value={weightGross}
                  onChange={setWeightGross}
                  showOptional
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <InputField
                  label={t("products.length_cm")}
                  value={lengthCm}
                  onChange={setLengthCm}
                  showOptional
                />
                <InputField
                  label={t("products.width_cm")}
                  value={widthCm}
                  onChange={setWidthCm}
                  showOptional
                />
                <InputField
                  label={t("products.height_cm")}
                  value={heightCm}
                  onChange={setHeightCm}
                  showOptional
                />
              </div>
            </CardContent>
          </Card>

          {/* 2. Tax & Accounting */}
          <Card>
            <CardContent className="p-6">
              <CardHeader className="p-0 mb-4 border-b border-border pb-2">
                <CardTitle className="text-lg">
                  {t("products.tax_accounting")}
                </CardTitle>
              </CardHeader>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <InputField
                    label={t("products.vat_rate_pct")}
                    value={vatRate}
                    onChange={setVatRate}
                    required
                  />
                </div>
                <InputField
                  label={t("products.cn_code")}
                  value={cnCode}
                  onChange={setCnCode}
                  info={t("products.cn_code_tooltip")}
                  showOptional
                />
                <InputField
                  label={t("products.pkwiu")}
                  value={pkwiu}
                  onChange={setPkwiu}
                  info={t("products.pkwiu_tooltip")}
                  showOptional
                />
                <InputField
                  label={t("products.gtu_code")}
                  value={gtuCode}
                  onChange={setGtuCode}
                  info={t("products.gtu_code_tooltip")}
                  showOptional
                />
              </div>
            </CardContent>
          </Card>

          {/* 6. Advanced Settings */}
          <Card>
            <CardContent className="p-6">
              <CardHeader className="p-0 mb-4 border-b border-border pb-2">
                <CardTitle className="text-lg">{t("nav.advanced")}</CardTitle>
              </CardHeader>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_expiry_date"
                    checked={hasExpiryDate}
                    onCheckedChange={(checked: boolean) => {
                      setHasExpiryDate(!!checked);
                      if (!checked) setExpiryDate(null);
                    }}
                  />
                  <label
                    htmlFor="has_expiry_date"
                    className="text-sm font-medium leading-none"
                  >
                    {t("products.has_expiry_date")}
                  </label>
                </div>
                <InputField
                  type="date"
                  label={t("products.expiry_date")}
                  value={expiryDate ?? ""}
                  onChange={(v) => setExpiryDate(v || null)}
                  showOptional
                  disabled={!hasExpiryDate}
                />

                <InputField
                  label={t("products.lot_number")}
                  value={lotNumber}
                  onChange={setLotNumber}
                  info={t("products.lot_number_tooltip")}
                  showOptional
                />
                <InputField
                  label={t("products.country_of_origin")}
                  value={countryOfOrigin}
                  onChange={setCountryOfOrigin}
                  showOptional
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8 mb-4">
        <GhostButton onClick={() => navigate(-1)}>
          {t("common.cancel")}
        </GhostButton>
        <SoftPrimaryButton onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? t("common.saving") : t("products.save_product")}
        </SoftPrimaryButton>
      </div>
    </div>
  );
}
