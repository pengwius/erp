import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  themes: ("light" | "dark")[];
  primaryColor: string;
  setPrimaryColor: (c: string) => void;
  colors: string[];
};

const THEMES: ("light" | "dark")[] = ["light", "dark"];

const PRESET_COLORS = [
  "#BD34FE", // default purple
  "#7C3AED", // indigo-ish
  "#6366F1", // indigo-2
  "#06B6D4", // cyan
  "#10B981", // emerald/green
  "#F97316", // orange
  "#EF4444", // red
  "#EC4899", // pink
];

const DEFAULT_PRIMARY = PRESET_COLORS[0];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function hexToRgb(hex: string | null): [number, number, number] | null {
  if (!hex) return null;
  const s = hex.trim().replace("#", "");
  const full =
    s.length === 3
      ? s
          .split("")
          .map((c) => c + c)
          .join("")
      : s;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function clamp(v: number, a = 0, b = 255) {
  return Math.max(a, Math.min(b, Math.round(v)));
}

function adjustBrightness(rgb: [number, number, number], factor: number) {
  return [
    clamp(rgb[0] * factor),
    clamp(rgb[1] * factor),
    clamp(rgb[2] * factor),
  ] as [number, number, number];
}

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const stored = localStorage.getItem("erp-theme");
      return stored === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  const [primaryColor, setPrimaryColor] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("erp-primary");
      return stored || DEFAULT_PRIMARY;
    } catch {
      return DEFAULT_PRIMARY;
    }
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const body = document.body;

    try {
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      try {
        localStorage.setItem("erp-theme", theme);
      } catch {}
    } catch {}

    try {
      const primary = primaryColor || DEFAULT_PRIMARY;
      root.style.setProperty("--p", primary);
      root.style.setProperty("--primary", primary);
      if (body) {
        body.style.setProperty("--p", primary);
        body.style.setProperty("--primary", primary);
      }

      const rgb = hexToRgb(primary);
      const rgbSpace = rgb ? `${rgb[0]} ${rgb[1]} ${rgb[2]}` : "";

      if (rgb) {
        root.style.setProperty("--p-rgb", rgbSpace);
        root.style.setProperty("--primary-rgb", rgbSpace);
        if (body) {
          body.style.setProperty("--p-rgb", rgbSpace);
          body.style.setProperty("--primary-rgb", rgbSpace);
        }

        const darker = adjustBrightness(rgb, 0.82);
        const lighter = adjustBrightness(rgb, 1.12);
        const darkerHex = rgbToHex(darker[0], darker[1], darker[2]);
        const lighterHex = rgbToHex(lighter[0], lighter[1], lighter[2]);

        root.style.setProperty("--pf", darkerHex);
        root.style.setProperty("--primary-focus", darkerHex);
        root.style.setProperty("--primary-hover", lighterHex);

        root.style.setProperty(
          "--pf-rgb",
          `${darker[0]} ${darker[1]} ${darker[2]}`,
        );
        root.style.setProperty(
          "--primary-focus-rgb",
          `${darker[0]} ${darker[1]} ${darker[2]}`,
        );
        root.style.setProperty(
          "--primary-hover-rgb",
          `${lighter[0]} ${lighter[1]} ${lighter[2]}`,
        );

        let primaryContent = theme === "light" ? "#000000" : "#FFFFFF";

        root.style.setProperty("--primary-content", primaryContent);
        root.style.setProperty("--pc", primaryContent);
        if (body) {
          body.style.setProperty("--primary-content", primaryContent);
          body.style.setProperty("--pc", primaryContent);
        }

        root.style.setProperty("--sidebar-primary", primary);
        root.style.setProperty("--sidebar-primary-foreground", primaryContent);

        if (rgb) {
          const accentAlpha = "0.28";
          root.style.setProperty(
            "--sidebar-accent",
            `rgba(${rgb[0]} ${rgb[1]} ${rgb[2]} / ${accentAlpha})`,
          );
        } else {
          root.style.setProperty("--sidebar-accent", lighterHex);
        }
        root.style.setProperty("--sidebar-accent-foreground", primaryContent);

        if (rgb) {
          root.style.setProperty(
            "--sidebar-border",
            `rgba(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0.28)`,
          );
          root.style.setProperty(
            "--sidebar-ring",
            `rgba(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0.18)`,
          );
        }

        root.style.setProperty(
          "--primary-border-rgba",
          `rgba(${rgbSpace} / 0.3)`,
        );
        if (body)
          body.style.setProperty(
            "--primary-border-rgba",
            `rgba(${rgbSpace} / 0.3)`,
          );
      }

      try {
        localStorage.setItem("erp-primary", primary);
      } catch {}

      try {
        const pRgbForCss =
          getComputedStyle(root).getPropertyValue("--p-rgb") ||
          getComputedStyle(root).getPropertyValue("--primary-rgb") ||
          rgbSpace ||
          "";

        const overrideCss = `
        :root, body {
          --p: ${primary} !important;
          --primary: ${primary} !important;
          ${pRgbForCss ? `--p-rgb: ${pRgbForCss} !important; --primary-rgb: ${pRgbForCss} !important;` : ""}
          --primary-content: ${getComputedStyle(root).getPropertyValue("--primary-content") || getComputedStyle(root).getPropertyValue("--pc") || "#FFFFFF"} !important;
        }

        /* Force dark text on light theme for anything using text-primary or avatar helper areas.
           This ensures in light theme these elements are always black regardless of primary hue. */
        :root:not(.dark) .text-primary { color: #000000 !important; }
        :root:not(.dark) .avatar .bg-primary\/10, :root:not(.dark) .rounded.bg-primary\/10 { color: #000000 !important; }

        /* Force light text on dark theme for anything using text-primary or avatar helper areas.
           This ensures in dark theme these elements are always white regardless of primary hue. */
        :root.dark .text-primary { color: #FFFFFF !important; }
        :root.dark .avatar .bg-primary\/10, :root.dark .rounded.bg-primary\/10 { color: #FFFFFF !important; }

        /* Ensure common primary classes update live */
        .text-primary { color: var(--primary-content) !important; }
        .bg-primary { background-color: var(--primary) !important; color: var(--primary-content) !important; }
        .bg-primary\/5 { background-color: color-mix(in srgb, var(--primary) 5%, transparent) !important; }
        .bg-primary\/10 { background-color: color-mix(in srgb, var(--primary) 10%, transparent) !important; }
        .bg-primary\/20 { background-color: color-mix(in srgb, var(--primary) 20%, transparent) !important; }
        .bg-primary\/30 { background-color: color-mix(in srgb, var(--primary) 30%, transparent) !important; }

        .border-primary { border-color: var(--primary) !important; }
        .border-primary\/10 { border-color: color-mix(in srgb, var(--primary) 10%, transparent) !important; }
        .border-primary\/20 { border-color: color-mix(in srgb, var(--primary) 20%, transparent) !important; }
        .border-primary\/30 { border-color: color-mix(in srgb, var(--primary) 30%, transparent) !important; }

        .btn-primary, .btn.btn-primary {
          background-color: var(--primary) !important;
          color: var(--primary-content) !important;
          border-color: var(--primary) !important;
        }

        .focus\\:ring-primary:focus, .ring-primary {
          --tw-ring-color: color-mix(in srgb, var(--primary) 40%, transparent) !important;
        }

        /* translucent helper areas (avatars, badges) */
        .avatar .bg-primary\/10, .rounded.bg-primary\/10 {
          background-color: color-mix(in srgb, var(--primary) 10%, transparent) !important;
          color: var(--primary-content) !important;
        }

        /* readable content on solid primary */
        .bg-primary, .btn-primary, .badge-primary {
          color: var(--primary-content) !important;
        }

        /* fallback for explicit attribute-marked elements */
        *[data-primary-bg] { background-color: var(--primary) !important; color: var(--primary-content) !important; }
        `.trim();

        let styleEl = document.getElementById(
          "erp-dynamic-overrides",
        ) as HTMLStyleElement | null;
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = "erp-dynamic-overrides";
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = overrideCss;
        document.documentElement.offsetHeight;
      } catch {}
    } catch {}
  }, [theme, primaryColor]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themes: THEMES,
        primaryColor,
        setPrimaryColor,
        colors: PRESET_COLORS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};
