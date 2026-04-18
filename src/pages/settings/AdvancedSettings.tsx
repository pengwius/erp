import { Wrench } from "lucide-react";

import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import SoftPrimaryButton from "../../components/PrimaryButton";
import { Database, Loader2 } from "lucide-react";

import { SettingsPageHeader } from "../../components/settings/SettingsPageHeader";
import { useTranslation } from "react-i18next";

export const AdvancedSettings = () => {
  
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImportSql = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      try {
        await invoke("cmd_import_database", { sql: text });
        window.location.reload();
      } catch (err: any) {
        console.error(err);
        setError("Import failed: " + err.toString());
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };


  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto py-4">
      <SettingsPageHeader
        title={t("advanced.title")}
        description={t("advanced.description")}
      />

      
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-border rounded-3xl bg-background/30 mb-8">
        <div className="relative">
          <input
            type="file"
            accept=".sql"
            onChange={handleImportSql}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />
          <SoftPrimaryButton
            type="button"
            icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            iconPosition="left"
            disabled={loading}
          >
            {t("settings.import_database", "Import Database (.sql)")}
          </SoftPrimaryButton>
        </div>
        {error && <p className="text-destructive mt-4 text-sm font-medium">{error}</p>}
        <p className="text-muted-foreground max-w-sm mt-4 text-sm">
          {t("settings.import_database_desc", "This will run arbitrary SQL script. Use with caution.")}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-border rounded-3xl bg-background/30">

        <div
          className="p-4 rounded-2xl mb-4 flex items-center justify-center"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--primary) 12%, transparent)",
          }}
        >
          <Wrench
            className="h-10 w-10"
            style={{
              color: "var(--primary)",
            }}
          />
        </div>
        <h3 className="font-semibold text-lg">
          {t("advanced.under_construction")}
        </h3>
        <p className="text-muted-foreground max-w-sm mt-2">
          {t("advanced.under_construction_desc")}
        </p>
      </div>
    </div>
  );
};
