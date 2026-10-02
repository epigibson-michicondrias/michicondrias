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
            queryClient.invalidateQueries({ queryKey: ['store-products'] });
            queryClient.invalidateQueries({ queryKey: ['product-reviews', id] });
            queryClient.invalidateQueries({ queryKey: ['product', id] });
            showAlert({ type: 'success', title: '¡Reseña Enviada!', message: 'Tu reseña ha sido publicada.' });
        },
        onError: (error: any) => {
            // El backend explica el motivo (no compraste el producto, ya lo calificaste, etc.)
            showAlert({ type: 'error', title: 'No se pudo enviar la reseña', message: error?.message || 'Inténtalo de nuevo en unos minutos.' });
        },
    });

    const handleCreateReview = (data: ReviewCreate, onDone?: () => void) => {
        createReviewMutation.mutate(data, { onSuccess: onDone });
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
