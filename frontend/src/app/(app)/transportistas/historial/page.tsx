"use client";

/**
 * Historial de viajes del conductor (`/transportistas/historial`).
 * Espejo de `mobile/app/transportistas/historial.tsx`.
 */
import { AlertCircle, DollarSign, Navigation, Star, TrendingUp } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import RoleGuard from "@/components/RoleGuard";
import { SkeletonList } from "@/components/Skeleton";
import RideCard, { formatMoney } from "../RideCard";
import { useDriverHistory } from "@/hooks/rides/useDriverHistory";
import l from "../transportistas.module.css";

function HistorialContent() {
  const { totalEarnings, ridesCount, ratingAvg, ratingCount, rides, isLoading, isError, refetch, router } =
    useDriverHistory();

  const stats = [
    {
      icon: DollarSign,
      color: "var(--color-primary)",
      value: formatMoney(totalEarnings),
      label: "Ganancias totales",
    },
    { icon: TrendingUp, color: "var(--color-success)", value: String(ridesCount), label: "Viajes realizados" },
    {
      icon: Star,
      color: "var(--color-accent)",
      value: ratingAvg != null ? ratingAvg.toFixed(1) : "—",
      label: ratingCount ? `${ratingCount} calificaciones` : "Sin calificaciones",
    },
  ];

  return (
    <ScreenContainer>
      <ScreenHeader title="Historial" subtitle="Tus viajes completados" />

      {isLoading ? (
        <SkeletonList count={4} />
      ) : (
        <>
          {!isError ? (
            <div className={l.statsRow}>
              {stats.map((s) => (
                <Card key={s.label} style={{ padding: "var(--space-md)" }}>
                  <div className={l.statCard}>
                    <div className={l.statIcon} style={{ background: `color-mix(in srgb, ${s.color} 14%, transparent)`, color: s.color }}>
                      <s.icon size={18} />
                    </div>
                    <p className={l.statValue}>{s.value}</p>
                    <p className={l.statLabel}>{s.label}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : null}

          {isError && rides.length === 0 ? (
            <EmptyState
              icon={<AlertCircle size={28} />}
              title="No pudimos cargar tu historial"
              subtitle="Revisa tu conexión e intenta de nuevo."
              actionLabel="Reintentar"
              onAction={refetch}
            />
          ) : rides.length === 0 ? (
            <EmptyState
              icon={<Navigation size={28} />}
              title="Sin viajes aún"
              subtitle="Cuando completes viajes, aparecerán aquí."
              actionLabel="Ver solicitudes"
              onAction={() => router.push("/transportistas/solicitudes")}
            />
          ) : (
            <div className={l.list}>
              {rides.map((item) => (
                <RideCard
                  key={item.id}
                  ride={item}
                  perspective="driver"
                  onPress={() => router.push(`/transportistas/tracking/${item.id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </ScreenContainer>
  );
}

export default function HistorialConductorPage() {
  return (
    <RoleGuard roles={["transportista"]} message="El historial de viajes es para cuentas de transportista.">
      <HistorialContent />
    </RoleGuard>
  );
}
