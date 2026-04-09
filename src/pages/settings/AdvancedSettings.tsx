import { Wrench } from "lucide-react";
import { SettingsPageHeader } from "../../components/settings/SettingsPageHeader";


export const AdvancedSettings = () => {
  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto py-4">
      <SettingsPageHeader
        title="Advanced Settings"
        description="System configurations and technical parameters."
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
        <h3 className="font-semibold text-lg">Under Construction</h3>
        <p className="text-muted-foreground max-w-sm mt-2">
          These modules are currently being developed. Check back later for
          updates.
        </p>
      </div>
    </div>
  );
};
