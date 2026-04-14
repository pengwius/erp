import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SoftPrimaryButton from "@/components/PrimaryButton";
import { useCompanies } from "@/hooks/useCompanies";

interface Warehouse {
  id: number;
  company_id: number;
  name: string;
  location_code_prefix: string | null;
  created_at: string;
}

export default function Warehouses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeCompanyId: selectedCompany, fetchCompanies } = useCompanies();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (!selectedCompany) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    invoke<Warehouse[]>("cmd_get_warehouses", { companyId: selectedCompany })
      .then((data) => {
        setWarehouses(data);
      })
      .catch((err) => {
        console.error("Failed to fetch warehouses:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedCompany]);

  async function handleDelete(id: number) {
    if (
      !window.confirm(
        t("common.confirm_delete", "Are you sure you want to delete this?"),
      )
    )
      return;
    try {
      await invoke("cmd_delete_warehouse", { id });
      setWarehouses((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error("Failed to delete warehouse", err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {t("warehouses.title", "Warehouses")}
        </h1>
        <div className="flex items-center gap-3">
          <SoftPrimaryButton
            onClick={() => {
              navigate("/warehouses/new");
            }}
          >
            {t("warehouses.new_warehouse", "New Warehouse")}
          </SoftPrimaryButton>
        </div>
      </div>

      <Card className="p-4 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">{t("common.id", "ID")}</TableHead>
                <TableHead>{t("warehouses.name", "Name")}</TableHead>
                <TableHead>
                  {t("warehouses.location_code_prefix", "Location Prefix")}
                </TableHead>
                <TableHead className="w-24 text-right">
                  {t("common.actions", "Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    {t("common.loading", "Loading...")}
                  </TableCell>
                </TableRow>
              ) : warehouses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    {t("warehouses.no_warehouses", "No warehouses found.")}
                  </TableCell>
                </TableRow>
              ) : (
                warehouses.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{w.id}</TableCell>
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell>{w.location_code_prefix || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/warehouses/${w.id}/edit`)}
                        >
                          {t("common.edit", "Edit")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(w.id)}
                        >
                          {t("common.delete", "Delete")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
