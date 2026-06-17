/**
 * useClinicDetail — Data fetching for the clinic detail screen
 * Fetches clinic info, services, and rating by clinic ID
 */
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClinic, getClinicServices, getClinicRating, getClinicReviews, createClinicReview } from '@/src/services/directorio';
import type { ClinicReview } from '@/src/services/directorio';
import { showAlert } from '@/src/components/AppAlert';

export function useClinicDetail() {
    const { id } = useLocalSearchParams();
    const clinicId = id as string;
    const queryClient = useQueryClient();

    const { data: clinic, isLoading } = useQuery({
        queryKey: ['clinic', clinicId],
        queryFn: () => getClinic(clinicId),
    });

    const { data: services = [] } = useQuery({
        queryKey: ['clinic-services', clinicId],
        queryFn: () => getClinicServices(clinicId),
    });

    const { data: rating } = useQuery({
        queryKey: ['clinic-rating', clinicId],
        queryFn: () => getClinicRating(clinicId),
    });

    const { data: reviews = [], isLoading: reviewsLoading } = useQuery<ClinicReview[]>({
        queryKey: ['clinic-reviews', clinicId],
        queryFn: () => getClinicReviews(clinicId),
    });

    const createReviewMutation = useMutation({
        mutationFn: ({ rating, comment }: { rating: number; comment?: string }) =>
            createClinicReview(clinicId, rating, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinic-reviews', clinicId] });
            queryClient.invalidateQueries({ queryKey: ['clinic-rating', clinicId] });
            showAlert({ type: 'success', title: '¡Reseña Enviada!', message: 'Tu reseña ha sido publicada.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo enviar la reseña.' });
        },
    });

    const handleCreateReview = (rating: number, comment?: string) => {
        createReviewMutation.mutate({ rating, comment });
    };

    return {
        clinicId,
        clinic,
        isLoading,
        services,
        rating,
        // Reviews
        reviews,
        reviewsLoading,
        handleCreateReview,
        isCreatingReview: createReviewMutation.isPending,
    };
}
