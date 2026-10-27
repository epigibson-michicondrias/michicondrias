/**
 * usePlaces — Hook for pet-friendly places list screen
 * Manages place list fetching, search filtering, and view mode toggle
 */
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getPlaces } from '@/src/services/petfriendly';

export function usePlaces() {
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState<string | null>(null);
    const [minRating, setMinRating] = useState<number>(0);
    const [hasWaterBowlsOnly, setHasWaterBowlsOnly] = useState<boolean>(false);
    const [hasPetMenuOnly, setHasPetMenuOnly] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('list');

    const { data: places = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['petfriendly-places'],
        queryFn: () => getPlaces(),
    });

    const categories = useMemo(() => Array.from(new Set(places.map(p => p.category).filter(Boolean))).sort(), [places]);

    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setCategory(null);
        setMinRating(0);
        setHasWaterBowlsOnly(false);
        setHasPetMenuOnly(false);
    }, []);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (category) count++;
        if (minRating > 0) count++;
        if (hasWaterBowlsOnly) count++;
        if (hasPetMenuOnly) count++;
        return count;
    }, [category, minRating, hasWaterBowlsOnly, hasPetMenuOnly]);

    const filteredPlaces = useMemo(() => {
        return places.filter(p => {
            if (category && p.category?.toLowerCase() !== category.toLowerCase()) return false;
            if (minRating > 0 && (!p.rating || p.rating < minRating)) return false;
            if (hasWaterBowlsOnly && p.has_water_bowls !== 'yes' && p.has_water_bowls !== 'true') return false;
            if (hasPetMenuOnly && p.has_pet_menu !== 'yes' && p.has_pet_menu !== 'true') return false;

            if (searchQuery.trim()) {
                const q = searchQuery.trim().toLowerCase();
                const matches =
                    p.name.toLowerCase().includes(q) ||
                    (p.category || '').toLowerCase().includes(q) ||
                    (p.city || '').toLowerCase().includes(q) ||
                    (p.address || '').toLowerCase().includes(q);
                if (!matches) return false;
            }
            return true;
        });
    }, [places, category, minRating, hasWaterBowlsOnly, hasPetMenuOnly, searchQuery]);

    const mapMarkers = useMemo(() => {
        return filteredPlaces
            .filter(p => p.latitude && p.longitude)
            .map(place => ({
                id: place.id,
                latitude: place.latitude!,
                longitude: place.longitude!,
                title: place.name,
                description: place.category,
            }));
    }, [filteredPlaces]);

    const toggleViewMode = () => {
        setViewMode(prev => (prev === 'map' ? 'list' : 'map'));
    };

    const goToPlace = (id: string) => router.push(`/petfriendly/${id}` as any);
    const goToNewPlace = () => router.push('/petfriendly/nuevo' as any);
    const goBack = () => router.back();

    return {
        // Data
        places: filteredPlaces,
        allPlaces: places,
        isLoading,
        isError,
        refetch,
        categories,
        category,
        setCategory,
        minRating,
        setMinRating,
        hasWaterBowlsOnly,
        setHasWaterBowlsOnly,
        hasPetMenuOnly,
        setHasPetMenuOnly,
        searchQuery,
        viewMode,
        mapMarkers,
        activeFiltersCount,

        // Actions
        setSearchQuery,
        clearFilters,
        toggleViewMode,
        goToPlace,
        goToNewPlace,
        goBack,
    };
}
