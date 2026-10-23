"use client";

/**
 * Solicitudes recibidas (`/adopciones/solicitudes`). Espejo de `mobile/app/adopciones/solicitudes.tsx`.
 * Lista todas las solicitudes de mis publicaciones, con filtro por estado.
 */
import { useRouter } from "next/navigation";
import { Inbox, SearchX, Plus } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import FilterChip from "@/components/FilterChip";
import { Skeleton } from "@/components/Skeleton";
import RequestCard from "@/features/adopciones/RequestCard";
import { useApplications, REQUEST_FILTERS } from "@/hooks/adopciones/useApplications";

export default function SolicitudesPage() {
  const router = useRouter();
  const a = useApplications();
  const pending = a.countFor("PENDING");

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Solicitudes recibidas"
        subtitle={a.isLoading ? undefined : pending > 0 ? `${pending} por revisar` : `${a.total} en total`}
      />

      {a.total > 0 ? (
        <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap", marginBottom: "var(--space-lg)" }}>
          {REQUEST_FILTERS.map((f) => {
            const count = a.countFor(f.key);
            if (f.key !== "all" && count === 0 && a.filter !== f.key) return null;
            return (
              <FilterChip
                key={f.key}
                label={f.label}
                count={f.key === "all" ? undefined : count}
                active={a.filter === f.key}
                onPress={() => a.setFilter(f.key)}
              />
            );
          })}
        </div>
      ) : null}

      {a.isLoading ? (
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={120} borderRadius={16} />
          ))}
        </div>
      ) : a.requests.length === 0 ? (
        a.total > 0 ? (
          <EmptyState
            icon={<SearchX size={28} />}
            title="Nada en este filtro"
            subtitle="No hay solicitudes con este estado."
            actionLabel="Ver todas"
            onAction={() => a.setFilter("all")}
          />
        ) : a.hasListings ? (
          <EmptyState
            icon={<Inbox size={28} />}
            title="Aún no hay solicitudes"
            subtitle="Cuando alguien quiera adoptar a una de tus mascotas aparecerá aquí y te avisaremos."
          />
        ) : (
          <EmptyState
            icon={<Inbox size={28} />}
            title="No tienes mascotas publicadas"
            subtitle="Publica una mascota en adopción para empezar a recibir solicitudes."
            actionLabel="Dar en adopción"
            onAction={() => router.push("/adopciones/nuevo")}
          />
        )
      ) : (
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          {a.requests.map((item) => (
            <RequestCard
              key={item.request.id}
              request={item.request}
              petName={item.petName}
              onPress={() => router.push(`/adopciones/solicitud/${item.request.id}`)}
            />
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
