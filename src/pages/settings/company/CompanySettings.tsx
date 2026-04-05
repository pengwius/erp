import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Check } from "lucide-react";
import { SettingsPageHeader } from "../../../components/settings/SettingsPageHeader";
import PrimaryButton from "../../../components/PrimaryButton";

type Company = {
  id: number;
  name: string;
  nip?: string | null;
  street?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  created_at?: string;
  ksef_connected?: boolean;
  ksef_metadata?: string | null;
};

export const CompanySettings = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [nip, setNip] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId != null) {
      const c = companies.find((x) => x.id === selectedId);
      if (c) populateForm(c);
    } else if (companies.length > 0) {
      setSelectedId(companies[0].id);
    }
  }, [companies, selectedId]);

  function populateForm(c: Company) {
    setName(c.name || "");
    setNip(c.nip || "");
    setStreet(c.street ?? "");
    setCity(c.city ?? "");
    setPostalCode(c.postal_code ?? "");
    setCountry(c.country ?? "");
  }

  async function fetchCompanies() {
    setLoading(true);
    setError(null);
    try {
      const list = await invoke<Company[]>("cmd_list_companies");
      setCompanies(list || []);
      if ((list || []).length > 0 && selectedId == null) {
        setSelectedId(list![0].id);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load companies.");
    } finally {
      setLoading(false);
    }
  }

  async function onSave() {
    if (!selectedId) {
      setError("No company selected.");
      return;
    }
    if (!name.trim()) {
      setError("Company name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        id: selectedId,
        name: name.trim(),
        nip: nip?.trim() || null,
        street: street?.trim() || null,
        city: city?.trim() || null,
        postal_code: postalCode?.trim() || null,
        country: country?.trim() || null,
      };
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
    } catch (e) {
      console.error(e);
      setError("Failed to save company.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto py-4">
      <SettingsPageHeader
        title="Company"
        description="Manage your company information."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: list */}
        <div className="col-span-1 bg-base-100 p-4 rounded-2xl border border-base-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Companies</h3>
          </div>

          {loading && (
            <div className="text-sm text-base-content/60">Loading…</div>
          )}

          {!loading && companies.length === 0 && (
            <div className="text-sm text-base-content/60">
              No companies found.
            </div>
          )}

          <ul className="mt-3 space-y-2">
            {companies.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    setSelectedId(c.id);
                    populateForm(c);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedId === c.id
                      ? "bg-primary/10 border border-primary"
                      : "hover:bg-base-200/50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-base-content/60">
                        {c.nip || c.street || "—"}
                      </div>
                    </div>
                    <div className="text-xs text-base-content/50">#{c.id}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: edit form */}
        <div className="col-span-2 bg-base-100 p-6 rounded-2xl border border-base-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Edit company</h2>
            </div>
          </div>

          {error && <div className="mb-4 text-sm text-error">{error}</div>}
          {success && (
            <div className="mb-4 text-sm text-success">{success}</div>
          )}

          {!selectedId ? (
            <div className="text-sm text-base-content/60">
              Select a company to edit.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSave();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm mb-1">Name</span>
                  <input
                    className="input input-bordered"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm mb-1">NIP</span>
                  <input
                    className="input input-bordered"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                  />
                </label>
              </div>

              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <label className="flex flex-col">
                    <span className="text-sm mb-1">Street</span>
                    <input
                      className="input input-bordered"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </label>

                  <label className="flex flex-col">
                    <span className="text-sm mb-1">City</span>
                    <input
                      className="input input-bordered"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </label>

                  <label className="flex flex-col">
                    <span className="text-sm mb-1">Postal code</span>
                    <input
                      className="input input-bordered"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </label>

                  <label className="flex flex-col md:col-span-2 lg:col-span-1">
                    <span className="text-sm mb-1">Country</span>
                    <input
                      className="input input-bordered"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <PrimaryButton
                  type="submit"
                  disabled={saving}
                  loading={saving}
                  loadingText="Saving..."
                  icon={<Check className="w-4 h-4" />}
                  iconPosition="right"
                  className="px-6 py-3"
                >
                  Save changes
                </PrimaryButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;
