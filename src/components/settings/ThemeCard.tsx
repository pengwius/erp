import { CheckCircle2 } from "lucide-react";

interface ThemeCardProps {
  theme: "light" | "dark";
  isActive: boolean;
  onClick: () => void;
}

export const ThemeCard = ({ theme, isActive, onClick }: ThemeCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`relative group flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none ${
        isActive
          ? "border-primary bg-primary/5 text-primary"
          : "border-base-200 bg-base-100/30 hover:bg-base-200/50 hover:border-base-300 text-base-content/80"
      }`}
    >
      <div
        data-theme={theme}
        className={`w-10 h-10 rounded-full mb-3 border-4 flex items-center justify-center ${
          isActive
            ? "border-primary/20"
            : "border-base-200 group-hover:border-base-300"
        }`}
      >
        <div className="w-full h-full rounded-full bg-primary opacity-80"></div>
      </div>
      <span className="capitalize text-sm font-medium">{theme}</span>
      {isActive && (
        <CheckCircle2 className="w-4 h-4 absolute top-3 right-3 text-primary-content" />
      )}
    </button>
  );
};
