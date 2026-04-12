import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { GhostButton } from "../../components/PrimaryButton";
import { Package, Wrench } from "lucide-react";

export default function ProductTypeSelection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("products.new_product")}
        </h1>
        <p className="text-muted-foreground">
          Wybierz rodzaj elementu, który chcesz utworzyć.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
        <Card
          className="cursor-pointer hover:border-primary transition-colors flex flex-col items-center text-center p-8 space-y-4"
          onClick={() => navigate("/products/new/product")}
        >
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {t("products.type_product")}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {t("products.type_product_desc")}
            </p>
          </div>
        </Card>

        <Card
          className="cursor-pointer hover:border-primary transition-colors flex flex-col items-center text-center p-8 space-y-4"
          onClick={() => navigate("/products/new/service")}
        >
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Wrench className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {t("products.type_service")}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {t("products.type_service_desc")}
            </p>
          </div>
        </Card>
      </div>

      <div className="flex justify-center mt-8">
        <GhostButton onClick={() => navigate(-1)}>
          {t("common.cancel")}
        </GhostButton>
      </div>
    </div>
  );
}
