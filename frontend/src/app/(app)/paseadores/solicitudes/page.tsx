"use client";

/**
 * Solicitudes de paseo (`/paseadores/solicitudes`): entrantes si eres paseador, las tuyas si eres cliente.
 * Espejo de `mobile/app/paseadores/solicitudes.tsx`.
 */
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import SearchBar from "@/components/SearchBar";
import FilterChip from "@/components/FilterChip";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import ServiceRequestCard from "@/features/servicios-pro/ServiceRequestCard";
import { STATUS_FILTERS } from "@/features/servicios-pro/requestStatus";
import { useWalkRequests } from "@/hooks/paseadores/useWalkRequests";
import s from "@/features/servicios-pro/servicios-pro.module.css";

export default function PaseadoresSolicitudesPage() {
  const router = useRouter();
  const {
    perspective, requests, counts, isLoading, statusFilter, setStatusFilter,
    searchQuery, setSearchQuery, updateStatus, updatingId,
  } = useWalkRequests();
  const isProvider = perspective === "provider";
  const filtering = !!searchQuery || statusFilter !== "all";

  return (
    <ScreenContainer>
      <ScreenHeader
        title={isProvider ? "Solicitudes de paseo" : "Mis solicitudes de paseo"}
        subtitle={isProvider ? "Acepta, inicia y completa los servicios" : "Sigue el estado de tus solicitudes"}
        module="paseadores"
      />

      <div className={s.filters}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Buscar por mascota o persona..." />
        <div className={s.chipsRow}>
          {STATUS_FILTERS.map((f) => (
            <FilterChip
              key={f.id}
              label={`${f.label} (${counts[f.id] || 0})`}
              active={statusFilter === f.id}
              onPress={() => setStatusFilter(f.id)}
            />
          ))}
        </div>
      </div>

      {isLoading ? (
        <SkeletonList count={3} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={28} />}
          title={filtering ? "Sin resultados" : "Sin solicitudes"}
          subtitle={
            filtering
              ? "No encontramos solicitudes con esos filtros."
              : isProvider
                ? "Cuando un cliente te solicite un servicio aparecerá aquí."
                : "Aún no has solicitado ningún servicio."
          }
          actionLabel={!isProvider && !filtering ? "Buscar profesionales" : filtering ? "Quitar filtros" : undefined}
          onAction={
            !isProvider && !filtering
              ? () => router.push("/paseadores")
              : filtering
                ? () => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }
                : undefined
          }
        />
      ) : (
        <div style={{ display: "grid", gap: "var(--space-md)", paddingBottom: "var(--space-xxl)" }}>
          {requests.map((item) => {
            const walkerId = "walker_id" in item ? item.walker_id : "";
            return (
            <ServiceRequestCard
              key={item.id}
              kind="walk"
              request={item}
              perspective={perspective}
              busy={updatingId === item.id}
              onStatus={(st) => updateStatus(item.id, st)}
              onOpenProfile={isProvider ? undefined : () => router.push(`/paseadores/${walkerId}`)}
              onReview={() => router.push(`/paseadores/${walkerId}`)}
            />
            );
          })}
        </div>
      )}
    </ScreenContainer>
  );
}
