import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Company } from "../types/company";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
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
      return list || [];
    } catch (e) {
      console.error(e);
      setError("Failed to load companies.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCompany = useCallback(async (payload: Partial<Company> & { id: number }) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await invoke<Company>("cmd_update_company", { payload });
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
  }, []);

  return {
    companies,
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
