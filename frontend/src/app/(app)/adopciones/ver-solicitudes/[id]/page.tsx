"use client";

/**
 * Solicitudes de una publicación (`/adopciones/ver-solicitudes/[id]`).
 * Espejo de `mobile/app/adopciones/ver-solicitudes/[id].tsx`.
 */
import { Heart, RefreshCw } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import RequestCard from "@/features/adopciones/RequestCard";
import { useViewApplications } from "@/hooks/adopciones/useViewApplications";
import local from "@/features/adopciones/adopciones.module.css";

export default function VerSolicitudesPage() {
  const { requests, listing, isLoading, refetch, isRefetching, pendingCount, openRequest } = useViewApplications();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Solicitudes recibidas"
        subtitle={
          listing
            ? `${listing.name} · ${pendingCount > 0 ? `${pendingCount} por revisar` : `${requests.length} en total`}`
            : undefined
        }
        actions={[{ icon: RefreshCw, label: "Actualizar", onPress: refetch, loading: isRefetching }]}
      />

      {isLoading ? (
        <SkeletonList count={3} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} />}
          title="Aún no hay interesados"
          subtitle={`Las solicitudes que recibas para ${listing?.name || "esta mascota"} aparecerán aquí.`}
        />
      ) : (
        <div className={local.list}>
          {requests.map((item) => (
            <RequestCard key={item.id} request={item} onPress={() => openRequest(item.id)} />
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
