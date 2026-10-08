/**
 * useProduct — Hook for product detail screen
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProduct, getReviews, getReviewEligibility, createProductReview } from '@/src/services/ecommerce';
import { useAuth } from '@/src/contexts/AuthContext';
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

    // F19: el formulario solo se muestra a quien compró (pedido pagado) y aún no opinó.
    const { user } = useAuth();
    const { data: eligibility } = useQuery({
        queryKey: ['review-eligibility', id],
        queryFn: () => getReviewEligibility(id!),
        enabled: !!id && !!user?.id,
        meta: { silentError: true },
    });

    const goBack = () => router.back();

    const createReviewMutation = useMutation({
        mutationFn: (data: ReviewCreate) => createProductReview(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-products'] });
            queryClient.invalidateQueries({ queryKey: ['product-reviews', id] });
            queryClient.invalidateQueries({ queryKey: ['product', id] });
            queryClient.invalidateQueries({ queryKey: ['review-eligibility', id] });
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
        canReview: eligibility?.can_review ?? false,
        alreadyReviewed: eligibility?.reason === 'already_reviewed',
        handleCreateReview,
        isCreatingReview: createReviewMutation.isPending,
    };
}

export type { Product, Review };
