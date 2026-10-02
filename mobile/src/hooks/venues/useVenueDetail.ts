/**
 * useVenueDetail — Hook for venue detail screen
 * Manages venue data fetching and action handlers
 */
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Linking } from 'react-native';
import { getVenue, Venue } from '@/src/services/venues';
import { showAlert } from '@/src/components/AppAlert';

export function useVenueDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const { data: venue, isLoading, error } = useQuery<Venue>({
        queryKey: ['venue', id],
        queryFn: () => getVenue(id as string),
        enabled: !!id,
    });

    /** Abre la dirección en la app de mapas del teléfono. */
    const handleContact = () => {
        if (!venue?.address) return;
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name} ${venue.address}`)}`).catch(() =>
            showAlert({ type: 'error', title: 'No se pudo abrir', message: 'Tu dispositivo no pudo abrir el mapa.' })
        );
    };

    return {
        venue,
        isLoading,
        error,
        handleContact,
    };
}
