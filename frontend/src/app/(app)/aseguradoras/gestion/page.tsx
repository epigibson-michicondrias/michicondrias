"use client";

/**
 * Gestión de planes (aseguradora) — ver y publicar/ocultar planes propios.
 * Espejo de `mobile/app/aseguradoras/gestion.tsx`.
 */
import { useRouter } from "next/navigation";
import { Shield, Clock, DollarSign, Plus, CheckCircle, EyeOff, ArrowLeft } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import RoleGuard from "@/components/RoleGuard";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useInsuranceAdmin } from "@/hooks/insurance/useInsuranceAdmin";
import { formatCurrency } from "@/utils/formatters";
import local from "../aseguradoras.module.css";

function speciesLabel(species: string) {
  if (species === "dog") return "Perro";
  if (species === "cat") return "Gato";
  return species;
}

function GestionContent() {
  const router = useRouter();
  const { plans, isLoadingPlans, isRefetching, refetchPlans, toggleActive } = useInsuranceAdmin();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Gestión de planes"
        subtitle="Administra tus planes de seguro"
        actions={[
          {
            icon: Plus,
            label: "Nuevo plan",
            onPress: () => router.push("/aseguradoras/nuevo"),
          },
        ]}
      />

      {isLoadingPlans ? (
        <SkeletonList count={3} />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={<Shield size={28} />}
          title="No hay planes registrados"
          subtitle="Crea tu primer plan de seguro"
          actionLabel="Crear plan"
          onAction={() => router.push("/aseguradoras/nuevo")}
        />
      ) : (
        <div className={local.list}>
          {plans.map((plan) => (
            <Card key={plan.id}>
              <div className={local.planCard}>
                <div className={local.planHeader}>
                  <span className={local.planIcon} aria-hidden>
                    <Shield size={22} />
                  </span>
                  <div className={local.planInfo}>
                    <p className={local.planName}>{plan.name}</p>
                    {plan.description ? <p className={local.planDesc}>{plan.description}</p> : null}
                  </div>
                  {plan.is_active ? (
                    <Badge
                      label="Publicado"
                      color="var(--color-success)"
                      icon={<CheckCircle size={12} aria-hidden />}
                    />
                  ) : (
                    <Badge
                      label="Oculto"
                      color="var(--color-text-muted)"
                      icon={<EyeOff size={12} aria-hidden />}
                    />
                  )}
                </div>

                <div className={local.statsRow}>
                  <div className={local.stat}>
                    <span className={local.statValue}>
                      <DollarSign size={14} aria-hidden />
                      {formatCurrency(plan.coverage_limit)}
                    </span>
                    <span className={local.statLabel}>Cobertura</span>
                  </div>
                  <div className={local.stat}>
                    <span className={local.statValue}>
                      <DollarSign size={14} aria-hidden />
                      {formatCurrency(plan.base_premium)}/mes
                    </span>
                    <span className={local.statLabel}>Prima</span>
                  </div>
                  <div className={local.stat}>
                    <span className={local.statValue}>
                      <Clock size={14} aria-hidden />
                      {plan.min_age}-{plan.max_age} años
                    </span>
                    <span className={local.statLabel}>Edad</span>
                  </div>
                </div>

                <div className={local.tagsRow}>
                  {plan.allowed_species.map((species) => (
                    <Badge key={species} label={speciesLabel(species)} color="var(--color-secondary)" />
                  ))}
                </div>

                <div className={local.rowActions}>
                  <Button
                    label={plan.is_active ? "Ocultar plan" : "Publicar plan"}
                    size="sm"
                    variant="secondary"
                    fullWidth={false}
                    onPress={() => toggleActive(plan.id, !plan.is_active)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ marginTop: "var(--space-xl)" }}>
        <Button
          label={isRefetching ? "Actualizando…" : "Actualizar lista"}
          variant="ghost"
          onPress={() => refetchPlans()}
          icon={<Clock size={18} />}
        />
      </div>

      <div style={{ marginTop: "var(--space-md)" }}>
        <Button
          label="Volver"
          variant="secondary"
          onPress={() => (window.history.length > 1 ? router.back() : router.replace("/aseguradoras"))}
          icon={<ArrowLeft size={18} />}
        />
      </div>
    </ScreenContainer>
  );
}

export default function GestionAseguradorasPage() {
  return (
    <RoleGuard roles={["aseguradora"]} message="Esta sección es para cuentas de aseguradora.">
      <GestionContent />
    </RoleGuard>
  );
}
