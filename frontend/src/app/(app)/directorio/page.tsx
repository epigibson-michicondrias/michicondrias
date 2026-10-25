"use client";

/**
 * Directorio médico — dos columnas: filtros laterales a la izquierda, resultados (mapa/lista) a la derecha.
 * Criterio §0: composición de escritorio.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hospital, List, Map, MapPin, Search, Stethoscope } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import SearchBar from "@/components/SearchBar";
import FilterChip from "@/components/FilterChip";
import SegmentedControl from "@/components/SegmentedControl";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";
import { SkeletonList } from "@/components/Skeleton";
import { ClinicCard, VetCard } from "@/features/directorio/Cards";
import { useClinicsAndVets, type DirectorioTab } from "@/hooks/directorio/useClinicsAndVets";
import s from "./directorio.module.css";

const TABS: { value: DirectorioTab; label: string; icon: typeof Hospital }[] = [
  { value: "clinics", label: "Clínicas", icon: Hospital },
  { value: "vets", label: "Especialistas", icon: Stethoscope },
];

export default function DirectorioPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const {
    filteredClinics,
    filteredVets,
    isLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filterService,
    setFilterService,
    filterSpecialty,
    setFilterSpecialty,
    filterCity,
    setFilterCity,
    specialties,
    cities,
    hasActiveFilters,
    resultsCount,
    canRegister,
  } = useClinicsAndVets();

  const clearFilters = () => {
    setSearchQuery("");
    setFilterService("all");
    setFilterSpecialty("all");
    setFilterCity("all");
  };

  const emptyTitle = hasActiveFilters
    ? "Sin resultados"
    : activeTab === "clinics"
      ? "Aún no hay clínicas registradas"
      : "Aún no hay especialistas registrados";
  const emptySubtitle = hasActiveFilters
    ? "No encontramos lo que buscas. Intenta con otros términos."
    : "Cuando se registren aparecerán aquí.";

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Directorio médico"
        subtitle="Encuentra salud de calidad para tu mejor amigo"
        showBack={false}
        {...(canRegister
          ? { actionIcon: Stethoscope, actionLabel: "Registrar en el directorio", onAction: () => router.push("/directorio/nuevo") }
          : {})}
      />

      <SegmentedControl
        value={activeTab}
        onChange={setActiveTab}
        options={TABS}
        accessibilityLabel="Tipo de resultado"
      />

      <div className={s.layout}>
        {/* ── Filtros laterales ── */}
        <aside className={s.sidebar}>
          <div className={s.searchWrap}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={activeTab === "clinics" ? "Buscar clínica o ciudad..." : "Buscar veterinario..."}
            />
          </div>

          <div className={s.filterSection}>
            <h3 className={s.filterTitle}>
              {activeTab === "clinics" ? "Servicio" : "Especialidad"}
            </h3>
            <div className={s.filterList}>
              {activeTab === "clinics" ? (
                <>
                  {[
                    { key: "all", label: "Todas" },
                    { key: "24h", label: "24 Horas" },
                    { key: "emergencia", label: "Urgencias" },
                  ].map((f) => (
                    <FilterChip
                      key={f.key}
                      label={f.label}
                      active={filterService === f.key}
                      onPress={() => setFilterService(f.key)}
                    />
                  ))}
                </>
              ) : (
                specialties.map((sp) => (
                  <FilterChip
                    key={sp}
                    label={sp === "all" ? "Todas" : sp}
                    active={filterSpecialty === sp}
                    onPress={() => setFilterSpecialty(sp)}
                  />
                ))
              )}
            </div>
          </div>

          {cities.length > 1 && (
            <div className={s.filterSection}>
              <h3 className={s.filterTitle}>
                <MapPin size={14} /> Ciudad
              </h3>
              <div className={s.filterList}>
                {[...new Set(["all", ...cities])].map((city) => (
                  <FilterChip
                    key={city}
                    label={city === "all" ? "Todas" : city}
                    active={filterCity === city}
                    onPress={() => setFilterCity(city)}
                  />
                ))}
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <Button label="Limpiar filtros" variant="ghost" size="sm" fullWidth onPress={clearFilters} />
          )}
        </aside>

        {/* ── Resultados ── */}
        <div className={s.results}>
          <div className={s.resultsHeader}>
            <p className={s.resultCount}>
              {resultsCount} resultado{resultsCount !== 1 ? "s" : ""}
              {hasActiveFilters ? " · filtros activos" : ""}
            </p>
            <div className={s.viewToggle}>
              <button
                type="button"
                className={`${s.viewBtn} ${viewMode === "list" ? s.viewActive : ""}`}
                onClick={() => setViewMode("list")}
                aria-label="Ver como lista"
                aria-pressed={viewMode === "list"}
              >
                <List size={16} />
              </button>
              <button
                type="button"
                className={`${s.viewBtn} ${viewMode === "map" ? s.viewActive : ""}`}
                onClick={() => setViewMode("map")}
                aria-label="Ver como mapa"
                aria-pressed={viewMode === "map"}
              >
                <Map size={16} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <SkeletonList count={4} />
          ) : resultsCount === 0 ? (
            <EmptyState
              icon={<Search size={28} />}
              title={emptyTitle}
              subtitle={emptySubtitle}
              actionLabel={hasActiveFilters ? "Limpiar filtros" : "Volver"}
              onAction={hasActiveFilters ? clearFilters : () => router.push("/")}
            />
          ) : viewMode === "map" ? (
            <div className={s.mapPlaceholder}>
              <Map size={48} />
              <p>Mapa próximamente</p>
              <p className={s.mapSub}>Cambia a vista de lista para ver los resultados</p>
              <Button label="Ver lista" variant="secondary" onPress={() => setViewMode("list")} />
            </div>
          ) : (
            <div className={s.list}>
              {activeTab === "clinics"
                ? filteredClinics.map((c) => <ClinicCard key={c.id} clinic={c} />)
                : filteredVets.map((v) => <VetCard key={v.id} vet={v} />)}
            </div>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
}
