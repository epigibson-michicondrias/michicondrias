"use client";

/**
 * Directorio médico — listado de clínicas y especialistas con búsqueda y filtros.
 * Espejo de `mobile/app/directorio/index.tsx`.
 */
import { useRouter } from "next/navigation";
import { Hospital, MapPin, Search, Stethoscope } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import SearchBar from "@/components/SearchBar";
import FilterChip from "@/components/FilterChip";
import SegmentedControl from "@/components/SegmentedControl";
import EmptyState from "@/components/EmptyState";
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

      <div className={s.searchWrap}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={activeTab === "clinics" ? "Buscar clínica o ciudad..." : "Buscar veterinario..."}
        />
      </div>

      <div className={s.filters} role="group" aria-label="Filtros">
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
            {cities.length > 1 ? (
              <FilterChip
                label={filterCity === "all" ? "Ciudad" : filterCity}
                active={filterCity !== "all"}
                icon={<MapPin size={12} />}
                onPress={() => {
                  const idx = cities.indexOf(filterCity);
                  setFilterCity(cities[(idx + 1) % cities.length]);
                }}
              />
            ) : null}
          </>
        ) : (
          specialties.map((sp) => (
            <FilterChip
              key={sp}
              label={sp === "all" ? "Todas las especialidades" : sp}
              active={filterSpecialty === sp}
              onPress={() => setFilterSpecialty(sp)}
            />
          ))
        )}
      </div>

      <p className={s.resultCount}>
        {resultsCount} resultado{resultsCount !== 1 ? "s" : ""}
        {hasActiveFilters ? " · filtros activos" : ""}
      </p>

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
      ) : (
        <div className={s.list}>
          {activeTab === "clinics"
            ? filteredClinics.map((c) => <ClinicCard key={c.id} clinic={c} />)
            : filteredVets.map((v) => <VetCard key={v.id} vet={v} />)}
        </div>
      )}
    </ScreenContainer>
  );
}
