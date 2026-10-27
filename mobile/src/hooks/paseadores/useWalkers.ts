/**
 * useWalkers — Hook for walkers list screen
 * Manages walkers data fetching, search state, and filtering
 */
import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listWalkers, Walker } from '@/src/services/paseadores';

export function useWalkers() {
    const [searchQuery, setSearchQuery] = useState('');
    const [acceptsDogsOnly, setAcceptsDogsOnly] = useState(false);
    const [acceptsCatsOnly, setAcceptsCatsOnly] = useState(false);
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    const {
        data: walkers = [],
        isLoading,
        refetch,
        isRefetching,
    } = useQuery<Walker[]>({
        queryKey: ['walkers'],
        queryFn: () => listWalkers(),
    });

    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setAcceptsDogsOnly(false);
        setAcceptsCatsOnly(false);
        setVerifiedOnly(false);
    }, []);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (acceptsDogsOnly) count++;
        if (acceptsCatsOnly) count++;
        if (verifiedOnly) count++;
        return count;
    }, [acceptsDogsOnly, acceptsCatsOnly, verifiedOnly]);

    const filteredWalkers = useMemo(() => {
        return walkers.filter(walker => {
            const q = searchQuery.trim().toLowerCase();
            const matchSearch =
                !q ||
                walker.display_name.toLowerCase().includes(q) ||
                (walker.location || '').toLowerCase().includes(q) ||
                (walker.bio || '').toLowerCase().includes(q);

            if (acceptsDogsOnly && !walker.accepts_dogs) return false;
            if (acceptsCatsOnly && !walker.accepts_cats) return false;
            if (verifiedOnly && !walker.is_verified) return false;

            return matchSearch;
        });
    }, [walkers, searchQuery, acceptsDogsOnly, acceptsCatsOnly, verifiedOnly]);

    const hasActiveFilters = searchQuery.trim() !== '' || activeFiltersCount > 0;

    return {
        walkers: filteredWalkers,
        allWalkers: walkers,
        isLoading,
        refetch,
        isRefetching,
        searchQuery,
        setSearchQuery,
        acceptsDogsOnly,
        setAcceptsDogsOnly,
        acceptsCatsOnly,
        setAcceptsCatsOnly,
        verifiedOnly,
        setVerifiedOnly,
        clearFilters,
        activeFiltersCount,
        hasActiveFilters,
    };
}
