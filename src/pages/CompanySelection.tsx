import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building, Plus, ChevronRight } from "lucide-react";
import { useCompanies } from "../hooks/useCompanies";
import { Card } from "../components/ui/card";

export function CompanySelection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { companies, fetchCompanies, switchCompany } = useCompanies();

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSelect = (id: number) => {
    switchCompany(id);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("company_selection.title", "Select Company")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "company_selection.subtitle",
              "Choose a company to continue or create a new one.",
            )}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {companies.map((company) => (
            <Card
              key={company.id}
              className="cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-all group overflow-hidden"
              onClick={() => handleSelect(company.id)}
            >
              <div className="px-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Building className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold leading-none tracking-tight mb-1">
                    {company.short_name || company.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {company.name}
                  </p>
                  {company.nip && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("company_selection.nip", "NIP:")} {company.nip}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Card>
          ))}

          <Card
            className="cursor-pointer border-dashed hover:border-primary/50 hover:bg-accent/50 transition-all group overflow-hidden"
            onClick={() => navigate("/onboarding")}
          >
            <div className="px-4 py-3 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <Plus className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-lg font-medium text-muted-foreground leading-none tracking-tight">
                  {t("company_selection.add_new", "Add new company")}
                </span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
