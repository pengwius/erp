import { useEffect, useState, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useCompanies } from "@/hooks/useCompanies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Warehouse {
  id: number;
  company_id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
}

interface Stock {
  id: number;
  product_id: number;
  warehouse_id: number;
  location_code: string | null;
  physical_quantity: string;
  reserved_quantity: string;
  available_quantity: string;
}

export default function Stocks() {
  const { t } = useTranslation();
  const { activeCompanyId: selectedCompany, fetchCompanies } = useCompanies();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null,
  );

  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (!selectedCompany) {
      setIsLoadingWarehouses(false);
      return;
    }

    setIsLoadingWarehouses(true);

    Promise.all([
      invoke<Warehouse[]>("cmd_get_warehouses", { companyId: selectedCompany }),
      invoke<Product[]>("cmd_list_products", {
        companyId: selectedCompany,
        onlyActive: null,
        limit: null,
      }),
    ])
      .then(([fetchedWarehouses, fetchedProducts]) => {
        setWarehouses(fetchedWarehouses);
        setProducts(fetchedProducts);

        if (fetchedWarehouses.length > 0) {
          setSelectedWarehouseId(fetchedWarehouses[0].id);
        } else {
          setSelectedWarehouseId(null);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch initial data for stocks:", err);
      })
      .finally(() => {
        setIsLoadingWarehouses(false);
      });
  }, [selectedCompany]);

  useEffect(() => {
    if (!selectedCompany || !selectedWarehouseId) {
      setStocks([]);
      return;
    }

    setIsLoadingStocks(true);
    invoke<Stock[]>("cmd_get_stocks", {
      companyId: selectedCompany,
      warehouseId: selectedWarehouseId,
    })
      .then((data) => {
        setStocks(data);
      })
      .catch((err) => {
        console.error("Failed to fetch stocks:", err);
      })
      .finally(() => {
        setIsLoadingStocks(false);
      });
  }, [selectedCompany, selectedWarehouseId]);

  const productMap = useMemo(() => {
    const map = new Map<number, string>();
    products.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {t("stocks.title", "Stock Levels")}
        </h1>
      </div>

      <Card className="p-4 shadow-sm">
        {isLoadingWarehouses ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            {t("common.loading", "Loading...")}
          </div>
        ) : warehouses.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            {t("warehouses.no_warehouses", "No warehouses found.")}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label htmlFor="warehouse-select" className="text-sm font-medium">
                {t("stocks.select_warehouse", "Select Warehouse:")}
              </label>
              <Select
                value={selectedWarehouseId?.toString() || ""}
                onValueChange={(val) => setSelectedWarehouseId(Number(val))}
              >
                <SelectTrigger id="warehouse-select" className="w-64">
                  <SelectValue placeholder={t("common.select", "Select...")} />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id.toString()}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("stocks.product_name", "Product")}</TableHead>
                    <TableHead>
                      {t("stocks.location_code", "Location")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("stocks.physical", "Physical")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("stocks.reserved", "Reserved")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("stocks.available", "Available")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingStocks ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        {t("common.loading", "Loading...")}
                      </TableCell>
                    </TableRow>
                  ) : stocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        {t(
                          "stocks.no_stocks",
                          "No stocks found in this warehouse.",
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    stocks.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          {productMap.get(s.product_id) ||
                            `Unknown (${s.product_id})`}
                        </TableCell>
                        <TableCell>{s.location_code || "-"}</TableCell>
                        <TableCell className="text-right">
                          {s.physical_quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {s.reserved_quantity}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {s.available_quantity}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
