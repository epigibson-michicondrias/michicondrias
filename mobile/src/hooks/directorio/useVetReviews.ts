/**
 * useVetReviews — Coordinates reviews and ratings for a specialist
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVetReviews, getVetRating, createVetReview } from '@/src/services/directorio';
import type { VetReview } from '@/src/services/directorio';
import { showAlert } from '@/src/components/AppAlert';

export function useVetReviews(vetId: string) {
    const queryClient = useQueryClient();

    const { data: rating } = useQuery({
        queryKey: ['vet-rating', vetId],
        queryFn: () => getVetRating(vetId),
        enabled: !!vetId,
    });

    const { data: reviews = [], isLoading: reviewsLoading } = useQuery<VetReview[]>({
        queryKey: ['vet-reviews', vetId],
        queryFn: () => getVetReviews(vetId),
        enabled: !!vetId,
    });

    const createReviewMutation = useMutation({
        mutationFn: ({ rating, comment }: { rating: number; comment?: string }) =>
            createVetReview(vetId, rating, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vet-reviews', vetId] });
            queryClient.invalidateQueries({ queryKey: ['vet-rating', vetId] });
            showAlert({ type: 'success', title: '¡Reseña Enviada!', message: 'Tu reseña ha sido publicada con éxito.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo enviar la reseña.' });
        },
    });

    const handleCreateReview = (rating: number, comment?: string) => {
        createReviewMutation.mutate({ rating, comment });
    };

    return {
        rating,
        reviews,
        reviewsLoading,
        handleCreateReview,
        isCreatingReview: createReviewMutation.isPending,
    };
}
