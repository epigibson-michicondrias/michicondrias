/**
 * useGlobalSearch — Hook for debounced global search with categorized results
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { globalSearch } from '@/src/services/search';
import type { GlobalSearchResult } from '@/src/types/search';
import { formatCurrency } from '@/src/utils/formatters';

export type SearchTab = 'mascotas' | 'clinicas' | 'productos';

/** Resultado listo para pintar: la pantalla no necesita saber de qué dominio viene. */
export interface SearchResultItem {
    id: string;
    title: string;
    subtitle: string;
    route: string;
}

const join = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' · ');

function toItems(results: GlobalSearchResult): Record<SearchTab, SearchResultItem[]> {
    return {
        mascotas: results.pets.map((p) => ({ id: p.id, title: p.name, subtitle: join(p.species, p.breed), route: `/mascotas/${p.id}` })),
        clinicas: results.clinics.map((c) => ({ id: c.id, title: c.name, subtitle: join(c.address, c.city), route: `/directorio/clinica/${c.id}` })),
        productos: results.products.map((p) => ({ id: p.id, title: p.name, subtitle: join(formatCurrency(p.price), p.category), route: `/tienda/producto/${p.id}` })),
    };
}

const EMPTY: GlobalSearchResult = { pets: [], clinics: [], products: [] };
const TAB_ORDER: SearchTab[] = ['mascotas', 'clinicas', 'productos'];

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

    const tabCounts = {
        mascotas: items.mascotas.length,
        clinicas: items.clinicas.length,
        productos: items.productos.length,
    };

    // Al llegar resultados nuevos, si la pestaña activa quedó vacía pero otra tiene, se muestra esa.
    // Solo reacciona a resultados nuevos: si la persona elige a mano una pestaña vacía, se respeta.
    const activeTabRef = useRef(activeTab);
    activeTabRef.current = activeTab;
    useEffect(() => {
        if (!data || items[activeTabRef.current].length > 0) return;
        const firstWithResults = TAB_ORDER.find((tab) => items[tab].length > 0);
        if (firstWithResults) setActiveTab(firstWithResults);
    }, [data, items]);

    const clearSearch = useCallback(() => {
        setQuery('');
        setDebouncedQuery('');
    }, []);

    return {
        query,
        setQuery,
        activeTab,
        setActiveTab,
        activeResults,
        tabCounts,
        isLoading: isLoading && debouncedQuery.length >= 2,
        isError,
        hasSearched: debouncedQuery.length >= 2,
        clearSearch,
    };
}
