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
import SoftPrimaryButton from "@/components/PrimaryButton";
import { useCompanies } from "@/hooks/useCompanies";

interface StockDocument {
  id: number;
  company_id: number;
  document_type: string;
  document_number: string;
  source_warehouse_id: number | null;
  target_warehouse_id: number | null;
  issue_date: string;
  created_at: string;
}

interface Warehouse {
  id: number;
  name: string;
}

export default function StockDocuments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeCompanyId: selectedCompany, fetchCompanies } = useCompanies();
  const [documents, setDocuments] = useState<StockDocument[]>([]);
  const [warehousesMap, setWarehousesMap] = useState<Record<number, string>>({});
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

    Promise.all([
      invoke<StockDocument[]>("cmd_get_stock_documents", { companyId: selectedCompany }),
      invoke<Warehouse[]>("cmd_get_warehouses", { companyId: selectedCompany })
    ])
      .then(([docsData, whData]) => {
        setDocuments(docsData);

        const whMap: Record<number, string> = {};
        whData.forEach(wh => {
          whMap[wh.id] = wh.name;
        });
        setWarehousesMap(whMap);
      })
      .catch((err) => {
        console.error("Failed to fetch stock documents data:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedCompany]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {t("stock_documents.title", "Stock Documents")}
        </h1>
        <div className="flex items-center gap-3">
          <SoftPrimaryButton
            onClick={() => {
              navigate("/stock-documents/new");
            }}
          >
            {t("stock_documents.new_document", "New Document")}
          </SoftPrimaryButton>
        </div>
      </div>

      <Card className="p-4 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("stock_documents.issue_date", "Date")}</TableHead>
                <TableHead>{t("stock_documents.document_type", "Type")}</TableHead>
                <TableHead>{t("stock_documents.document_number", "Number")}</TableHead>
                <TableHead>{t("stock_documents.source_warehouse", "Source Warehouse")}</TableHead>
                <TableHead>{t("stock_documents.target_warehouse", "Target Warehouse")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    {t("common.loading", "Loading...")}
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    {t("stock_documents.no_documents", "No stock documents found.")}
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      {new Date(doc.issue_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{doc.document_type}</TableCell>
                    <TableCell>{doc.document_number}</TableCell>
                    <TableCell>
                      {doc.source_warehouse_id ? warehousesMap[doc.source_warehouse_id] || doc.source_warehouse_id : "-"}
                    </TableCell>
                    <TableCell>
                      {doc.target_warehouse_id ? warehousesMap[doc.target_warehouse_id] || doc.target_warehouse_id : "-"}
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
