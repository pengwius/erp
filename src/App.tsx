import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Invoices } from "./pages/Invoices";
import Products from "./pages/Products";
import ProductForm from "./pages/products/ProductForm";
import { AppearanceSettings } from "./pages/settings/AppearanceSettings";
import { AdvancedSettings } from "./pages/settings/AdvancedSettings";
import { Onboarding } from "./pages/Onboarding";
import CompanySettings from "./pages/settings/company/CompanySettings";

export default function App() {
  return (
    <ThemeProvider><TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="products">
              <Route index element={<Products />} />
              <Route path="new" element={<ProductForm />} />
              <Route path=":id/edit" element={<ProductForm />} />
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
    </TooltipProvider></ThemeProvider>
  );
}
