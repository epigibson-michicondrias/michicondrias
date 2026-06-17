/**
 * useProduct — Hook for product detail screen
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProduct, getReviews, createProductReview } from '@/src/services/ecommerce';
import type { Product, Review, ReviewCreate } from '@/src/services/ecommerce';
import { showAlert } from '@/src/components/AppAlert';

export function useProduct() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const {
        data: product,
        isLoading: productLoading,
    } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProduct(id!),
        enabled: !!id,
    });

    const {
        data: reviews = [],
        isLoading: reviewsLoading,
    } = useQuery({
        queryKey: ['product-reviews', id],
        queryFn: () => getReviews(id!),
        enabled: !!id,
    });

    const goBack = () => router.back();

    const createReviewMutation = useMutation({
        mutationFn: (data: ReviewCreate) => createProductReview(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-reviews', id] });
            queryClient.invalidateQueries({ queryKey: ['product', id] });
            showAlert({ type: 'success', title: '¡Reseña Enviada!', message: 'Tu reseña ha sido publicada.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo enviar la reseña.' });
        },
    });

    const handleCreateReview = (data: ReviewCreate) => {
        createReviewMutation.mutate(data);
    };

    return {
        product,
        reviews,
        isLoading: productLoading,
        reviewsLoading,
        goBack,
        productId: id,
        // Review creation
        handleCreateReview,
        isCreatingReview: createReviewMutation.isPending,
    };
}

export type { Product, Review };
