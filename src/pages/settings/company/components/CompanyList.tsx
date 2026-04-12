import { Company } from "../../../../types/company";
import { useTranslation } from "react-i18next";

interface CompanyListProps {
  companies: Company[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (company: Company) => void;
}

export const CompanyList = ({
  companies,
  loading,
  selectedId,
  onSelect,
}: CompanyListProps) => {
  const { t } = useTranslation();

  return (
    <div className="col-span-1 bg-background p-4 rounded-2xl border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{t("nav.company")}</h3>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">
          {t("common.loading")}
        </div>
      )}

      {!loading && companies.length === 0 && (
        <div className="text-sm text-muted-foreground">
          {t("company.no_companies")}
        </div>
      )}

      <ul className="mt-3 space-y-2">
        {companies.map((company) => (
          <li key={company.id}>
            <button
              onClick={() => onSelect(company)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedId === company.id
                  ? "bg-primary/10 border border-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{company.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {company.nip || company.street || "—"}
                  </div>
                </div>
                <div className="text-xs text-foreground/50">#{company.id}</div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
