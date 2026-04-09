import { useTheme } from "../../context/ThemeContext";
import { Palette } from "lucide-react";
import { SettingsPageHeader } from "../../components/settings/SettingsPageHeader";

import { ThemeCard } from "../../components/settings/ThemeCard";
import { ColorSwatch } from "../../components/settings/ColorSwatch";

import { useTranslation } from "react-i18next";

export const AppearanceSettings = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme, themes, primaryColor, setPrimaryColor, colors } =
    useTheme();

  const availableThemes: ("light" | "dark")[] = themes;

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto py-4">
      <SettingsPageHeader title={t("appearance.title")} description="" />

      <div className="mt-8 mb-8 space-y-4">
        <h3 className="text-lg font-medium">{t("appearance.language")}</h3>
        <div className="flex gap-4">
          <button
            onClick={() => i18n.changeLanguage("pl")}
            className={`px-4 py-2 rounded-lg border transition-all ${i18n.language === "pl" ? "bg-primary/10 border-primary text-primary font-medium" : "border-border hover:bg-muted"}`}
          >
            Polski
          </button>
          <button
            onClick={() => i18n.changeLanguage("en")}
            className={`px-4 py-2 rounded-lg border transition-all ${i18n.language === "en" ? "bg-primary/10 border-primary text-primary font-medium" : "border-border hover:bg-muted"}`}
          >
            English
          </button>
        </div>
      </div>

      <section className="space-y-8">
        <div className="bg-background p-6 rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-medium">{t("appearance.theme")}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-8">
            {availableThemes.map((t) => (
              <ThemeCard
                key={t}
                theme={t}
                isActive={theme === t}
                onClick={() => setTheme(t)}
              />
            ))}
          </div>
        </div>

        <div className="bg-background p-6 rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-medium">
              {t("appearance.accent_color")}
            </h2>
          </div>

          <div className="flex items-center gap-4 mb-6 mt-4">
            <div className="flex items-center gap-2 flex-wrap">
              {(colors || [])
                .filter((c) => !!c)
                .map((c) => (
                  <ColorSwatch
                    key={c}
                    color={c}
                    isActive={
                      (primaryColor || "").toLowerCase() === c.toLowerCase()
                    }
                    onClick={() => setPrimaryColor(c)}
                  />
                ))}
            </div>

            <div className="ml-4 flex items-center gap-3">
              <input
                type="color"
                value={primaryColor || "#BD34FE"}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-10 p-0 border-0 bg-transparent cursor-pointer rounded-lg overflow-hidden"
                aria-label="Pick accent color"
              />
              <input
                type="text"
                value={primaryColor || "#BD34FE"}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="px-3 py-1 border rounded-lg bg-background/50 text-sm"
                aria-label="Accent color hex"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export { default as CompanySettings } from "./company/CompanySettings";
