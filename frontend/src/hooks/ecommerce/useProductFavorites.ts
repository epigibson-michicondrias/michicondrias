/**
 * useProductFavorites — favoritos del comprador (espejo de `mobile/src/hooks/ecommerce/useProductFavorites.ts`).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getFavoriteProductIds,
    addFavoriteProduct,
    removeFavoriteProduct,
} from '@/services/ecommerce';

export function useProductFavorites() {
    const queryClient = useQueryClient();

    const { data: favoriteIds = [] } = useQuery({
        queryKey: ['favorite-products'],
        queryFn: getFavoriteProductIds,
        staleTime: 60_000,
    });

    const addMutation = useMutation({
        mutationFn: (productId: string) => addFavoriteProduct(productId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorite-products'] }),
    });

    const removeMutation = useMutation({
        mutationFn: (productId: string) => removeFavoriteProduct(productId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorite-products'] }),
    });

    const isFavorite = (productId: string) => favoriteIds.includes(productId);

    const toggleFavorite = (productId: string) => {
        if (isFavorite(productId)) removeMutation.mutate(productId);
        else addMutation.mutate(productId);
    };

    return { favoriteIds, isFavorite, toggleFavorite };
}
