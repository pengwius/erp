import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Building2,
  Sparkles,
  Rocket,
  CheckCircle2,
  Zap,
  Loader2,
} from "lucide-react";

import SoftPrimaryButton from "../components/PrimaryButton";

import { GhostButton } from "../components/PrimaryButton";
import InputField from "../components/InputField";

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>("");
  const [nip, setNip] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [country, setCountry] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submitCompany = async () => {
    setError(null);

    if (!name.trim()) {
      setError("Company name is required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        nip: nip.trim() || null,
        street: street.trim() || null,
        city: city.trim() || null,
        postal_code: postalCode.trim() || null,
        country: country.trim() || null,
      };

      await invoke("cmd_create_company", { payload });
      navigate("/");
    } catch (e) {
      console.error("Failed to create company", e);
      setError(
        typeof e === "string"
          ? e
          : e && (e as any).toString
            ? (e as any).toString()
            : "An error occurred while creating the company.",
      );
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    {
      id: 1,
      title: t("onboarding.step_welcome"),
      desc: t("onboarding.step_get_started"),
      icon: Sparkles,
    },
    {
      id: 2,
      title: t("onboarding.step_company"),
      desc: t("onboarding.step_company_details"),
      icon: Building2,
    },
    {
      id: 3,
      title: t("onboarding.step_ksef"),
      desc: t("onboarding.step_integrations"),
      icon: Zap,
    },
    {
      id: 4,
      title: t("onboarding.step_done"),
      desc: t("onboarding.step_summary"),
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-muted/50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-6xl bg-background rounded-[2.5rem] shadow-xl shadow-base-300/20 overflow-hidden border border-border flex flex-col lg:flex-row min-h-175">
        {/* Left Side */}
        <aside className="relative hidden lg:flex lg:w-[40%] bg-muted/30 p-12 flex-col justify-between overflow-hidden border-r border-border">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-8">
              <Rocket className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-4">
              {t("onboarding.welcome_title")}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t("onboarding.setup_desc")}
            </p>
          </div>

          {/* Vertical Stepper */}
          <div className="relative z-10 mt-12 flex-1">
            <div className="space-y-8">
              {stepsList.map((s, idx) => {
                const isActive = step === s.id;
                const isPast = step > s.id;

                return (
                  <div key={s.id} className="relative flex items-center gap-4">
                    {/* Connecting line */}
                    {idx !== stepsList.length - 1 && (
                      <div
                        className={`absolute left-4.5 top-10 w-0.5 h-12 -ml-px transition-colors duration-300 ${
                          isPast ? "bg-primary/50" : "bg-border/50"
                        }`}
                      />
                    )}

                    <div
                      className={`relative flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-300 z-10 ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground scale-110"
                          : isPast
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground/50"
                      }`}
                    >
                      {isPast ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-bold">{s.id}</span>
                      )}
                    </div>

                    <div
                      className={`transition-opacity duration-300 ${isActive || isPast ? "opacity-100" : "opacity-40"}`}
                    >
                      <div
                        className={`font-semibold ${isActive ? "text-primary" : "text-foreground"}`}
                      >
                        {s.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {s.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Side */}
        <main className="w-full lg:w-[60%] p-8 sm:p-12 lg:p-16 flex flex-col bg-background relative">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            {stepsList.map((s) => (
              <div
                key={s.id}
                className="flex-1 h-2 rounded-full bg-muted overflow-hidden"
              >
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: step >= s.id ? "100%" : "0%" }}
                />
              </div>
            ))}
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
            {step === 1 && (
              <div className="animate-fade-in space-y-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4 lg:hidden">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  {t("onboarding.get_started")}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {t("onboarding.get_started_desc")}
                </p>
                <div className="pt-8 flex flex-col sm:flex-row gap-4">
                  <SoftPrimaryButton
                    onClick={next}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    {t("onboarding.start_setup")}
                  </SoftPrimaryButton>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-6 w-full">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                    {t("onboarding.company_details")}
                  </h2>
                  <p className="text-muted-foreground">
                    {t("onboarding.company_details_desc")}
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <InputField
                    label={t("company.name")}
                    value={name}
                    onChange={setName}
                    placeholder="e.g. ACME Ltd."
                    required
                  />

                  <InputField
                    label={t("onboarding.tax_id")}
                    value={nip}
                    onChange={setNip}
                    placeholder="e.g. 1234567890"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <InputField
                      label={t("company.street")}
                      value={street}
                      onChange={setStreet}
                      placeholder="e.g. Flower St 1/2"
                    />
                    <InputField
                      label={t("company.city")}
                      value={city}
                      onChange={setCity}
                      placeholder="Warsaw"
                    />
                    <InputField
                      label={t("company.postal_code")}
                      value={postalCode}
                      onChange={setPostalCode}
                      placeholder="00-000"
                    />
                    <InputField
                      label={t("company.country")}
                      value={country}
                      onChange={setCountry}
                      placeholder="Poland"
                    />
                  </div>
                </div>

                <div className="pt-8 flex items-center justify-between">
                  <GhostButton onClick={back}>
                    <ArrowLeft className="w-4 h-4" /> {t("common.back")}
                  </GhostButton>
                  <SoftPrimaryButton
                    onClick={next}
                    disabled={!name.trim()}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    {t("common.next")}
                  </SoftPrimaryButton>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                    {t("onboarding.ksef_integration")}
                  </h2>
                  <p className="text-muted-foreground">
                    {t("onboarding.ksef_integration_desc")}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-muted/50 border border-border mt-6 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {t("onboarding.ksef_coming_soon")}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {t("onboarding.ksef_coming_soon_desc")}
                  </p>
                </div>

                <div className="pt-8 flex items-center justify-between">
                  <GhostButton onClick={back}>
                    <ArrowLeft className="w-4 h-4" /> {t("common.back")}
                  </GhostButton>
                  <SoftPrimaryButton
                    onClick={next}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    {t("onboarding.continue")}
                  </SoftPrimaryButton>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                    {t("onboarding.summary")}
                  </h2>
                  <p className="text-muted-foreground">
                    {t("onboarding.summary_desc")}
                  </p>
                </div>

                <div className="bg-muted/40 rounded-2xl p-6 border border-border space-y-4">
                  <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-3">
                    <div className="text-muted-foreground text-sm">
                      {t("company.name")}
                    </div>
                    <div className="col-span-2 font-medium text-right">
                      {name || "—"}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-3">
                    <div className="text-muted-foreground text-sm">
                      {t("onboarding.tax_id")}
                    </div>
                    <div className="col-span-2 font-medium text-right">
                      {nip || "—"}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-3">
                    <div className="text-muted-foreground text-sm">
                      {t("company.street")}
                    </div>
                    <div className="col-span-2 font-medium text-right">
                      {street || "—"}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-3">
                    <div className="text-muted-foreground text-sm">
                      {t("company.city")}
                    </div>
                    <div className="col-span-2 font-medium text-right">
                      {city || "—"}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-3">
                    <div className="text-muted-foreground text-sm">
                      {t("company.postal_code")}
                    </div>
                    <div className="col-span-2 font-medium text-right">
                      {postalCode || "—"}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-muted-foreground text-sm">
                      {t("company.country")}
                    </div>
                    <div className="col-span-2 font-medium text-right">
                      {country || "—"}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="pt-6 flex items-center justify-between">
                  <GhostButton onClick={back} disabled={loading}>
                    <ArrowLeft className="w-4 h-4" /> {t("common.back")}
                  </GhostButton>
                  {loading ? (
                    <SoftPrimaryButton
                      onClick={submitCompany}
                      disabled={loading}
                      icon={<Loader2 className="h-4 w-4 animate-spin" />}
                      iconPosition="left"
                    >
                      {t("common.creating")}
                    </SoftPrimaryButton>
                  ) : (
                    <SoftPrimaryButton
                      onClick={submitCompany}
                      disabled={loading}
                      icon={<Check className="w-4 h-4" />}
                      iconPosition="right"
                    >
                      {t("onboarding.finish_and_continue")}
                    </SoftPrimaryButton>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
