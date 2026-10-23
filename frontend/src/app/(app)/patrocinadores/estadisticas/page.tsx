"use client";

/**
 * Estadísticas de campañas (`/patrocinadores/estadisticas`).
 * Espejo de `mobile/app/patrocinadores/estadisticas.tsx`.
 */
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, DollarSign, Eye, Megaphone, MousePointerClick, Plus, TrendingUp } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import RoleGuard from "@/components/RoleGuard";
import { Skeleton, SkeletonList } from "@/components/Skeleton";
import { useCampaignStats } from "@/hooks/sponsors/useCampaignStats";
import s from "@/features/patrocinadores/patrocinadores.module.css";

const fmt = (n: number) => n.toLocaleString("es-MX");

export default function EstadisticasPage() {
  return (
    <RoleGuard roles={["patrocinador"]}>
      <Estadisticas />
    </RoleGuard>
  );
}

function Estadisticas() {
  const router = useRouter();
  const { campaigns, isLoading, metrics } = useCampaignStats();

  const tiles = [
    { icon: Eye, value: fmt(metrics.totalViews), label: "Vistas", color: "var(--color-info)" },
    { icon: MousePointerClick, value: fmt(metrics.totalClicks), label: "Clics", color: "var(--color-success)" },
    { icon: TrendingUp, value: `${metrics.averageCTR.toFixed(1)}%`, label: "Tasa de clics", color: "var(--color-warning)" },
    { icon: DollarSign, value: `$${fmt(metrics.totalSpent)}`, label: `Gastado de $${fmt(metrics.totalBudget)}`, color: "var(--color-primary)" },
  ];

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Estadísticas"
        subtitle="Métricas de tus campañas"
        actions={[{ icon: Plus, label: "Nueva campaña", onPress: () => router.push("/patrocinadores/nueva-campana") }]}
      />

      {isLoading ? (
        <>
          <div className={s.metricsGrid}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={110} borderRadius={16} />
            ))}
          </div>
          <SkeletonList count={3} />
        </>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<BarChart3 size={28} />}
          title="Aún no tienes campañas"
          subtitle="Crea tu primera campaña para ver aquí sus vistas y clics."
          actionLabel="Crear campaña"
          onAction={() => router.push("/patrocinadores/nueva-campana")}
        />
      ) : (
        <>
          <div className={s.metricsGrid}>
            {tiles.map(({ icon: Icon, value, label, color }) => (
              <div key={label} className={s.metric} style={{ "--c": color } as CSSProperties}>
                <span className={s.metricIcon}>
                  <Icon size={18} />
                </span>
                <span className={s.metricValue}>{value}</span>
                <span className={s.metricLabel}>{label}</span>
              </div>
            ))}
          </div>

          <div className={s.list}>
            {campaigns.map((c) => {
              const views = c.stats?.views_count ?? 0;
              const clicks = c.stats?.clicks_count ?? 0;
              const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";
              const used = c.budget_limit > 0 ? Math.round((c.spent / c.budget_limit) * 100) : 0;
              return (
                <Card key={c.id}>
                  <div className={s.campaign}>
                    <div className={s.campaignHead}>
                      <div className={s.iconBox}>
                        <Megaphone size={20} />
                      </div>
                      <div className={s.campaignInfo}>
                        <span className={s.campaignTitle}>{c.title}</span>
                      </div>
                      <Badge
                        label={c.active ? "Activa" : "Inactiva"}
                        color={c.active ? "var(--color-success)" : "var(--color-error)"}
                        size="sm"
                      />
                    </div>
                    <div className={s.miniStats}>
                      <div className={s.miniStat}>
                        <span className={s.miniValue}>{fmt(views)}</span>
                        <span className={s.miniLabel}>vistas</span>
                      </div>
                      <div className={s.miniStat}>
                        <span className={s.miniValue}>{fmt(clicks)}</span>
                        <span className={s.miniLabel}>clics</span>
                      </div>
                      <div className={s.miniStat}>
                        <span className={s.miniValue}>{ctr}%</span>
                        <span className={s.miniLabel}>tasa de clics</span>
                      </div>
                    </div>
                    <div className={s.budgetRow}>
                      <span>
                        ${fmt(c.spent)} / ${fmt(c.budget_limit)}
                      </span>
                      <span className={s.budgetPercent}>{used}%</span>
                    </div>
                    <div
                      className={s.track}
                      role="progressbar"
                      aria-valuenow={Math.min(used, 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Presupuesto usado"
                    >
                      <div className={s.bar} style={{ width: `${Math.min(used, 100)}%` }} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </ScreenContainer>
  );
}
