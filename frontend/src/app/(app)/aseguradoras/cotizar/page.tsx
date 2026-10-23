"use client";

/**
 * Cotizar Seguro — calcula la prima y contrata un plan.
 * Espejo de `mobile/app/aseguradoras/cotizar.tsx`. Acepta `?plan_id=` y `?pet_id=`.
 */
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Shield, CheckCircle, Calculator, CreditCard, PawPrint } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import FormSection from "@/components/forms/FormSection";
import FormSelect from "@/components/forms/FormSelect";
import FormSwitch from "@/components/forms/FormSwitch";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useQuote } from "@/hooks/insurance/useQuote";
import { formatCurrency, getSpeciesLabel } from "@/utils/formatters";
import local from "../aseguradoras.module.css";

function CotizarContent() {
  const router = useRouter();
  const {
    plans,
    pets,
    quote,
    selectedPetId,
    selectedPlanId,
    selectedPlan,
    hasPreexisting,
    isLoading,
    isCalculating,
    isSubscribing,
    setSelectedPetId,
    setSelectedPlanId,
    setHasPreexisting,
    handleCalculateQuote,
    handleSubscribe,
  } = useQuote();

  const petOptions = pets.map((p) => ({ label: p.name, value: p.id }));
  const planOptions = plans.map((p) => ({ label: p.name, value: p.id }));

  return (
    <ScreenContainer>
      <ScreenHeader title="Cotizar Seguro" subtitle="Calcula y contrata el mejor plan" />

      {isLoading ? (
        <>
          <Skeleton height={120} borderRadius={16} />
          <Skeleton height={180} borderRadius={16} />
        </>
      ) : plans.length === 0 || pets.length === 0 ? (
        <EmptyState
          icon={<Shield size={28} />}
          title={pets.length === 0 ? "No tienes mascotas registradas" : "No hay planes disponibles"}
          subtitle={
            pets.length === 0
              ? "Registra una mascota para poder asegurarla."
              : "Cuando una aseguradora publique un plan aparecerá aquí."
          }
          actionLabel={pets.length === 0 ? "Registrar mascota" : "Ver planes"}
          onAction={() => router.push(pets.length === 0 ? "/mascotas" : "/aseguradoras")}
        />
      ) : (
        <>
          <FormSection title="Datos para la cotización">
            {petOptions.length > 0 ? (
              <FormSelect
                label="Mascota *"
                options={petOptions}
                value={selectedPetId || ""}
                onChange={setSelectedPetId}
              />
            ) : null}
            {planOptions.length > 0 ? (
              <FormSelect
                label="Plan *"
                options={planOptions}
                value={selectedPlanId || ""}
                onChange={setSelectedPlanId}
              />
            ) : null}
            <FormSwitch
              label="Condiciones preexistentes"
              description="La mascota ya tiene diagnósticos o tratamientos previos"
              value={hasPreexisting}
              onChange={setHasPreexisting}
            />
          </FormSection>

          {selectedPlan ? (
            <Card>
              <div className={local.planCard}>
                <div className={local.planHeader}>
                  <span className={local.planIcon} aria-hidden>
                    <Shield size={22} />
                  </span>
                  <div className={local.planInfo}>
                    <p className={local.planName}>{selectedPlan.name}</p>
                    {selectedPlan.description ? (
                      <p className={local.planDesc}>{selectedPlan.description}</p>
                    ) : (
                      <p className={local.planDesc}>Sin descripción</p>
                    )}
                  </div>
                </div>
                <div className={local.statsRow}>
                  <div className={local.stat}>
                    <span className={local.statValue}>{formatCurrency(selectedPlan.coverage_limit)}</span>
                    <span className={local.statLabel}>Cobertura</span>
                  </div>
                  <div className={local.stat}>
                    <span className={local.statValue}>{formatCurrency(selectedPlan.base_premium)}/mes</span>
                    <span className={local.statLabel}>Prima base</span>
                  </div>
                  <div className={local.stat}>
                    <span className={local.statValue}>
                      {selectedPlan.min_age}-{selectedPlan.max_age} años
                    </span>
                    <span className={local.statLabel}>Edad</span>
                  </div>
                </div>
                <div className={local.tagsRow}>
                  {selectedPlan.allowed_species.map((s) => (
                    <Badge key={s} label={getSpeciesLabel(s)} color="var(--color-secondary)" />
                  ))}
                </div>
              </div>
            </Card>
          ) : null}

          {quote ? (
            <div className={local.quoteResult}>
              <p className={local.quoteAmount}>{formatCurrency(quote.calculated_premium)}/mes</p>
              <p className={local.quoteMeta}>
                Cobertura hasta {formatCurrency(quote.coverage_limit)} · Edad {quote.pet_age} años ·{" "}
                {getSpeciesLabel(quote.pet_species)}
              </p>
            </div>
          ) : null}

          <div className={local.rowActions}>
            {!quote ? (
              <Button
                label={isCalculating ? "Calculando…" : "Calcular cotización"}
                onPress={handleCalculateQuote}
                loading={isCalculating}
                disabled={!selectedPetId || !selectedPlanId}
                icon={<Calculator size={18} />}
              />
            ) : (
              <Button
                label={isSubscribing ? "Contratando…" : "Contratar plan"}
                onPress={handleSubscribe}
                loading={isSubscribing}
                icon={<CreditCard size={18} />}
              />
            )}
          </div>

          <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            <PawPrint size={14} aria-hidden /> Al contratar, tu mascota quedará asegurada de inmediato.
            {quote ? " Revisa el monto antes de confirmar." : ""}
          </p>
        </>
      )}

      {quote ? (
        <div style={{ marginTop: "0.75rem" }}>
          <Badge
            label="Cotización lista"
            color="var(--color-success)"
            icon={<CheckCircle size={12} aria-hidden />}
          />
        </div>
      ) : null}
    </ScreenContainer>
  );
}

export default function CotizarPage() {
  return (
    <Suspense
      fallback={
        <ScreenContainer>
          <ScreenHeader title="Cotizar Seguro" subtitle="Protege a tu mascota" />
          <Skeleton height={120} borderRadius={16} />
        </ScreenContainer>
      }
    >
      <CotizarContent />
    </Suspense>
  );
}
