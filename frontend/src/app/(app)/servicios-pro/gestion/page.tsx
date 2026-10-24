"use client";

/**
 * Mis tareas (`/servicios-pro/gestion`): solicitudes entrantes del paseador o cuidador.
 * Espejo de `mobile/app/servicios-pro/gestion.tsx`.
 */
import { useRouter } from "next/navigation";
import { ClipboardList, User } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import FilterChip from "@/components/FilterChip";
import RoleGuard from "@/components/RoleGuard";
import { SkeletonList } from "@/components/Skeleton";
import ServiceRequestCard from "@/features/servicios-pro/ServiceRequestCard";
import { STATUS_FILTERS } from "@/features/servicios-pro/requestStatus";
import { useServiceManagement } from "@/hooks/servicios-pro/useServiceManagement";
import s from "@/features/servicios-pro/servicios-pro.module.css";

export default function ServiceManagementPage() {
  return (
    <RoleGuard roles={["paseador", "cuidador"]}>
      <ServiceManagement />
    </RoleGuard>
  );
}

function ServiceManagement() {
  const router = useRouter();
  const { kind, filter, setFilter, pending, active, filtered, isLoading, updatingId, updateStatus } =
    useServiceManagement();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mis tareas"
        subtitle={kind === "walk" ? "Solicitudes de paseo" : "Solicitudes de cuidado"}
        module={kind === "walk" ? "paseadores" : "cuidadores"}
        actions={[{ icon: User, label: "Mi perfil profesional", onPress: () => router.push("/servicios-pro/perfil") }]}
      />

      <div className={s.statsRow}>
        <div className={s.statBlock}>
          <span className={s.statNumber}>{pending}</span>
          <span className={s.statLabel}>Pendientes</span>
        </div>
        <div className={s.statDivider} />
        <div className={s.statBlock}>
          <span className={s.statNumber}>{active}</span>
          <span className={s.statLabel}>Por atender</span>
        </div>
      </div>

      <div className={s.chipsRow}>
        {STATUS_FILTERS.map((f) => (
          <FilterChip key={f.id} label={f.label} active={filter === f.id} onPress={() => setFilter(f.id)} />
        ))}
      </div>

      {isLoading ? (
        <SkeletonList count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={28} />}
          title="Sin solicitudes"
          subtitle={
            filter === "all"
              ? "Cuando un cliente te solicite un servicio aparecerá aquí."
              : "No hay solicitudes en esta categoría."
          }
          actionLabel={filter === "all" ? undefined : "Ver todas"}
          onAction={filter === "all" ? undefined : () => setFilter("all")}
        />
      ) : (
        <div style={{ display: "grid", gap: "var(--space-md)", paddingBottom: "var(--space-xxl)" }}>
          {filtered.map((item) => (
            <ServiceRequestCard
              key={item.id}
              kind={kind}
              request={item}
              perspective="provider"
              busy={updatingId === item.id}
              onStatus={(st) => updateStatus(item.id, st)}
            />
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
