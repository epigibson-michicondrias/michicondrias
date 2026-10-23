"use client";

/**
 * Mis viajes (`/transportistas/mis-viajes`): activos e historial.
 * Espejo de `mobile/app/transportistas/mis-viajes.tsx`.
 */
import { useRouter } from "next/navigation";
import { AlertCircle, Car, Plus } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import RideCard from "../RideCard";
import { useMyRides } from "@/hooks/rides/useMyRides";
import l from "../transportistas.module.css";

export default function MisViajesPage() {
  const router = useRouter();
  const { filter, setFilter, rides, isLoading, isError, refetch } = useMyRides();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mis viajes"
        subtitle="Transporte de tus mascotas"
        actionIcon={Plus}
        actionLabel="Solicitar transporte"
        onAction={() => router.push("/transportistas/solicitar")}
      />

      <div className={l.chipsRow}>
        <button
          type="button"
          className={`${l.chip} ${filter === "active" ? l.chipActive : ""}`}
          aria-pressed={filter === "active"}
          onClick={() => setFilter("active")}
        >
          Activos
        </button>
        <button
          type="button"
          className={`${l.chip} ${filter === "history" ? l.chipActive : ""}`}
          aria-pressed={filter === "history"}
          onClick={() => setFilter("history")}
        >
          Historial
        </button>
      </div>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : isError && rides.length === 0 ? (
        <EmptyState
          icon={<AlertCircle size={28} />}
          title="No pudimos cargar tus viajes"
          subtitle="Revisa tu conexión e intenta de nuevo."
          actionLabel="Reintentar"
          onAction={refetch}
        />
      ) : rides.length === 0 ? (
        <EmptyState
          icon={<Car size={28} />}
          title={filter === "active" ? "No tienes viajes activos" : "Aún no tienes viajes en tu historial"}
          subtitle="Solicita un traslado seguro para tu mascota."
          actionLabel="Solicitar transporte"
          onAction={() => router.push("/transportistas/solicitar")}
        />
      ) : (
        <div className={l.list}>
          {rides.map((item) => (
            <RideCard
              key={item.id}
              ride={item}
              perspective="client"
              onPress={() => router.push(`/transportistas/tracking/${item.id}`)}
            />
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
