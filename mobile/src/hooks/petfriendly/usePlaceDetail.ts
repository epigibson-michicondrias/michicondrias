/**
 * usePlaceDetail — Hook for pet-friendly place detail screen
 * Manages place fetching and external link actions
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getPlaceById } from '@/src/services/petfriendly';
import { Linking } from 'react-native';

export function usePlaceDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const { data: place, isLoading } = useQuery({
        queryKey: ['petfriendly-place', id],
        queryFn: () => getPlaceById(id as string),
    });

    const openMap = () => {
        if (place) {
            const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
            Linking.openURL(url);
        }
    };

    const callPlace = () => {
        if (place?.phone) {
            Linking.openURL(`tel:${place.phone}`);
        }
    };

    const openWebsite = () => {
        if (place?.website) {
            Linking.openURL(place.website);
        }
    };

    const goBack = () => router.back();

    return {
        // Data
        place,
        isLoading,

        // Actions
        openMap,
        callPlace,
        openWebsite,
        goBack,
    };
}
