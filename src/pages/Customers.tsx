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

interface Customer {
  id: number;
  company_id: number;
  name: string;
  nip: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
}

export default function Customers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { companies, fetchCompanies } = useCompanies();
  const selectedCompany = companies.length > 0 ? companies[0].id : null;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (!selectedCompany) {
      setIsLoading(false);
      return;
    }
    invoke<Customer[]>("cmd_list_customers", { companyId: selectedCompany })
      .then((data) => {
        setCustomers(data);
      })
      .catch((err) => {
        console.error("Failed to fetch customers:", err);
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
      await invoke("cmd_delete_customer", { id });
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete customer", err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("customers.title")}</h1>
        <div className="flex items-center gap-3">
          <SoftPrimaryButton
            onClick={() => {
              navigate("/customers/new");
            }}
          >
            {t("customers.new_customer")}
          </SoftPrimaryButton>
        </div>
      </div>

      <Card className="p-4 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>{t("customers.name")}</TableHead>
                <TableHead>{t("customers.nip")}</TableHead>
                <TableHead>{t("customers.email")}</TableHead>
                <TableHead>{t("customers.phone")}</TableHead>
                <TableHead className="w-24 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    {t("customers.no_customers")}
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.id}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.nip || "-"}</TableCell>
                    <TableCell>{c.email || "-"}</TableCell>
                    <TableCell>{c.phone || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/customers/${c.id}/edit`)}
                        >
                          {t("common.edit")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(c.id)}
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
