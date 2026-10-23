/**
 * useProduct — Detalle de producto: producto, reseñas (con permiso para opinar), relacionados, favorito y bolsa.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { getProduct, getProducts, getReviews, getReviewEligibility, createProductReview } from '@/src/services/ecommerce';
import { useCart } from '@/src/contexts/CartContext';
import { useProductFavorites } from '@/src/hooks/ecommerce/useProductFavorites';
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

    // «También te puede gustar»: misma categoría, mejor calificados y con existencias primero (orden del backend)
    const categoryKey = product?.category_id ?? 'all';
    const { data: sameCategory = [] } = useQuery({
        queryKey: ['store-products', 'related', categoryKey],
        queryFn: () => getProducts({ category: product?.category_id ?? undefined, sort: 'rating', limit: 12 }),
        enabled: !!product,
        meta: { silentError: true },
    });
    const related = useMemo(
        () => sameCategory
            .filter((p) => p.id !== id)
            .slice(0, 8),
        [sameCategory, id],
    );

    const { addToCart, cartCount, items } = useCart();
    const { isFavorite, toggleFavorite } = useProductFavorites();
    const inCart = items.find((i) => i.product.id === id)?.quantity ?? 0;

    const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/tienda-tab'));

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
        // Relacionados, bolsa y favoritos
        related,
        addToCart,
        cartCount,
        inCart,
        isOwner: !!product && !!user && product.seller_id === user.id,
        isFavorite: product ? isFavorite(product.id) : false,
        toggleFavorite: () => product && toggleFavorite(product.id),
        isFavoriteId: isFavorite,
        toggleFavoriteId: toggleFavorite,
        userId: user?.id,
    };
}

export type { Product, Review };
