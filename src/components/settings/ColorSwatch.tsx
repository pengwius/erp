import { CheckCircle2 } from "lucide-react";

interface ColorSwatchProps {
  color: string;
  isActive: boolean;
  onClick: () => void;
}

export const ColorSwatch = ({ color, isActive, onClick }: ColorSwatchProps) => {
  return (
    <button
      onClick={onClick}
      title={color}
      aria-label={`Select ${color}`}
      className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center ${
        isActive
          ? "ring-1 ring-offset-1 ring-primary"
          : "border-base-200 hover:border-base-300"
      }`}
      style={{ backgroundColor: color }}
    >
      {isActive && (
        <CheckCircle2 className="w-3 h-3 text-white drop-shadow-sm" />
      )}
    </button>
  );
};
