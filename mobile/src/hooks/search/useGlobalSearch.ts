/**
 * useGlobalSearch — Hook for debounced global search with categorized results
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { globalSearch } from '@/src/services/search';
import type { GlobalSearchResult } from '@/src/types/search';
import { formatCurrency } from '@/src/utils/formatters';

export type SearchTab = 'mascotas' | 'adopciones' | 'perdidas' | 'clinicas' | 'servicios' | 'productos';

/** Resultado listo para pintar: la pantalla no necesita saber de qué dominio viene. */
export interface SearchResultItem {
    id: string;
    title: string;
    subtitle: string;
    route: string;
}

/** Pestañas en orden, con el listado completo del módulo para «Ver todos» (F25). */
export const SEARCH_TABS: { key: SearchTab; label: string; seeAllRoute: string; seeAllLabel: string }[] = [
    { key: 'mascotas', label: 'Mis mascotas', seeAllRoute: '/mascotas', seeAllLabel: 'Ver todas mis mascotas' },
    { key: 'adopciones', label: 'Adopciones', seeAllRoute: '/adopciones', seeAllLabel: 'Ver todas las adopciones' },
    { key: 'perdidas', label: 'Perdidas', seeAllRoute: '/perdidas', seeAllLabel: 'Ver todos los reportes' },
    { key: 'clinicas', label: 'Clínicas', seeAllRoute: '/directorio', seeAllLabel: 'Ver todo el directorio' },
    { key: 'servicios', label: 'Paseos y cuidado', seeAllRoute: '/(tabs)/explorar', seeAllLabel: 'Ver todos los servicios' },
    { key: 'productos', label: 'Productos', seeAllRoute: '/(tabs)/tienda-tab', seeAllLabel: 'Ver toda la tienda' },
];

/** El backend manda hasta 5 por dominio: si llegan 5 puede haber más y se ofrece «Ver todos». */
export const RESULTS_PER_TAB = 5;

const join = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' · ');

function toItems(results: GlobalSearchResult): Record<SearchTab, SearchResultItem[]> {
    return {
        mascotas: results.pets.map((p) => ({ id: p.id, title: p.name, subtitle: join(p.species, p.breed), route: `/mascotas/${p.id}` })),
        adopciones: (results.adoptions ?? []).map((a) => ({
            id: a.id, title: a.name, subtitle: join(a.species, a.breed, a.location), route: `/adopciones/${a.id}`,
        })),
        perdidas: (results.lost_pets ?? []).map((l) => ({
            id: l.id,
            title: l.name || (l.report_type === 'found' ? 'Mascota encontrada' : 'Mascota perdida'),
            subtitle: join(l.report_type === 'found' ? 'Encontrada' : 'Perdida', l.species, l.last_seen_location),
            route: `/perdidas/${l.id}`,
        })),
        clinicas: results.clinics.map((c) => ({ id: c.id, title: c.name, subtitle: join(c.address, c.city), route: `/directorio/clinica/${c.id}` })),
        servicios: (results.services ?? []).map((s) => ({
            id: `${s.kind}-${s.id}`,
            title: s.name,
            subtitle: join(s.kind === 'sitter' ? 'Cuidador' : 'Paseador', s.location),
            route: s.kind === 'sitter' ? `/cuidadores/${s.id}` : `/paseadores/${s.id}`,
        })),
        productos: results.products.map((p) => ({ id: p.id, title: p.name, subtitle: join(formatCurrency(p.price), p.category), route: `/tienda/producto/${p.id}` })),
    };
}

const EMPTY: GlobalSearchResult = { pets: [], clinics: [], products: [] };

export function useGlobalSearch() {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [activeTab, setActiveTab] = useState<SearchTab>('mascotas');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounce the search query (400ms)
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 400);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    const { data, isLoading, isError } = useQuery<GlobalSearchResult>({
        queryKey: ['global-search', debouncedQuery],
        queryFn: () => globalSearch(debouncedQuery),
        enabled: debouncedQuery.length >= 2,
    });

    const items = useMemo(() => toItems(data || EMPTY), [data]);
    const activeResults = items[activeTab];
    const activeTabInfo = SEARCH_TABS.find((t) => t.key === activeTab)!;

    const tabCounts = useMemo(
        () => Object.fromEntries(SEARCH_TABS.map((t) => [t.key, items[t.key].length])) as Record<SearchTab, number>,
        [items],
    );

    // Al llegar resultados nuevos, si la pestaña activa quedó vacía pero otra tiene, se muestra esa.
    // Solo reacciona a resultados nuevos: si la persona elige a mano una pestaña vacía, se respeta.
    const activeTabRef = useRef(activeTab);
    activeTabRef.current = activeTab;
    useEffect(() => {
        if (!data || items[activeTabRef.current].length > 0) return;
        const firstWithResults = SEARCH_TABS.find((tab) => items[tab.key].length > 0);
        if (firstWithResults) setActiveTab(firstWithResults.key);
    }, [data, items]);

    const clearSearch = useCallback(() => {
        setQuery('');
        setDebouncedQuery('');
    }, []);

    return {
        query,
        setQuery,
        activeTab,
        activeTabInfo,
        setActiveTab,
        activeResults,
        /** Hay 5 (el tope por dominio): puede haber más en el listado del módulo. */
        mayHaveMore: activeResults.length >= RESULTS_PER_TAB,
        tabCounts,
        isLoading: isLoading && debouncedQuery.length >= 2,
        isError,
        hasSearched: debouncedQuery.length >= 2,
        clearSearch,
    };
}
