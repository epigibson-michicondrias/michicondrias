/**
 * useVenues — Hook for venues list screen
 * Manages venue data fetching, search state, and filtering
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchVenues, Venue } from '@/src/services/venues';

export function useVenues() {
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: venues = [],
        isLoading,
        refetch,
        isRefetching,
    } = useQuery<Venue[]>({
        queryKey: ['venues'],
        queryFn: () => searchVenues(),
    });

    const filteredVenues = useMemo(() => {
        return venues.filter(venue =>
            venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            venue.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [venues, searchQuery]);

    const hasActiveFilters = searchQuery !== '';

    return {
        venues: filteredVenues,
        isLoading,
        refetch,
        isRefetching,
        searchQuery,
        setSearchQuery,
        hasActiveFilters,
    };
}
