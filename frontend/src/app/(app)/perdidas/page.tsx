"use client";

/**
 * Perdidas — espejo de `mobile/app/perdidas/index.tsx`. Listado de reportes con filtros.
 */
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus, Search } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import SearchBar from "@/components/SearchBar";
import FilterChip from "@/components/FilterChip";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import { useReports, type FilterType } from "@/hooks/perdidas/useReports";
import { ReportGridCard } from "@/features/perdidas/ReportCard";
import s from "../pages.module.css";

const TYPE_FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "lost", label: "Perdidas" },
  { key: "found", label: "Encontradas" },
  { key: "resolved", label: "Reunidas" },
];

const SPECIES_FILTERS = [
  { key: "all", label: "Todas las especies" },
  { key: "perro", label: "Perros" },
  { key: "gato", label: "Gatos" },
];

function PerdidasContent() {
  const {
    filteredReports, isLoading, searchQuery, setSearchQuery,
    filterType, toggleFilterType, filterSpecies, toggleFilterSpecies,
    clearFilters,
  } = useReports();
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Perdidas"
        subtitle="Reportes de mascotas perdidas y encontradas"
        actionIcon={Plus}
        actionLabel="Reportar"
        onAction={() => router.push("/perdidas/reportar")}
      />

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Buscar por nombre o zona…" />

      <div className={s.chips}>
        {TYPE_FILTERS.map((f) => (
          <FilterChip
            key={f.key}
            label={f.label}
            active={filterType === f.key}
            onPress={() => toggleFilterType(f.key)}
          />
        ))}
        {SPECIES_FILTERS.map((f) => (
          <FilterChip
            key={f.key}
            label={f.label}
            active={filterSpecies === f.key}
            onPress={() => toggleFilterSpecies(f.key)}
          />
        ))}
      </div>

      {isLoading ? (
        <div className={s.grid}>
          {[0, 1, 2].map((i) => <Skeleton key={i} height={180} borderRadius={16} />)}
        </div>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle size={28} />}
          title={(filterType !== "all" || filterSpecies !== "all" || searchQuery.trim()) ? "Sin resultados" : "No hay reportes activos"}
          subtitle={(filterType !== "all" || filterSpecies !== "all" || searchQuery.trim()) ? "Prueba con otro filtro o búsqueda." : "Cuando alguien reporte una mascota aparecerá aquí."}
          actionLabel={(filterType !== "all" || filterSpecies !== "all" || searchQuery.trim()) ? "Quitar filtros" : "Reportar mascota"}
          onAction={(filterType !== "all" || filterSpecies !== "all" || searchQuery.trim()) ? clearFilters : () => router.push("/perdidas/reportar")}
        />
      ) : (
        <>
          <div className={s.grid}>
            {filteredReports.map((report) => (
              <ReportGridCard key={report.id} report={report} />
            ))}
          </div>
          <Button
            label="Reportar mascota"
            icon={<Plus size={18} />}
            onPress={() => router.push("/perdidas/reportar")}
          />
        </>
      )}
    </ScreenContainer>
  );
}

export default function PerdidasPage() {
  return (
    <Suspense fallback={null}>
      <PerdidasContent />
    </Suspense>
  );
}
