"use client";

/**
 * Pet-friendly — lista de lugares con búsqueda y categorías.
 * Espejo de `mobile/app/petfriendly/index.tsx` (sin vista de mapa).
 */
import Image from "next/image";
import { MapPin, Plus, Star } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import FilterChip from "@/components/FilterChip";
import { Skeleton } from "@/components/Skeleton";
import { usePlaces } from "@/hooks/petfriendly/usePlaces";
import local from "./petfriendly.module.css";

export default function PetfriendlyPage() {
  const {
    places,
    isLoading,
    categories,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    hasActiveFilters,
    goToPlace,
    goToNewPlace,
  } = usePlaces();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Pet-friendly"
        subtitle="Lugares que aceptan mascotas"
        showBack={false}
        actionIcon={Plus}
        actionLabel="Agregar lugar"
        onAction={goToNewPlace}
      />

      <div className={local.filters}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Buscar lugares..." />
        {categories.length > 0 && (
          <div className={local.chipsRow}>
            <FilterChip label="Todos" active={!category} onPress={() => setCategory(null)} />
            {categories.map((c) => (
              <FilterChip
                key={c}
                label={c}
                active={category === c}
                onPress={() => setCategory(category === c ? null : c)}
              />
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={100} borderRadius={16} />
          ))}
        </div>
      ) : places.length === 0 ? (
        <EmptyState
          icon={<MapPin size={28} />}
          title={hasActiveFilters ? "Sin resultados" : "Aún no hay lugares"}
          subtitle={
            hasActiveFilters
              ? "Prueba con otra búsqueda o categoría."
              : "Sé el primero en agregar un lugar pet friendly con el botón +."
          }
          actionLabel={hasActiveFilters ? "Quitar filtros" : "Agregar lugar"}
          onAction={
            hasActiveFilters
              ? () => {
                  setSearchQuery("");
                  setCategory(null);
                }
              : goToNewPlace
          }
        />
      ) : (
        <div style={{ display: "grid", gap: "var(--space-md)", paddingBottom: "var(--space-xl)" }}>
          {places.map((item) => (
            <Card
              key={item.id}
              flush
              onPress={() => goToPlace(item.id)}
              accessibilityLabel={`${item.name}, ${item.category}`}
            >
              <div className={local.placeCard}>
                <div className={local.placeVisual}>
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      width={100}
                      height={100}
                      className={local.placePhoto}
                    />
                  ) : (
                    <div className={local.placeFallback}>
                      <MapPin size={28} aria-hidden />
                    </div>
                  )}
                </div>
                <div className={local.placeBody}>
                  <div className={local.placeTop}>
                    <p className={local.placeName}>{item.name}</p>
                    {item.rating > 0 && (
                      <span className={local.placeRating}>
                        <Star size={12} fill="var(--color-warning)" color="var(--color-warning)" aria-hidden />
                        {item.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className={local.placeCategory}>{item.category}</p>
                  {item.address ? (
                    <p className={local.placeAddress}>
                      <MapPin size={12} aria-hidden />
                      <span>{item.address}</span>
                    </p>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
