"use client";

/**
 * Mis publicaciones de adopción (`/adopciones/mis-publicaciones`).
 * Espejo de `mobile/app/adopciones/mis-publicaciones.tsx`.
 */
import { Plus, Pencil, Trash2, PawPrint, Heart, MapPin, Inbox, RefreshCw } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import IconButton from "@/components/IconButton";
import Badge from "@/components/Badge";
import { SkeletonList } from "@/components/Skeleton";
import { MediaRow } from "@/features/tienda/SellerKit";
import { useMyListings } from "@/hooks/adopciones/useMyListings";
import type { Listing } from "@/types/adopciones";
import { capitalize, formatAge } from "@/utils/formatters";
import local from "@/features/adopciones/adopciones.module.css";

function statusBadge(item: Listing) {
  const status = item.status?.toLowerCase();
  if (status === "adoptado") return <Badge label="Adoptado" color="var(--color-accent)" size="sm" />;
  if (status === "en_proceso") return <Badge label="En proceso" color="var(--color-warning)" size="sm" />;
  if (!item.is_approved) return <Badge label="En revisión" color="var(--color-info)" size="sm" />;
  return <Badge label="Publicado" color="var(--color-success)" size="sm" />;
}

export default function MisPublicacionesPage() {
  const {
    listings, isLoading, isRefetching, refetch,
    goToNewListing, goToRequests, goToEditListing, handleDelete, deletingId,
  } = useMyListings();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mis publicaciones"
        subtitle={listings.length > 0 ? `${listings.length} ${listings.length === 1 ? "mascota" : "mascotas"}` : undefined}
        actions={[
          { icon: RefreshCw, label: "Actualizar", onPress: refetch, loading: isRefetching },
          { icon: Plus, label: "Dar en adopción", onPress: goToNewListing },
        ]}
      />

      {isLoading ? (
        <SkeletonList count={3} />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} />}
          title="No has publicado mascotas"
          subtitle="Si tienes un michi o lomito buscando hogar, publícalo y recibe solicitudes."
          actionLabel="Dar en adopción"
          onAction={goToNewListing}
        />
      ) : (
        <div className={local.list}>
          {listings.map((item) => {
            const adopted = item.status?.toLowerCase() === "adoptado";
            const lines = [
              {
                text: [capitalize(item.breed || item.species), item.age_months ? formatAge(item.age_months) : null]
                  .filter(Boolean)
                  .join(" · "),
              },
              ...(item.location ? [{ text: item.location, icon: MapPin }] : []),
              { text: "Ver solicitudes", icon: Inbox },
            ];
            return (
              <MediaRow
                key={item.id}
                imageUrl={item.photo_url}
                fallbackIcon={PawPrint}
                title={item.name}
                lines={lines}
                trailing={statusBadge(item)}
                onPress={() => goToRequests(item.id)}
                accessibilityLabel={`${item.name}: ver solicitudes`}
                actions={
                  adopted ? undefined : (
                    <>
                      <IconButton
                        icon={Pencil}
                        accessibilityLabel={`Editar ${item.name}`}
                        onPress={() => goToEditListing(item.id)}
                        size="sm"
                      />
                      <IconButton
                        icon={Trash2}
                        accessibilityLabel={`Eliminar la publicación de ${item.name}`}
                        onPress={() => handleDelete(item.id, item.name)}
                        loading={deletingId === item.id}
                        color="var(--color-error)"
                        size="sm"
                      />
                    </>
                  )
                }
              />
            );
          })}
        </div>
      )}
    </ScreenContainer>
  );
}
