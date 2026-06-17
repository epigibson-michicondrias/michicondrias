/**
 * usePlaceDetail — Hook for pet-friendly place detail screen
 * Manages place fetching, external link actions, and place reviews
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlaceById, getPlaceReviews, createPlaceReview, PetfriendlyReview, PetfriendlyReviewCreate } from '@/src/services/petfriendly';
import { Linking } from 'react-native';
import { showAlert } from '@/src/components/AppAlert';

export function usePlaceDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();

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
            showAlert({ type: 'success', title: '¡Reseña Enviada!', message: 'Tu reseña ha sido publicada.' });
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
        await createReviewMutation.mutateAsync({ rating, comment });
    };

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
        reviews,
        reviewsLoading,
        isCreatingReview: createReviewMutation.isPending,

        // Actions
        openMap,
        callPlace,
        openWebsite,
        goBack,
        handleCreateReview,
    };
}
