import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const has = await invoke<boolean>("cmd_has_companies");
        setNeedsOnboarding(!has);
      } catch (e) {
        console.error("Failed to check companies", e);
        setNeedsOnboarding(false);
      }
    })();
  }, []);

  return { needsOnboarding, setNeedsOnboarding };
}
