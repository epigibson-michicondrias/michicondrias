/**
 * useProduct — detalle de producto: producto, reseñas, relacionados, favorito y bolsa.
 * Espejo de `mobile/src/hooks/ecommerce/useProduct.ts`.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { getProduct, getProducts, getReviews, getReviewEligibility, createProductReview } from '@/services/ecommerce';
import { useCart } from '@/contexts/CartContext';
import { useProductFavorites } from '@/hooks/ecommerce/useProductFavorites';
import { useAuth } from '@/contexts/AuthContext';
import type { ReviewCreate } from '@/types/ecommerce';
import { showAlert } from '@/components/AppAlert';

export function useProduct() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: product, isLoading: productLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProduct(id!),
        enabled: !!id,
    });

    const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
        queryKey: ['product-reviews', id],
        queryFn: () => getReviews(id!),
        enabled: !!id,
    });

    const { user } = useAuth();
    const { data: eligibility } = useQuery({
        queryKey: ['review-eligibility', id],
        queryFn: () => getReviewEligibility(id!),
        enabled: !!id && !!user?.id,
        meta: { silentError: true },
    });

    const categoryKey = product?.category_id ?? 'all';
    const { data: sameCategory = [] } = useQuery({
        queryKey: ['store-products', 'related', categoryKey],
        queryFn: () => getProducts({ category: product?.category_id ?? undefined, sort: 'rating', limit: 12 }),
        enabled: !!product,
        meta: { silentError: true },
    });
    const related = useMemo(
        () => sameCategory.filter((p) => p.id !== id).slice(0, 8),
        [sameCategory, id],
    );

    const { addToCart, cartCount, items } = useCart();
    const { isFavorite, toggleFavorite } = useProductFavorites();
    const inCart = items.find((i) => i.product.id === id)?.quantity ?? 0;

    const goBack = () => router.push('/tienda');

    const createReviewMutation = useMutation({
        mutationFn: (data: ReviewCreate) => createProductReview(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-products'] });
            queryClient.invalidateQueries({ queryKey: ['product-reviews', id] });
            queryClient.invalidateQueries({ queryKey: ['product', id] });
            queryClient.invalidateQueries({ queryKey: ['review-eligibility', id] });
            showAlert({ type: 'success', title: '¡Reseña enviada!', message: 'Tu reseña ha sido publicada.' });
        },
        onError: (error: Error) => {
            showAlert({ type: 'error', title: 'No se pudo enviar la reseña', message: error.message || 'Inténtalo de nuevo en unos minutos.' });
        },
    });

    return {
        product,
        reviews,
        isLoading: productLoading,
        reviewsLoading,
        goBack,
        productId: id,
        canReview: eligibility?.can_review ?? false,
        alreadyReviewed: eligibility?.reason === 'already_reviewed',
        handleCreateReview: (data: ReviewCreate) => createReviewMutation.mutate(data),
        isCreatingReview: createReviewMutation.isPending,
        related,
        addToCart,
        cartCount,
        inCart,
        isOwner: !!product && !!user && product.seller_id === user.id,
        isFavorite: product ? isFavorite(product.id) : false,
        toggleFavorite: () => product && toggleFavorite(product.id),
        isFavoriteId: isFavorite,
        toggleFavoriteId: toggleFavorite,
    };
}

export type { Product, Review } from '@/types/ecommerce';
