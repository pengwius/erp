import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  className?: string;
}

export const SectionHeader = ({
  icon: Icon,
  title,
  className = "mb-6",
}: SectionHeaderProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="p-2 bg-primary/10 text-primary rounded-lg">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
};
