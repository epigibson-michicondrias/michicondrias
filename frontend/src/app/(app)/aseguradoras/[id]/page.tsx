"use client";

/**
 * Detalle de un plan de seguro. Espejo de `mobile/app/aseguradoras/[id].tsx`.
 */
import { useParams, useRouter } from "next/navigation";
import { Shield, Clock, DollarSign, CheckCircle, Calculator } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import SectionHeader from "@/components/SectionHeader";
import { Skeleton } from "@/components/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { getActivePlans } from "@/services/insurance";
import { formatCurrency, getSpeciesLabel } from "@/utils/formatters";
import local from "../aseguradoras.module.css";

export default function PlanDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["insurancePlans"],
    queryFn: getActivePlans,
  });
  const plan = plans.find((p) => p.id === id) ?? null;

  return (
    <ScreenContainer>
      <ScreenHeader title={plan?.name || "Plan de seguro"} subtitle="Detalle de cobertura" />

      {isLoading ? (
        <Skeleton height={240} borderRadius={16} />
      ) : !plan ? (
        <EmptyState
          icon={<Shield size={28} />}
          title="No encontramos ese plan"
          subtitle="Puede que ya no esté disponible. Elige otro en el catálogo."
          actionLabel="Ver planes"
          onAction={() => router.push("/aseguradoras")}
        />
      ) : (
        <>
          <Card>
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
                  <Badge label="Activo" color="var(--color-success)" icon={<CheckCircle size={12} aria-hidden />} />
                ) : null}
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
                {plan.allowed_species.map((s) => (
                  <Badge key={s} label={getSpeciesLabel(s)} color="var(--color-secondary)" />
                ))}
              </div>
            </div>
          </Card>

          <SectionHeader title="¿Qué sigue?" subtitle="Cotiza la prima real para tu mascota y contrata cuando estés listo." />

          <Button
            label="Cotizar este plan"
            onPress={() => router.push(`/aseguradoras/cotizar?plan_id=${plan.id}`)}
            icon={<Calculator size={18} />}
          />
        </>
      )}
    </ScreenContainer>
  );
}
