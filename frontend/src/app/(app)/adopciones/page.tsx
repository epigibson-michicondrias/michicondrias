"use client";

/**
 * Adopciones — listado de mascotas en adopción con filtros.
 * Espejo de `mobile/app/adopciones/index.tsx`.
 */
import { useRouter } from "next/navigation";
import { Heart, LayoutGrid, List, Plus, FolderHeart, ClipboardList } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import FilterChip from "@/components/FilterChip";
import { Skeleton } from "@/components/Skeleton";
import ListingCard from "@/features/adopciones/ListingCard";
import { useListings } from "@/hooks/adopciones/useListings";
import local from "@/features/adopciones/adopciones.module.css";

export default function AdopcionesPage() {
  const router = useRouter();
  const {
    listings,
    isLoading,
    search,
    setSearch,
    speciesFilter,
    setSpeciesFilter,
    sizeFilter,
    setSizeFilter,
    viewMode,
    setViewMode,
    hasActiveFilters,
  } = useListings();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Adopciones"
        subtitle="Encuentra a tu nuevo mejor amigo"
        showBack={false}
        actions={[
          {
            icon: ClipboardList,
            label: "Mis solicitudes para adoptar",
            onPress: () => router.push("/adopciones/mis-solicitudes"),
          },
          {
            icon: FolderHeart,
            label: "Solicitudes recibidas",
            onPress: () => router.push("/adopciones/solicitudes"),
          },
          {
            icon: Plus,
            label: "Dar en adopción",
            onPress: () => router.push("/adopciones/nuevo"),
          },
        ]}
      />

      <div className={local.filters}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Busca por nombre, raza..." />
        <div className={local.chipsRow}>
          <FilterChip
            label="Todos"
            active={speciesFilter === "all" && sizeFilter === "all"}
            onPress={() => {
              setSpeciesFilter("all");
              setSizeFilter("all");
            }}
          />
          <FilterChip
            label="Perros"
            active={speciesFilter === "perro"}
            onPress={() => setSpeciesFilter(speciesFilter === "perro" ? "all" : "perro")}
          />
          <FilterChip
            label="Gatos"
            active={speciesFilter === "gato"}
            onPress={() => setSpeciesFilter(speciesFilter === "gato" ? "all" : "gato")}
          />
          <FilterChip
            label="Grandes"
            active={sizeFilter === "grande"}
            onPress={() => setSizeFilter(sizeFilter === "grande" ? "all" : "grande")}
          />
        </div>
      </div>

      {isLoading ? (
        <div className={local.grid}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={240} borderRadius={16} />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} />}
          title={hasActiveFilters ? "Sin resultados" : "Aún no hay mascotas en adopción"}
          subtitle={
            hasActiveFilters
              ? "Prueba con otra búsqueda o quita los filtros."
              : "Cuando un refugio publique una mascota aparecerá aquí."
          }
          actionLabel={hasActiveFilters ? "Quitar filtros" : "Dar en adopción"}
          onAction={
            hasActiveFilters
              ? () => {
                  setSearch("");
                  setSpeciesFilter("all");
                  setSizeFilter("all");
                }
              : () => router.push("/adopciones/nuevo")
          }
        />
      ) : (
        <>
          <div className={local.toolbar}>
            <p className={local.count}>
              {listings.length} {listings.length === 1 ? "mascota" : "mascotas"}
            </p>
            <div className={local.viewToggle} role="group" aria-label="Modo de vista">
              <button
                type="button"
                className={`${local.viewBtn} ${viewMode === "grid" ? local.viewBtnActive : ""}`}
                onClick={() => setViewMode("grid")}
                aria-label="Ver en cuadrícula"
                aria-pressed={viewMode === "grid"}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                type="button"
                className={`${local.viewBtn} ${viewMode === "list" ? local.viewBtnActive : ""}`}
                onClick={() => setViewMode("list")}
                aria-label="Ver como lista"
                aria-pressed={viewMode === "list"}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          <div className={viewMode === "list" ? local.list : local.grid}>
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} compact={viewMode === "list"} />
            ))}
          </div>
        </>
      )}
    </ScreenContainer>
  );
}
