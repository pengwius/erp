import { useTheme } from "../../context/ThemeContext";
import { Palette } from "lucide-react";
import { SettingsPageHeader } from "../../components/settings/SettingsPageHeader";

import { ThemeCard } from "../../components/settings/ThemeCard";
import { ColorSwatch } from "../../components/settings/ColorSwatch";

export const AppearanceSettings = () => {
  const { theme, setTheme, themes, primaryColor, setPrimaryColor, colors } =
    useTheme();

  const availableThemes: ("light" | "dark")[] = themes;

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto py-4">
      <SettingsPageHeader
        title="Appearance"
        description="Personalize the look and feel of your workspace."
      />

      <section className="space-y-8">
        <div className="bg-background p-6 rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-medium">Theme</h2>
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
            <h2 className="text-lg font-medium">Accent Color</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Choose a accent color.
          </p>

          <div className="flex items-center gap-4 mb-6">
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
