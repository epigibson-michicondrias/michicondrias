/**
 * usePlaceDetail — Hook for pet-friendly place detail screen
 * Manages place fetching, external link actions, and place reviews
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlaceById, getPlaceReviews, createPlaceReview, deletePlace, PetfriendlyReview, PetfriendlyReviewCreate } from '@/src/services/petfriendly';
import { Linking } from 'react-native';
import { showAlert } from '@/src/components/AppAlert';
import { useAuth } from '@/src/contexts/AuthContext';

export function usePlaceDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { data: place, isLoading } = useQuery({
        queryKey: ['petfriendly-place', id],
        queryFn: () => getPlaceById(id as string),
    });

    const { data: reviews = [], isLoading: reviewsLoading } = useQuery<PetfriendlyReview[]>({
        queryKey: ['petfriendly-reviews', id],
        queryFn: () => getPlaceReviews(id as string),
        enabled: !!id,
    });

    const createReviewMutation = useMutation({
        mutationFn: (data: PetfriendlyReviewCreate) => createPlaceReview(id as string, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['petfriendly-place', id] });
            queryClient.invalidateQueries({ queryKey: ['petfriendly-reviews', id] });
            queryClient.invalidateQueries({ queryKey: ['petfriendly-places'] });
            showAlert({ type: 'success', title: 'Reseña enviada', message: 'Tu reseña ha sido publicada.' });
        },
        onError: (err: any) => {
            showAlert({ type: 'error', title: 'Error', message: err.message || 'No se pudo enviar la reseña.' });
        }
    });

    const handleCreateReview = async (rating: number, comment: string) => {
        if (rating < 1 || rating > 5) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor selecciona una calificación.' });
            return;
        }
        try {
            await createReviewMutation.mutateAsync({ rating, comment });
        } catch {
            // el error ya se muestra en onError
        }
    };

    const openMap = () => {
        if (!place) return;
        const hasCoords = place.latitude != null && place.longitude != null;
        const query = hasCoords ? `${place.latitude},${place.longitude}` : encodeURIComponent(`${place.name} ${place.address || ''} ${place.city || ''}`);
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {
            showAlert({ type: 'error', title: 'No se pudo abrir', message: 'No se pudo abrir el mapa.' });
        });
    };

    const callPlace = () => {
        if (place?.phone) {
            Linking.openURL(`tel:${place.phone}`).catch(() => {
                showAlert({ type: 'error', title: 'No se pudo llamar', message: 'No se pudo abrir la aplicación de teléfono.' });
            });
        }
    };

    const openWebsite = () => {
        if (place?.website) {
            const url = /^https?:\/\//i.test(place.website) ? place.website : `https://${place.website}`;
            Linking.openURL(url).catch(() => {
                showAlert({ type: 'error', title: 'No se pudo abrir', message: 'No se pudo abrir el sitio web.' });
            });
        }
    };

    const deleteMutation = useMutation({
        mutationFn: () => deletePlace(id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['petfriendly-places'] });
            showAlert({ type: 'success', title: 'Lugar eliminado', message: 'El lugar ya no aparece en la lista.', onButtonPress: () => router.back() });
        },
        onError: (err: any) => {
            showAlert({ type: 'error', title: 'No se pudo eliminar', message: err?.message || 'Inténtalo de nuevo.' });
        },
    });

    const isOwner = !!user?.id && place?.added_by === user.id;
    const handleDelete = () => {
        showAlert({
            type: 'warning',
            title: 'Eliminar lugar',
            message: 'Se borrará el lugar y todas sus reseñas. Esta acción no se puede deshacer.',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteMutation.mutate(),
        });
    };

    const goBack = () => router.back();

    return {
        // Data
        place,
        isLoading,
        reviews,
        reviewsLoading,
        isCreatingReview: createReviewMutation.isPending,

        // Actions
        openMap,
        callPlace,
        openWebsite,
        goBack,
        handleCreateReview,
        isOwner,
        handleDelete,
        isDeleting: deleteMutation.isPending,
    };
}
