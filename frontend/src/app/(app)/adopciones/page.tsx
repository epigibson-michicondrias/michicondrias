"use client";

/**
 * Adopciones — dos columnas: filtros laterales + rejilla de mascotas en adopción.
 * Criterio §0: composición de escritorio.
 */
import { useRouter } from "next/navigation";
import { Heart, LayoutGrid, List, MapPin, PawPrint, Plus, FolderHeart, ClipboardList, Search, Sparkles } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import FilterChip from "@/components/FilterChip";
import Button from "@/components/Button";
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

  const clearFilters = () => {
    setSearch("");
    setSpeciesFilter("all");
    setSizeFilter("all");
  };

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

      <div className={local.layout}>
        {/* ── Filtros laterales ── */}
        <aside className={local.sidebar}>
          <div className={local.searchWrap}>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nombre, raza…" />
          </div>

          <div className={local.filterSection}>
            <h3 className={local.filterTitle}><PawPrint size={14} /> Especie</h3>
            <div className={local.filterList}>
              {[
                { key: "all", label: "Todas" },
                { key: "perro", label: "Perros" },
                { key: "gato", label: "Gatos" },
              ].map((f) => (
                <FilterChip
                  key={f.key}
                  label={f.label}
                  active={speciesFilter === f.key}
                  onPress={() => setSpeciesFilter(f.key)}
                />
              ))}
            </div>
          </div>

          <div className={local.filterSection}>
            <h3 className={local.filterTitle}><Sparkles size={14} /> Tamaño</h3>
            <div className={local.filterList}>
              {[
                { key: "all", label: "Todos" },
                { key: "pequeño", label: "Pequeño" },
                { key: "mediano", label: "Mediano" },
                { key: "grande", label: "Grande" },
              ].map((f) => (
                <FilterChip
                  key={f.key}
                  label={f.label}
                  active={sizeFilter === f.key}
                  onPress={() => setSizeFilter(f.key)}
                />
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <Button label="Limpiar filtros" variant="ghost" size="sm" fullWidth onPress={clearFilters} />
          )}
        </aside>

        {/* ── Resultados ── */}
        <div className={local.results}>
          <div className={local.resultsHeader}>
            <p className={local.count}>
              {isLoading ? "Buscando…" : `${listings.length} ${listings.length === 1 ? "mascota" : "mascotas"}`}
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

          {isLoading ? (
            <div className={viewMode === "list" ? local.list : local.grid}>
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
                  ? clearFilters
                  : () => router.push("/adopciones/nuevo")
              }
            />
          ) : (
            <div className={viewMode === "list" ? local.list : local.grid}>
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} compact={viewMode === "list"} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
}
