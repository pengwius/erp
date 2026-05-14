import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Company } from "../types/company";

let globalActiveCompanyId: number | null = (() => {
  const saved = sessionStorage.getItem("activeCompanyId");
  return saved ? parseInt(saved, 10) : null;
})();

const listeners = new Set<() => void>();

function setGlobalActiveCompanyId(id: number | null) {
  globalActiveCompanyId = id;
  if (id === null) {
    sessionStorage.removeItem("activeCompanyId");
  } else {
    sessionStorage.setItem("activeCompanyId", id.toString());
  }
  listeners.forEach((listener) => listener());
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<number | null>(
    globalActiveCompanyId,
  );

  useEffect(() => {
    const listener = () => setActiveCompanyId(globalActiveCompanyId);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
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
        if (
          globalActiveCompanyId &&
          !list.find((c) => c.id === globalActiveCompanyId)
        ) {
          setGlobalActiveCompanyId(null);
        }
      } else {
        setGlobalActiveCompanyId(null);
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
    setGlobalActiveCompanyId(id);
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
