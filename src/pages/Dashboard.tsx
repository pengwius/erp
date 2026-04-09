import { useTranslation } from "react-i18next";

export const Dashboard: any = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
      <p>{t("dashboard.welcome")}</p>
    </div>
  );
};
