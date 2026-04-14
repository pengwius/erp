import { useEffect, useState, FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import InputField from "@/components/InputField";
import SoftPrimaryButton, { GhostButton } from "@/components/PrimaryButton";
import { Loader2 } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { Checkbox } from "@/components/ui/checkbox";
export default function WarehouseForm() {
  const { t } = useTranslation();
  const params = useParams<{ id?: string }>();
  const editingId = params.id ? parseInt(params.id, 10) : null;
  const { activeCompanyId: selectedCompany, fetchCompanies } = useCompanies();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const [formData, setFormData] = useState({
    name: "",
    location_code_prefix: "",
    description: "",
    address: "",
    manager_name: "",
    is_active: 1,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    setIsSubmitting(true);
    try {
      if (editingId) {
        await invoke("cmd_update_warehouse", {
          id: editingId,
          updateData: {
            name: formData.name,
            location_code_prefix: formData.location_code_prefix || null,
            description: formData.description || null,
            address: formData.address || null,
            manager_name: formData.manager_name || null,
            is_active: formData.is_active,
          },
        });
      } else {
        const payload = {
          company_id: selectedCompany,
          name: formData.name,
          location_code_prefix: formData.location_code_prefix || null,
          description: formData.description || null,
          address: formData.address || null,
          manager_name: formData.manager_name || null,
          is_active: formData.is_active,
          created_at: new Date().toISOString(),
        };
        await invoke("cmd_create_warehouse", { newWarehouse: payload });
      }
      navigate("/warehouses");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (editingId) {
      invoke<any>("cmd_get_warehouse", { id: editingId }).then((w) => {
        if (w) {
          setFormData({
            name: w.name || "",
            location_code_prefix: w.location_code_prefix || "",
            description: w.description || "",
            address: w.address || "",
            manager_name: w.manager_name || "",
            is_active: w.is_active !== undefined ? w.is_active : 1,
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
              ? t("warehouses.edit_warehouse", "Edit Warehouse")
              : t("warehouses.new_warehouse", "New Warehouse")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("warehouses.form_description", "Fill in the warehouse details.")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GhostButton type="button" onClick={() => navigate(-1)}>
            {t("common.cancel", "Cancel")}
          </GhostButton>
          <SoftPrimaryButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSubmitting
              ? t("common.saving", "Saving...")
              : t("common.save", "Save")}
          </SoftPrimaryButton>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <InputField
              label={t("warehouses.name", "Name")}
              name="name"
              value={formData.name}
              onChange={(val) => setFormData((p) => ({ ...p, name: val }))}
              required
            />

            <InputField
              label={t(
                "warehouses.location_code_prefix",
                "Location Code Prefix",
              )}
              name="location_code_prefix"
              value={formData.location_code_prefix}
              onChange={(val) =>
                setFormData((p) => ({ ...p, location_code_prefix: val }))
              }
            />

            <InputField
              label={t("warehouses.description", "Description")}
              name="description"
              value={formData.description}
              onChange={(val) =>
                setFormData((p) => ({ ...p, description: val }))
              }
            />

            <InputField
              label={t("warehouses.address", "Address")}
              name="address"
              value={formData.address}
              onChange={(val) => setFormData((p) => ({ ...p, address: val }))}
            />

            <InputField
              label={t("warehouses.manager_name", "Manager Name")}
              name="manager_name"
              value={formData.manager_name}
              onChange={(val) =>
                setFormData((p) => ({ ...p, manager_name: val }))
              }
            />

            <div className="flex items-center gap-2 mt-2">
              <Checkbox
                checked={formData.is_active === 1}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, is_active: checked ? 1 : 0 }))
                }
              />
              <label className="text-sm font-medium">
                {t("warehouses.is_active", "Active")}
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8 mb-4">
        <GhostButton type="button" onClick={() => navigate(-1)}>
          {t("common.cancel", "Cancel")}
        </GhostButton>
        <SoftPrimaryButton onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isSubmitting
            ? t("common.saving", "Saving...")
            : t("common.save", "Save")}
        </SoftPrimaryButton>
      </div>
    </div>
  );
}
