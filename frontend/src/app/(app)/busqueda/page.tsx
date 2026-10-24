"use client";

/**
 * Búsqueda — espejo de `mobile/app/busqueda/index.tsx`. Buscador global con resultados
 * por dominio (mascotas, adopciones, perdidas, clínicas, servicios, productos).
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronRight,
  Footprints,
  Heart,
  MapPin,
  PawPrint,
  Search,
  ShoppingBag,
} from "lucide-react";
import type { ComponentType } from "react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import FilterChip from "@/components/FilterChip";
import { SkeletonList } from "@/components/Skeleton";
import {
  useGlobalSearch,
  SEARCH_TABS,
  type SearchTab,
  type SearchResultItem,
} from "@/hooks/search/useGlobalSearch";
import s from "./busqueda.module.css";

const TAB_ICONS: Record<SearchTab, ComponentType<{ size?: number; color?: string }>> = {
  mascotas: PawPrint,
  adopciones: Heart,
  perdidas: MapPin,
  clinicas: Building2,
  servicios: Footprints,
  productos: ShoppingBag,
};

function ResultRow({ item }: { item: SearchResultItem }) {
  return (
    <Link
      href={item.route}
      className={s.resultCard}
      aria-label={item.subtitle ? `${item.title}. ${item.subtitle}` : item.title}
    >
      <span className={s.resultContent}>
        <span className={s.resultTitle}>{item.title}</span>
        {!!item.subtitle && <span className={s.resultSubtitle}>{item.subtitle}</span>}
      </span>
      <ChevronRight size={18} className={s.chevron} aria-hidden />
    </Link>
  );
}

export default function BusquedaPage() {
  const router = useRouter();
  const {
    query,
    setQuery,
    activeTab,
    activeTabInfo,
    setActiveTab,
    activeResults,
    tabCounts,
    isLoading,
    isError,
    hasSearched,
  } = useGlobalSearch();

  const goSeeAll = () => router.push(activeTabInfo.seeAllRoute);

  const renderBody = () => {
    if (!hasSearched) {
      return (
        <EmptyState
          icon={<Search size={28} />}
          title="¿Qué estás buscando?"
          subtitle="Escribe al menos 2 letras: mascotas, adopciones, reportes de perdidas, clínicas, paseadores o productos."
        />
      );
    }
    if (isLoading) return <SkeletonList count={4} />;
    // El error ya lo muestra ScreenContainer con su banner y botón de reintentar
    if (isError) return null;
    if (activeResults.length === 0) {
      return (
        <EmptyState
          icon={<Search size={28} />}
          title={`Sin resultados en ${activeTabInfo.label}`}
          subtitle="Prueba con otra palabra o revisa el listado completo."
          actionLabel={activeTabInfo.seeAllLabel}
          onAction={goSeeAll}
        />
      );
    }
    return (
      <div className={s.results}>
        {activeResults.map((item) => (
          <ResultRow key={item.id} item={item} />
        ))}
        {/* «Ver todos»: el backend manda hasta 5 por dominio; el listado completo vive en el módulo (F25) */}
        <button type="button" className={s.seeAll} onClick={goSeeAll} aria-label={activeTabInfo.seeAllLabel}>
          {activeTabInfo.seeAllLabel}
          <ChevronRight size={14} aria-hidden />
        </button>
      </div>
    );
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Buscar" />

      <div className={s.searchWrap}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar en Michicondrias…" />
      </div>

      <div className={s.chips} role="tablist" aria-label="Dominios de búsqueda">
        {SEARCH_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.key];
          const active = activeTab === tab.key;
          return (
            <FilterChip
              key={tab.key}
              label={tab.label}
              active={active}
              onPress={() => setActiveTab(tab.key)}
              icon={<Icon size={14} color={active ? "var(--color-on-primary)" : "var(--color-text-muted)"} />}
              count={hasSearched ? tabCounts[tab.key] : undefined}
            />
          );
        })}
      </div>

      {renderBody()}
    </ScreenContainer>
  );
}
