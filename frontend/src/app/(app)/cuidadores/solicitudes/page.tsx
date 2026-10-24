"use client";

/**
 * Solicitudes de cuidado (`/cuidadores/solicitudes`): entrantes si eres cuidador, las tuyas si eres cliente.
 * Espejo de `mobile/app/cuidadores/solicitudes.tsx`.
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
import { useSitRequests } from "@/hooks/cuidadores/useSitRequests";
import s from "@/features/servicios-pro/servicios-pro.module.css";

export default function CuidadoresSolicitudesPage() {
  const router = useRouter();
  const {
    perspective, requests, counts, isLoading, statusFilter, setStatusFilter,
    searchQuery, setSearchQuery, updateStatus, updatingId,
  } = useSitRequests();
  const isProvider = perspective === "provider";
  const filtering = !!searchQuery || statusFilter !== "all";

  return (
    <ScreenContainer>
      <ScreenHeader
        title={isProvider ? "Solicitudes de cuidado" : "Mis solicitudes de cuidado"}
        subtitle={isProvider ? "Acepta, inicia y completa los servicios" : "Sigue el estado de tus solicitudes"}
        module="cuidadores"
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
              ? () => router.push("/cuidadores")
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
            const sitterId = "sitter_id" in item ? item.sitter_id : "";
            return (
            <ServiceRequestCard
              key={item.id}
              kind="sit"
              request={item}
              perspective={perspective}
              busy={updatingId === item.id}
              onStatus={(st) => updateStatus(item.id, st)}
              onOpenProfile={isProvider ? undefined : () => router.push(`/cuidadores/${sitterId}`)}
              onReview={() => router.push(`/cuidadores/${sitterId}`)}
            />
            );
          })}
        </div>
      )}
    </ScreenContainer>
  );
}
