import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Layout } from "./components/Layout";
import Customers from "./pages/Customers";
import CustomerForm from "./pages/customers/CustomerForm";
import { Dashboard } from "./pages/Dashboard";
import { Invoices } from "./pages/Invoices";
import Products from "./pages/Products";
import ProductForm from "./pages/products/ProductForm";
import ServiceProductForm from "./pages/products/service/ServiceProductForm";
import ProductTypeSelection from "./pages/products/ProductTypeSelection";
import { AppearanceSettings } from "./pages/settings/AppearanceSettings";
import { AdvancedSettings } from "./pages/settings/AdvancedSettings";
import { Onboarding } from "./pages/Onboarding";
import CompanySettings from "./pages/settings/company/CompanySettings";
import { CompanySelection } from "./pages/CompanySelection";
import Warehouses from "./pages/Warehouses";
import Stocks from "./pages/Stocks";
import WarehouseForm from "./pages/warehouses/WarehouseForm";
import StockDocuments from "./pages/StockDocuments";
import StockDocumentForm from "./pages/stock-documents/StockDocumentForm";

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="select-company" element={<CompanySelection />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="customers">
                <Route index element={<Customers />} />
                <Route path="new" element={<CustomerForm />} />
                <Route path=":id/edit" element={<CustomerForm />} />
              </Route>
              <Route path="products">
                <Route index element={<Products />} />
                <Route path="new" element={<ProductTypeSelection />} />
                <Route path="new/product" element={<ProductForm />} />
                <Route path="new/service" element={<ServiceProductForm />} />
                <Route path=":id/edit" element={<ProductForm />} />
                <Route
                  path=":id/edit/service"
                  element={<ServiceProductForm />}
                />
              </Route>
              <Route path="stocks" element={<Stocks />} />
              <Route path="stock-documents">
                <Route index element={<StockDocuments />} />
                <Route path="new" element={<StockDocumentForm />} />
              </Route>
              <Route path="warehouses">
                <Route index element={<Warehouses />} />
                <Route path="new" element={<WarehouseForm />} />
                <Route path=":id/edit" element={<WarehouseForm />} />
              </Route>
              <Route path="settings">
                <Route path="appearance" element={<AppearanceSettings />} />
                <Route path="company" element={<CompanySettings />} />
                <Route path="advanced" element={<AdvancedSettings />} />
                <Route index element={<AppearanceSettings />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
}
