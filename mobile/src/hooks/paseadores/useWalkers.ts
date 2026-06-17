/**
 * useWalkers — Hook for walkers list screen
 * Manages walkers data fetching, search state, and filtering
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listWalkers, Walker } from '@/src/services/paseadores';

export function useWalkers() {
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: walkers = [],
        isLoading,
        refetch,
        isRefetching,
    } = useQuery<Walker[]>({
        queryKey: ['walkers'],
        queryFn: () => listWalkers(),
    });

    const filteredWalkers = useMemo(() => {
        return walkers.filter(walker =>
            walker.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (walker.location || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [walkers, searchQuery]);

    const hasActiveFilters = searchQuery !== '';

    return {
        walkers: filteredWalkers,
        isLoading,
        refetch,
        isRefetching,
        searchQuery,
        setSearchQuery,
        hasActiveFilters,
    };
}
