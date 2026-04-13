import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Company } from "../types/company";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<number | null>(() => {
    const saved = sessionStorage.getItem("activeCompanyId");
    return saved ? parseInt(saved, 10) : null;
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await invoke<Company[]>("cmd_list_companies");
      setCompanies(list || []);
      if (list && list.length > 0) {
        setActiveCompanyId((prev) => {
          if (prev && !list.find((c) => c.id === prev)) {
            sessionStorage.removeItem("activeCompanyId");
            return null;
          }
          return prev;
        });
      } else {
        setActiveCompanyId(null);
        sessionStorage.removeItem("activeCompanyId");
      }
      return list || [];
    } catch (e) {
      console.error(e);
      setError("Failed to load companies.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCompany = useCallback(
    async (payload: Partial<Company> & { id: number }) => {
      setSaving(true);
      setError(null);
      try {
        const updated = await invoke<Company>("cmd_update_company", {
          payload,
        });
        setCompanies((prev) => {
          const idx = prev.findIndex((p) => p.id === updated.id);
          const copy = [...prev];
          if (idx === -1) copy.unshift(updated);
          else copy[idx] = updated;
          return copy;
        });
        setSuccess("Saved.");
        setTimeout(() => setSuccess(null), 2000);
        return updated;
      } catch (e) {
        console.error(e);
        setError("Failed to save company.");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const switchCompany = useCallback((id: number) => {
    setActiveCompanyId(id);
    sessionStorage.setItem("activeCompanyId", id.toString());
  }, []);

  return {
    companies,
    activeCompanyId,
    switchCompany,
    loading,
    saving,
    error,
    success,
    setError,
    setSuccess,
    fetchCompanies,
    updateCompany,
  };
}
