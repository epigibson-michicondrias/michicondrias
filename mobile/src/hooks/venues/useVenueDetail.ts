/**
 * useVenueDetail — Hook for venue detail screen
 * Manages venue data fetching and action handlers
 */
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { getVenue, Venue } from '@/src/services/venues';
import { showAlert } from '@/src/components/AppAlert';

export function useVenueDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const { data: venue, isLoading, error } = useQuery<Venue>({
        queryKey: ['venue', id],
        queryFn: () => getVenue(id as string),
        enabled: !!id,
    });

    const handleContact = () => {
        showAlert({
            type: 'info',
            title: 'Contactar',
            message: '¿Cómo deseas contactar a este establecimiento?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Llamar',
            onButtonPress: () => showAlert({ type: 'info', title: 'Contacto', message: 'Abriendo marcador telefónico...' }),
        });
    };

    return {
        venue,
        isLoading,
        error,
        handleContact,
    };
}
