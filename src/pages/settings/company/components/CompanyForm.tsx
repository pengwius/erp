import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Company } from "../../../../types/company";
import { useTranslation } from "react-i18next";

interface CompanyFormProps {
  company: Company | null;
  onSave: (data: Partial<Company> & { id: number }) => Promise<Company>;
  saving: boolean;
  error: string | null;
  success: string | null;
}

export const CompanyForm = ({
  company,
  onSave,
  saving,
  error,
  success,
}: CompanyFormProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [nip, setNip] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (company) {
      setName(company.name || "");
      setNip(company.nip || "");
      setStreet(company.street || "");
      setCity(company.city || "");
      setPostalCode(company.postal_code || "");
      setCountry(company.country || "");
    } else {
      setName("");
      setNip("");
      setStreet("");
      setCity("");
      setPostalCode("");
      setCountry("");
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    await onSave({
      id: company.id,
      name: name.trim(),
      nip: nip.trim() || null,
      street: street.trim() || null,
      city: city.trim() || null,
      postal_code: postalCode.trim() || null,
      country: country.trim() || null,
    });
  };

  if (!company) {
    return (
      <div className="text-sm text-muted-foreground">
        {t("company.edit_company")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="mb-4 text-sm text-destructive">{error}</div>}
      {success && <div className="mb-4 text-sm text-green-500">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col">
          <span className="text-sm mb-1">{t("company.name")}</span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm mb-1">{t("company.nip")}</span>
          <Input value={nip} onChange={(e) => setNip(e.target.value)} />
        </label>
      </div>

      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.street")}</span>
            <Input value={street} onChange={(e) => setStreet(e.target.value)} />
          </label>

          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.city")}</span>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </label>

          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.postal_code")}</span>
            <Input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </label>

          <label className="flex flex-col md:col-span-2 lg:col-span-1">
            <span className="text-sm mb-1">{t("company.country")}</span>
            <Input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <PrimaryButton
          type="submit"
          disabled={saving || !name.trim()}
          loading={saving}
          loadingText={t("common.saving")}
          icon={<Check className="w-4 h-4" />}
          iconPosition="right"
          className="px-4 py-2"
        >
          {t("common.save")}
        </PrimaryButton>
      </div>
    </form>
  );
};
