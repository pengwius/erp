import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InputField from "@/components/InputField";
import { Checkbox } from "@/components/ui/checkbox";
import SoftPrimaryButton, { GhostButton } from "@/components/PrimaryButton";
import { Loader2 } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

type ServicePayload = {
  company_id: number;
  sku?: string | null;
  name: string;
  category?: string | null;

  vat_rate?: string | null;
  pkwiu?: string | null;
  gtu_code?: string | null;
  purchase_price_net?: string | null;
  sale_price_net?: string | null;
  sell_price_gross?: string | null;
  currency?: string | null;

  unit?: string | null;

  short_description?: string | null;
  description?: string | null;

  is_service?: number | boolean;
  is_active?: number | boolean;
  expiry_date?: string | null;
  attributes?: Record<string, any> | null;
};

export default function ServiceProductForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const editingId = params.id ? parseInt(params.id, 10) : null;

  const [companyId, setCompanyId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");

  const [vatRate, setVatRate] = useState("23");
  const [pkwiu, setPkwiu] = useState("");
  const [gtuCode, setGtuCode] = useState("");
  const [sellPriceNet, setSellPriceNet] = useState("0.00");
  const [purchasePriceNet, setPurchasePriceNet] = useState("0.00");
  const [currency, setCurrency] = useState("PLN");
  const [unit, setUnit] = useState("h");

  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");

  const [isSubscription, setIsSubscription] = useState(false);
  const [billingCycle, setBillingCycle] = useState("");
  const [duration, setDuration] = useState("");

  const [hasExpiryDate, setHasExpiryDate] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sellPriceGross = useMemo(() => {
    const net = parseFloat(sellPriceNet || "0") || 0;
    const vat = parseFloat(vatRate || "0") || 0;
    const gross = net * (1 + vat / 100);
    return gross.toFixed(2);
  }, [sellPriceNet, vatRate]);

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
          setCompanyId((prev) => prev ?? cs[0].id);
        } else {
          setCompanyId((prev) => prev ?? 1);
        }

        if (editingId) {
          await loadService(editingId);
        }
      } catch (e) {
        console.error("initial load failed (service form)", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  async function loadService(id: number) {
    setLoading(true);
    try {
      const p: any = await invoke("cmd_get_product", { id });
      if (!p) return;
      setName(p.name || "");
      setSku(p.sku || "");
      setCategory(p.category || "");
      setVatRate(p.vat_rate || "23");
      setPkwiu(p.pkwiu || "");
      setGtuCode(p.gtu_code || "");
      setSellPriceNet(p.sale_price_net || "0.00");
      setPurchasePriceNet(p.purchase_price_net || "0.00");
      setCurrency(p.currency || "PLN");
      setUnit(p.unit || "h");
      setShortDescription(p.short_description || "");
      setLongDescription(p.description || "");
      setHasExpiryDate(!!p.expiry_date);
      setExpiryDate(p.expiry_date || null);
      setCompanyId(p.company_id ?? companyId);

      let attrs: any = {};
      if (p.attributes) {
        try {
          attrs =
            typeof p.attributes === "string"
              ? JSON.parse(p.attributes)
              : p.attributes;
        } catch {}
      }
      setIsSubscription(!!attrs.is_subscription);
      setBillingCycle(attrs.billing_cycle || "");
      setDuration(attrs.duration || "");
    } catch (e) {
      console.error("Failed to load service", e);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setError(null);
    if (!companyId) {
      setError(
        t("company.no_companies") ||
          "No issuer company found — create a company first.",
      );
      return;
    }
    if (!name.trim()) {
      setError(t("products.name_required"));
      return;
    }

    const payload: ServicePayload = {
      company_id: companyId,
      sku: sku || null,
      name: name.trim(),
      category: category || null,
      vat_rate: vatRate || null,
      pkwiu: pkwiu || null,
      gtu_code: gtuCode || null,
      purchase_price_net: purchasePriceNet || null,
      sale_price_net: sellPriceNet || null,
      sell_price_gross: sellPriceGross || null,
      currency: currency || null,
      unit: unit || null,
      short_description: shortDescription || null,
      description: longDescription || null,
      is_service: 1,
      is_active: 1,
      expiry_date: hasExpiryDate ? expiryDate || null : null,
      attributes: {
        is_subscription: isSubscription,
        billing_cycle: isSubscription ? billingCycle : null,
        duration: duration || null,
      },
    };

    setSaving(true);
    try {
      if (editingId) {
        await invoke("cmd_update_product", {
          payload: { id: editingId, ...payload },
        });
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
      console.error("Save failed (service)", e);
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {editingId ? t("products.edit_service") : t("products.new_service")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("products.service_form_description")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GhostButton onClick={() => navigate(-1)}>
            {t("common.cancel")}
          </GhostButton>
          <SoftPrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? t("common.saving") : t("products.save_service")}
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
          <Loader2 className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
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
                  label={t("products.sku_internal")}
                  value={sku}
                  onChange={setSku}
                  info={t("products.sku_tooltip")}
                  showOptional
                />
                <InputField
                  label={t("products.category_group")}
                  value={category}
                  onChange={setCategory}
                  info={t("products.category_tooltip")}
                  showOptional
                />
                <InputField
                  label={t("products.unit")}
                  value={unit}
                  onChange={setUnit}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Descriptions */}
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
                  <span className="label-text font-medium text-foreground">
                    {t("products.long_description")}
                  </span>
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Pricing */}
          <Card>
            <CardContent className="p-6">
              <CardHeader className="p-0 mb-4 border-b border-border pb-2">
                <CardTitle className="text-lg">
                  {t("products.pricing")}
                </CardTitle>
              </CardHeader>

              <div className="space-y-4">
                <InputField
                  label={t("products.sell_price_net")}
                  value={sellPriceNet}
                  onChange={setSellPriceNet}
                  required
                />
                <InputField
                  label={t("products.internal_cost")}
                  value={purchasePriceNet}
                  onChange={setPurchasePriceNet}
                  info={t("products.internal_cost_tooltip")}
                  showOptional
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label={t("products.vat_rate_pct")}
                    value={vatRate}
                    onChange={setVatRate}
                    required
                  />
                  <InputField
                    label={t("products.currency")}
                    value={currency}
                    onChange={setCurrency}
                    required
                  />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-2">
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

          {/* Service Parameters */}
          <Card>
            <CardContent className="p-6">
              <CardHeader className="p-0 mb-4 border-b border-border pb-2">
                <CardTitle className="text-lg">
                  {t("products.type_service")}
                </CardTitle>
              </CardHeader>

              <div className="space-y-4">
                <InputField
                  label={t("products.duration")}
                  value={duration}
                  onChange={setDuration}
                  info={t("products.duration_tooltip")}
                  showOptional
                />

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="is_subscription"
                    checked={isSubscription}
                    onCheckedChange={(checked: boolean) => {
                      setIsSubscription(!!checked);
                      if (!checked) setBillingCycle("");
                    }}
                  />
                  <label
                    htmlFor="is_subscription"
                    className="text-sm font-medium leading-none"
                  >
                    {t("products.is_subscription")}
                  </label>
                </div>

                {isSubscription && (
                  <InputField
                    label={t("products.billing_cycle")}
                    value={billingCycle}
                    onChange={setBillingCycle}
                    info={t("products.billing_cycle_tooltip")}
                    required
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Advanced */}
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
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8 mb-4">
        <GhostButton onClick={() => navigate(-1)}>
          {t("common.cancel")}
        </GhostButton>
        <SoftPrimaryButton onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? t("common.saving") : t("products.save_service")}
        </SoftPrimaryButton>
      </div>
    </div>
  );
}
