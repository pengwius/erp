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
  const [shortName, setShortName] = useState("");
  const [nip, setNip] = useState("");
  const [regon, setRegon] = useState("");
  const [street, setStreet] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [voivodeship, setVoivodeship] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [poBox, setPoBox] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [currency, setCurrency] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [operatorName, setOperatorName] = useState("");

  useEffect(() => {
    if (company) {
      setName(company.name || "");
      setShortName(company.short_name || "");
      setNip(company.nip || "");
      setRegon(company.regon || "");
      setStreet(company.street || "");
      setBuildingNumber(company.building_number || "");
      setFlatNumber(company.flat_number || "");
      setPostalCode(company.postal_code || "");
      setCity(company.city || "");
      setCounty(company.county || "");
      setVoivodeship(company.voivodeship || "");
      setPostOffice(company.post_office || "");
      setPoBox(company.po_box || "");
      setCountry(company.country || "");
      setEmail(company.email || "");
      setWebsite(company.website || "");
      setCurrency(company.currency || "");
      setInitialBalance(company.initial_balance || "");
      setOperatorName(company.operator_name || "");
    } else {
      setName("");
      setShortName("");
      setNip("");
      setRegon("");
      setStreet("");
      setBuildingNumber("");
      setFlatNumber("");
      setPostalCode("");
      setCity("");
      setCounty("");
      setVoivodeship("");
      setPostOffice("");
      setPoBox("");
      setCountry("");
      setEmail("");
      setWebsite("");
      setCurrency("");
      setInitialBalance("");
      setOperatorName("");
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    await onSave({
      id: company.id,
      name: name.trim(),
      short_name: shortName.trim() || null,
      nip: nip.trim() || null,
      regon: regon.trim() || null,
      street: street.trim() || null,
      building_number: buildingNumber.trim() || null,
      flat_number: flatNumber.trim() || null,
      postal_code: postalCode.trim() || null,
      city: city.trim() || null,
      county: county.trim() || null,
      voivodeship: voivodeship.trim() || null,
      post_office: postOffice.trim() || null,
      po_box: poBox.trim() || null,
      country: country.trim() || null,
      email: email.trim() || null,
      website: website.trim() || null,
      currency: currency.trim() || null,
      initial_balance: initialBalance.trim() || null,
      operator_name: operatorName.trim() || null,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-sm text-destructive">{error}</div>}
      {success && <div className="text-sm text-green-500">{success}</div>}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {t("company.basic_info", "Basic Info")}
        </h3>
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
            <span className="text-sm mb-1">{t("company.short_name")}</span>
            <Input
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.nip")}</span>
            <Input value={nip} onChange={(e) => setNip(e.target.value)} />
          </label>
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.regon")}</span>
            <Input value={regon} onChange={(e) => setRegon(e.target.value)} />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {t("company.user_financials", "User / Financials")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.operator_name")}</span>
            <Input
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.currency")}</span>
            <Input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.initial_balance")}</span>
            <Input
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {t("company.address", "Address")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.street")}</span>
            <Input value={street} onChange={(e) => setStreet(e.target.value)} />
          </label>
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.building_number")}</span>
            <Input
              value={buildingNumber}
              onChange={(e) => setBuildingNumber(e.target.value)}
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.flat_number")}</span>
            <Input
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.postal_code")}</span>
            <Input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.city")}</span>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.country")}</span>
            <Input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.county")}</span>
            <Input value={county} onChange={(e) => setCounty(e.target.value)} />
          </label>
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.voivodeship")}</span>
            <Input
              value={voivodeship}
              onChange={(e) => setVoivodeship(e.target.value)}
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.post_office")}</span>
            <Input
              value={postOffice}
              onChange={(e) => setPostOffice(e.target.value)}
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.po_box")}</span>
            <Input value={poBox} onChange={(e) => setPoBox(e.target.value)} />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {t("company.contact", "Contact")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.email")}</span>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="flex flex-col">
            <span className="text-sm mb-1">{t("company.website")}</span>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
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
