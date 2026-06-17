/**
 * useListings — Hook for fetching adoption listings
 * Extracts data fetching and filtering from app/adopciones/index.tsx
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getListings } from '@/src/services/adopciones';
import type { Listing } from '@/src/types/adopciones';

export function useListings() {
    const [search, setSearch] = useState('');
    const [speciesFilter, setSpeciesFilter] = useState<string>('all');
    const [sizeFilter, setSizeFilter] = useState<string>('all');

    const {
        data: listings = [],
        isLoading,
        isRefetching,
        refetch,
    } = useQuery({
        queryKey: ['adopciones-listings'],
        queryFn: getListings,
    });

    const filteredListings = useMemo(() => {
        return listings.filter((listing) => {
            // Search filter
            if (search) {
                const q = search.toLowerCase();
                const matchesSearch =
                    listing.name?.toLowerCase().includes(q) ||
                    listing.breed?.toLowerCase().includes(q) ||
                    listing.location?.toLowerCase().includes(q) ||
                    listing.description?.toLowerCase().includes(q);
                if (!matchesSearch) return false;
            }
            // Species filter
            if (speciesFilter !== 'all' && listing.species !== speciesFilter) return false;
            // Size filter
            if (sizeFilter !== 'all' && listing.size !== sizeFilter) return false;
            return true;
        });
    }, [listings, search, speciesFilter, sizeFilter]);

    return {
        listings: filteredListings,
        allListings: listings,
        isLoading,
        isRefetching,
        refetch,
        search,
        setSearch,
        speciesFilter,
        setSpeciesFilter,
        sizeFilter,
        setSizeFilter,
    };
}

export type { Listing };
