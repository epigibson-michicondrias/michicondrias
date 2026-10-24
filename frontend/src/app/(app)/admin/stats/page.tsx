"use client";

/**
 * Analíticas de la plataforma (`/admin/stats`): cifras de usuarios, registros de los últimos 14 días y distribución
 * por rol. Espejo de `mobile/app/admin/stats.tsx`. Solo muestra lo que devuelve `/analytics/dashboard`.
 */
import type { CSSProperties } from "react";
import {
  Activity, BarChart3, RefreshCw, ShieldAlert, ShieldCheck, ShieldX, TrendingUp, UserMinus, Users, Briefcase, Crown,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { StatTile } from "@/features/admin/AdminKit";
import { useAdminStats } from "@/hooks/admin/useAdminStats";
import { getRoleColorFor, getRoleLabelFor } from "@/constants/roles";
import s from "@/features/admin/admin.module.css";

const DAY_FMT = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" });

/** "2026-10-23" → fecha local (sin desfase de zona horaria). */
function parseDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function StatsSkeleton() {
  return (
    <div className={s.content} role="status" aria-label="Cargando">
      <div className={s.tiles}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={s.tile}>
            <Skeleton width={20} height={20} borderRadius={6} />
            <Skeleton width="40%" height={22} />
            <Skeleton width="70%" height={12} />
          </div>
        ))}
      </div>
      <div className={s.card}>
        <Skeleton width="40%" height={16} />
        <Skeleton height={140} borderRadius={12} />
      </div>
      <div className={s.card}>
        <Skeleton width="40%" height={16} />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} height={12} />
        ))}
      </div>
    </div>
  );
}

export default function AdminStatsPage() {
  const { kpis, isLoading, refetch, isRefetching, roleRows, registrations, maxRegistrations, totalRegistrations } =
    useAdminStats();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Analíticas"
        subtitle="Crecimiento y composición de la comunidad"
        actions={[{ icon: RefreshCw, label: "Actualizar cifras", onPress: () => refetch(), loading: isRefetching }]}
      />

      {isLoading ? (
        <StatsSkeleton />
      ) : !kpis ? (
        <EmptyState
          icon={<BarChart3 size={48} strokeWidth={1} />}
          title="No hay cifras para mostrar"
          subtitle="No pudimos obtener las métricas de la plataforma."
          actionLabel="Reintentar"
          onAction={() => refetch()}
        />
      ) : (
        <div className={s.content}>
          <section className={s.section}>
            <h2 className={s.sectionTitle}>Usuarios</h2>
            <div className={s.tiles}>
              <StatTile icon={Users} value={kpis.total_users} label="Usuarios registrados" color="var(--color-info)" href="/admin/usuarios" />
              {kpis.active_users !== undefined && (
                <StatTile icon={Activity} value={kpis.active_users} label="Cuentas activas" color="var(--color-success)" />
              )}
              {kpis.inactive_users !== undefined && (
                <StatTile icon={UserMinus} value={kpis.inactive_users} label="Cuentas desactivadas" color="var(--color-text-muted)" />
              )}
              {kpis.professionals !== undefined && (
                <StatTile icon={Briefcase} value={kpis.professionals} label="Profesionales" color="var(--color-secondary)" />
              )}
              {kpis.new_users_7d !== undefined && (
                <StatTile icon={TrendingUp} value={kpis.new_users_7d} label="Nuevos en 7 días" color="var(--color-accent)" />
              )}
              {kpis.new_users_30d !== undefined && (
                <StatTile icon={TrendingUp} value={kpis.new_users_30d} label="Nuevos en 30 días" color="var(--color-primary)" />
              )}
              <StatTile icon={Crown} value={kpis.system_admins} label="Administradores" color="var(--color-warning)" />
            </div>
          </section>

          <section className={s.section}>
            <h2 className={s.sectionTitle}>Verificación de identidad</h2>
            <div className={s.tiles}>
              <StatTile icon={ShieldAlert} value={kpis.pending_verifications} label="Por revisar" color="var(--color-warning)" href="/admin/verificaciones" />
              <StatTile icon={ShieldCheck} value={kpis.approved_verifications} label="Verificadas" color="var(--color-success)" />
              {kpis.rejected_verifications !== undefined && (
                <StatTile icon={ShieldX} value={kpis.rejected_verifications} label="Rechazadas" color="var(--color-error)" />
              )}
            </div>
          </section>

          <div className={s.grid2}>
            {registrations.length > 0 && (
              <section className={s.card} aria-labelledby="reg-title">
                <div className={s.chartHead}>
                  <h2 id="reg-title" className={s.cardTitle}>Registros de los últimos 14 días</h2>
                  <span className={s.muted}>{totalRegistrations} en total</span>
                </div>
                <div className={s.chart} role="list">
                  {registrations.map((r) => {
                    const day = parseDay(r.date);
                    const label = `${DAY_FMT.format(day)}: ${r.count} ${r.count === 1 ? "registro" : "registros"}`;
                    return (
                      <div key={r.date} className={s.chartCol} role="listitem" title={label} aria-label={label}>
                        <div className={s.chartStack}>
                          <span className={s.chartValue}>{r.count || ""}</span>
                          <div
                            className={`${s.chartBar} ${s.chartBarAccent}`}
                            style={{ height: `${(r.count / maxRegistrations) * 85}%` }}
                          />
                        </div>
                        <span className={s.chartLabel}>{day.getDate()}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className={s.card} aria-labelledby="roles-title">
              <div className={s.chartHead}>
                <h2 id="roles-title" className={s.cardTitle}>Usuarios por rol</h2>
                <span className={s.muted}>% del total</span>
              </div>
              {roleRows.length === 0 ? (
                <p className={s.muted}>Todavía no hay usuarios con rol asignado.</p>
              ) : (
                <div className={s.distList}>
                  {roleRows.map((r) => (
                    <div
                      key={r.role}
                      className={s.distRow}
                      style={{ "--c": getRoleColorFor(r.role) } as CSSProperties}
                      title={`${getRoleLabelFor(r.role)}: ${r.count} (${r.pct.toFixed(1)} %)`}
                    >
                      <span className={s.distLabel}>{getRoleLabelFor(r.role)}</span>
                      <div className={s.bar} role="progressbar" aria-valuenow={Math.round(r.pct)} aria-valuemin={0} aria-valuemax={100} aria-label={getRoleLabelFor(r.role)}>
                        <div className={s.barFill} style={{ width: `${Math.max(r.pct, 2)}%` }} />
                      </div>
                      <span className={s.distCount}>{r.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </ScreenContainer>
  );
}
