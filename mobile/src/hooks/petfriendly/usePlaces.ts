/**
 * usePlaces — Hook for pet-friendly places list screen
 * Manages place list fetching, search filtering, and view mode toggle
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getPlaces, PetfriendlyPlace } from '@/src/services/petfriendly';

export function usePlaces() {
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'map' | 'list'>('list');

    const { data: places = [], isLoading } = useQuery({
        queryKey: ['petfriendly-places'],
        queryFn: () => getPlaces(),
    });

    const filteredPlaces = places.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const mapMarkers = filteredPlaces
        .filter(p => p.latitude && p.longitude)
        .map(place => ({
            id: place.id,
            latitude: place.latitude!,
            longitude: place.longitude!,
            title: place.name,
            description: place.category,
            color: '#0ea5e9',
        }));

    const toggleViewMode = () => {
        setViewMode(prev => (prev === 'map' ? 'list' : 'map'));
    };

    const goToPlace = (id: string) => router.push(`/petfriendly/${id}` as any);
    const goToNewPlace = () => router.push('/petfriendly/nuevo' as any);
    const goBack = () => router.back();

    return {
        // Data
        places: filteredPlaces,
        isLoading,
        searchQuery,
        viewMode,
        mapMarkers,

        // Actions
        setSearchQuery,
        toggleViewMode,
        goToPlace,
        goToNewPlace,
        goBack,
    };
}
