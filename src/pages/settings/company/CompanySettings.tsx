import { useEffect, useState } from "react";
import { SettingsPageHeader } from "../../../components/settings/SettingsPageHeader";
import { useCompanies } from "../../../hooks/useCompanies";
import { CompanyList } from "./components/CompanyList";
import { CompanyForm } from "./components/CompanyForm";
import { Company } from "../../../types/company";

export const CompanySettings = () => {
  const {
    companies,
    loading,
    saving,
    error,
    success,
    fetchCompanies,
    updateCompany,
  } = useCompanies();

  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (companies.length > 0 && selectedId === null) {
      setSelectedId(companies[0].id);
    }
  }, [companies, selectedId]);

  const selectedCompany = companies.find((c) => c.id === selectedId) || null;

  const handleSelect = (company: Company) => {
    setSelectedId(company.id);
  };

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto py-4">
      <SettingsPageHeader
        title="Company"
        description="Manage your company information."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CompanyList
          companies={companies}
          loading={loading}
          selectedId={selectedId}
          onSelect={handleSelect}
        />

        <div className="col-span-2 bg-background p-6 rounded-2xl border border-border">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Edit company</h2>
              </div>
            </div>

            <CompanyForm
              company={selectedCompany}
              onSave={updateCompany}
              saving={saving}
              error={error}
              success={success}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;
