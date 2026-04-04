interface SettingsPageHeaderProps {
  title: string;
  description: string;
}

export const SettingsPageHeader = ({
  title,
  description,
}: SettingsPageHeaderProps) => {
  return (
    <div className="border-b border-base-300 pb-6 mb-8">
      <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
      <p className="text-base-content/60 mt-2">{description}</p>
    </div>
  );
};
