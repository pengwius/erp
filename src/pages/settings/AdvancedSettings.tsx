import { Wrench } from "lucide-react";
import { SettingsPageHeader } from "../../components/settings/SettingsPageHeader";
import { useTranslation } from "react-i18next";

export const AdvancedSettings = () => {
  const { t } = useTranslation();

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto py-4">
      <SettingsPageHeader
        title={t("advanced.title")}
        description={t("advanced.description")}
      />

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
