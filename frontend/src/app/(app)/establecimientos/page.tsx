"use client";

/**
 * Establecimientos — lista de locales con búsqueda y filtro de propios.
 * Espejo de `mobile/app/establecimientos/index.tsx`.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronRight, MapPin, Plus, Tag } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import FilterChip from "@/components/FilterChip";
import { Skeleton } from "@/components/Skeleton";
import { useVenues } from "@/hooks/venues/useVenues";
import { useAuth } from "@/contexts/AuthContext";
import local from "./establecimientos.module.css";

export default function EstablecimientosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isVenueOwner = user?.role_name === "establecimiento";
  const [onlyMine, setOnlyMine] = useState(false);
  const { venues: allVenues, isLoading, searchQuery, setSearchQuery, hasActiveFilters } = useVenues();

  const filteredVenues = onlyMine ? allVenues.filter((v) => v.owner_id === user?.id) : allVenues;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Establecimientos"
        subtitle="Encuentra los mejores lugares para tu mascota"
        showBack={false}
        actions={
          isVenueOwner
            ? [
                {
                  icon: Plus,
                  label: "Registrar establecimiento",
                  onPress: () => router.push("/establecimientos/nuevo"),
                },
              ]
            : undefined
        }
      />

      <div className={local.filters}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por nombre o dirección..."
        />
        {isVenueOwner && (
          <div className={local.chipsRow}>
            <FilterChip label="Todos" active={!onlyMine} onPress={() => setOnlyMine(false)} />
            <FilterChip label="Mis locales" active={onlyMine} onPress={() => setOnlyMine(true)} />
          </div>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={120} borderRadius={16} />
          ))}
        </div>
      ) : filteredVenues.length === 0 ? (
        <EmptyState
          icon={<Building2 size={28} />}
          title={
            hasActiveFilters
              ? "No encontramos establecimientos con esos criterios."
              : onlyMine
                ? "Aún no has registrado locales."
                : "No hay establecimientos disponibles."
          }
          subtitle={
            hasActiveFilters
              ? "Prueba con otra búsqueda."
              : isVenueOwner
                ? "Registra tu negocio pet-friendly para que los dueños te encuentren."
                : "Cuando un negocio se registre aparecerá aquí."
          }
          actionLabel={
            hasActiveFilters
              ? "Quitar búsqueda"
              : isVenueOwner && !onlyMine
                ? "Registrar establecimiento"
                : onlyMine
                  ? "Registrar establecimiento"
                  : undefined
          }
          onAction={
            hasActiveFilters
              ? () => setSearchQuery("")
              : isVenueOwner
                ? () => router.push("/establecimientos/nuevo")
                : undefined
          }
        />
      ) : (
        <div style={{ display: "grid", gap: "var(--space-md)", paddingBottom: "var(--space-xl)" }}>
          {filteredVenues.map((item) => {
            const amenityEntries = item.amenities ? Object.entries(item.amenities).slice(0, 3) : [];
            const hasDiscount = item.has_coupon || !!item.discount_coupon;
            return (
              <Card
                key={item.id}
                onPress={() => router.push(`/establecimientos/${item.id}`)}
                accessibilityLabel={`Ver ${item.name}`}
              >
                <div className={local.venueCard}>
                  <div className={local.venueHeader}>
                    <div className={local.iconContainer} aria-hidden>
                      <Building2 size={24} />
                    </div>
                    <div className={local.venueInfo}>
                      <p className={local.venueName}>{item.name}</p>
                      <p className={local.locationRow}>
                        <MapPin size={14} aria-hidden />
                        <span>{item.address}</span>
                      </p>
                    </div>
                    <div className={local.arrowButton} aria-hidden>
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  {amenityEntries.length > 0 && (
                    <div className={local.amenitiesContainer}>
                      {amenityEntries.map(([key, value]) => (
                        <span key={key} className={local.amenityTag}>
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}

                  {hasDiscount && (
                    <div className={local.discountBanner}>
                      <Tag size={14} aria-hidden />
                      {item.discount_coupon ? `Cupón: ${item.discount_coupon}` : "Cupón disponible"}
                      {item.discount_description ? (
                        <span className={local.discountDesc}>- {item.discount_description}</span>
                      ) : null}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </ScreenContainer>
  );
}
