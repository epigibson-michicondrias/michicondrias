/**
 * useListings — Hook for fetching adoption listings
 * Extracts data fetching and filtering from app/adopciones/index.tsx
 */
import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getListings } from '@/src/services/adopciones';
import type { Listing } from '@/src/types/adopciones';

export function useListings() {
    const [search, setSearch] = useState('');
    const [speciesFilter, setSpeciesFilter] = useState<string>('all');
    const [sizeFilter, setSizeFilter] = useState<string>('all');
    const [genderFilter, setGenderFilter] = useState<string>('all');
    const [urgentOnly, setUrgentOnly] = useState<boolean>(false);

    const {
        data: listings = [],
        isLoading,
        isRefetching,
        refetch,
    } = useQuery({
        queryKey: ['adopciones-listings'],
        queryFn: getListings,
    });

    const clearFilters = useCallback(() => {
        setSearch('');
        setSpeciesFilter('all');
        setSizeFilter('all');
        setGenderFilter('all');
        setUrgentOnly(false);
    }, []);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (speciesFilter !== 'all') count++;
        if (sizeFilter !== 'all') count++;
        if (genderFilter !== 'all') count++;
        if (urgentOnly) count++;
        return count;
    }, [speciesFilter, sizeFilter, genderFilter, urgentOnly]);

    const filteredListings = useMemo(() => {
        return listings.filter((listing) => {
            // Search filter
            if (search.trim()) {
                const q = search.trim().toLowerCase();
                const matchesSearch =
                    listing.name?.toLowerCase().includes(q) ||
                    listing.breed?.toLowerCase().includes(q) ||
                    listing.location?.toLowerCase().includes(q) ||
                    listing.description?.toLowerCase().includes(q);
                if (!matchesSearch) return false;
            }
            // Species filter
            if (speciesFilter !== 'all' && listing.species?.toLowerCase() !== speciesFilter.toLowerCase()) return false;
            // Size filter (support spanish and english codes)
            if (sizeFilter !== 'all') {
                const itemSize = listing.size?.toLowerCase() || '';
                const targetSize = sizeFilter.toLowerCase();
                const isMatch = itemSize === targetSize ||
                    (targetSize === 'chico' && (itemSize === 'small' || itemSize === 'chico' || itemSize === 'pequeño')) ||
                    (targetSize === 'mediano' && (itemSize === 'medium' || itemSize === 'mediano')) ||
                    (targetSize === 'grande' && (itemSize === 'large' || itemSize === 'grande'));
                if (!isMatch) return false;
            }
            // Gender filter
            if (genderFilter !== 'all' && listing.gender?.toLowerCase() !== genderFilter.toLowerCase()) return false;
            // Urgent filter
            if (urgentOnly && !listing.is_emergency) return false;
            return true;
        });
    }, [listings, search, speciesFilter, sizeFilter, genderFilter, urgentOnly]);

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
        genderFilter,
        setGenderFilter,
        urgentOnly,
        setUrgentOnly,
        clearFilters,
        activeFiltersCount,
    };
}

export type { Listing };
