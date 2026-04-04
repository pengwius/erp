import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Invoices } from "./pages/Invoices";
import { AppearanceSettings } from "./pages/settings/AppearanceSettings";
import { AdvancedSettings } from "./pages/settings/AdvancedSettings";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="settings">
              <Route path="appearance" element={<AppearanceSettings />} />
              <Route path="advanced" element={<AdvancedSettings />} />
              <Route index element={<AppearanceSettings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
