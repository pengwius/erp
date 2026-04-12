import { useEffect, useState, FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import InputField from "@/components/InputField";
import SoftPrimaryButton, { GhostButton } from "@/components/PrimaryButton";
import { Loader2 } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";

export default function CustomerForm() {
  const { t } = useTranslation();
  const params = useParams<{ id?: string }>();
  const editingId = params.id ? parseInt(params.id, 10) : null;
  const { companies, fetchCompanies } = useCompanies();
  const selectedCompany = companies.length > 0 ? companies[0].id : null;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);
  const [formData, setFormData] = useState({
    name: "",
    nip: "",
    street: "",
    city: "",
    postal_code: "",
    country: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    setIsSubmitting(true);
    try {
      const payload = {
        company_id: selectedCompany,
        name: formData.name,
        nip: formData.nip || null,
        street: formData.street || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        country: formData.country || null,
        email: formData.email || null,
        phone: formData.phone || null,
      };

      if (editingId) {
        const { company_id, ...changes } = payload;
        await invoke("cmd_update_customer", {
          id: editingId,
          changes,
        });
      } else {
        await invoke("cmd_create_customer", { newCustomer: payload });
      }
      navigate("/customers");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (editingId) {
      invoke<any>("cmd_get_customer", { id: editingId }).then((c) => {
        if (c) {
          setFormData({
            name: c.name || "",
            nip: c.nip || "",
            street: c.street || "",
            city: c.city || "",
            postal_code: c.postal_code || "",
            country: c.country || "",
            email: c.email || "",
            phone: c.phone || "",
          });
        }
      });
    }
  }, [editingId]);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {editingId
              ? t("customers.edit_customer")
              : t("customers.new_customer")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("customers.form_description")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GhostButton type="button" onClick={() => navigate(-1)}>
            {t("common.cancel")}
          </GhostButton>
          <SoftPrimaryButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? t("common.saving") : t("customers.save")}
          </SoftPrimaryButton>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <InputField
                label={t("customers.name")}
                name="name"
                value={formData.name}
                onChange={(val) => setFormData((p) => ({ ...p, name: val }))}
                required
              />
            </div>
            <InputField
              label={t("customers.nip")}
              name="nip"
              value={formData.nip}
              onChange={(val) => setFormData((p) => ({ ...p, nip: val }))}
              showOptional
            />
            <InputField
              label={t("customers.email")}
              name="email"
              value={formData.email}
              onChange={(val) => setFormData((p) => ({ ...p, email: val }))}
              showOptional
            />
            <InputField
              label={t("customers.phone")}
              name="phone"
              value={formData.phone}
              onChange={(val) => setFormData((p) => ({ ...p, phone: val }))}
              showOptional
            />
            <InputField
              label={t("customers.street")}
              name="street"
              value={formData.street}
              onChange={(val) => setFormData((p) => ({ ...p, street: val }))}
              showOptional
            />
            <InputField
              label={t("customers.city")}
              name="city"
              value={formData.city}
              onChange={(val) => setFormData((p) => ({ ...p, city: val }))}
              showOptional
            />
            <InputField
              label={t("customers.postal_code")}
              name="postal_code"
              value={formData.postal_code}
              onChange={(val) =>
                setFormData((p) => ({ ...p, postal_code: val }))
              }
              showOptional
            />
            <InputField
              label={t("customers.country")}
              name="country"
              value={formData.country}
              onChange={(val) => setFormData((p) => ({ ...p, country: val }))}
              showOptional
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8 mb-4">
        <GhostButton type="button" onClick={() => navigate(-1)}>
          {t("common.cancel")}
        </GhostButton>
        <SoftPrimaryButton onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? t("common.saving") : t("customers.save")}
        </SoftPrimaryButton>
      </div>
    </div>
  );
}
