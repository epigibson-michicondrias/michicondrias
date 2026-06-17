/**
 * useGlobalSearch — Hook for debounced global search with categorized results
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { globalSearch, type GlobalSearchResult } from '@/src/services/search';

export type SearchTab = 'mascotas' | 'clinicas' | 'productos';

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

    const results = data || { pets: [], clinics: [], products: [] };

    const activeResults = (() => {
        switch (activeTab) {
            case 'mascotas':
                return results.pets;
            case 'clinicas':
                return results.clinics;
            case 'productos':
                return results.products;
        }
    })();

    const tabCounts = {
        mascotas: results.pets.length,
        clinicas: results.clinics.length,
        productos: results.products.length,
    };

    const clearSearch = useCallback(() => {
        setQuery('');
        setDebouncedQuery('');
    }, []);

    return {
        query,
        setQuery,
        activeTab,
        setActiveTab,
        results,
        activeResults,
        tabCounts,
        isLoading: isLoading && debouncedQuery.length >= 2,
        isError,
        hasSearched: debouncedQuery.length >= 2,
        clearSearch,
    };
}
