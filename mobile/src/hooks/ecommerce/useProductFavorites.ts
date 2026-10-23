/**
 * useProductFavorites — Productos favoritos guardados en la cuenta (se ven igual en todos los dispositivos).
 * El corazón cambia al instante (actualización optimista) y se revierte si el servidor falla.
 * Los favoritos que antes vivían solo en el teléfono se suben una vez y se borran de ahí.
 *
 *   const { isFavorite, toggleFavorite, favoriteIds } = useProductFavorites();
 */
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';
import { readPref, savePref } from '@/src/lib/prefs';
import {
    addFavoriteProduct, getFavoriteProductIds, mergeFavoriteProducts, removeFavoriteProduct,
} from '@/src/services/ecommerce';

/** Clave donde la versión anterior guardaba los favoritos en el teléfono. */
const legacyKey = (userId: string) => `favorites_productos_${userId}`;
/** Una sola subida por usuario aunque el hook esté montado en varias pantallas. */
const migrating = new Set<string>();

function readLegacy(userId: string): string[] {
    try {
        const parsed = JSON.parse(readPref(legacyKey(userId)) || '[]');
        return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
    } catch {
        return [];
    }
}

export function useProductFavorites() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id;
    const queryKey = ['favorites', 'productos', userId];

    const { data: favoriteIds = [], isSuccess } = useQuery({
        queryKey,
        queryFn: getFavoriteProductIds,
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
        meta: { silentError: true },
    });

    useEffect(() => {
        if (!userId || !isSuccess || migrating.has(userId)) return;
        const local = readLegacy(userId);
        if (local.length === 0) return;
        migrating.add(userId);
        mergeFavoriteProducts(local)
            .then(() => {
                savePref(legacyKey(userId), '[]');
                // Se vuelve a pedir en vez de reemplazar: no pisa un corazón tocado durante la subida
                queryClient.invalidateQueries({ queryKey: ['favorites', 'productos', userId] });
            })
            .catch(() => migrating.delete(userId)); // Se reintenta en el próximo arranque
    }, [userId, isSuccess, queryClient]);

    const mutationKey = ['toggle-favorite', userId];
    const mutation = useMutation({
        mutationKey,
        // En serie: dos toques rápidos llegan al servidor en el mismo orden en que se hicieron
        scope: { id: `product-favorites-${userId}` },
        mutationFn: ({ id, add }: { id: string; add: boolean }) => (add ? addFavoriteProduct(id) : removeFavoriteProduct(id)),
        onMutate: async ({ id, add }) => {
            await queryClient.cancelQueries({ queryKey });
            const previous = queryClient.getQueryData<string[]>(queryKey) ?? [];
            queryClient.setQueryData<string[]>(queryKey, add ? [id, ...previous.filter((f) => f !== id)] : previous.filter((f) => f !== id));
            return { previous };
        },
        onError: (e: any, { add }, context) => {
            if (context) queryClient.setQueryData(queryKey, context.previous);
            showAlert({
                type: 'error',
                title: add ? 'No se pudo guardar en favoritos' : 'No se pudo quitar de favoritos',
                message: e?.message || 'Revisa tu conexión e inténtalo de nuevo.',
            });
        },
        onSettled: () => {
            // Con más toques en cola se espera al último para no traer un estado intermedio
            if (queryClient.isMutating({ mutationKey }) > 1) return;
            queryClient.invalidateQueries({ queryKey });
            // Solo la vista "Favoritos" del catálogo depende de esta lista
            queryClient.invalidateQueries({
                queryKey: ['store-products', 'catalog'],
                predicate: (q) => q.queryKey.includes('favorites'),
            });
        },
    });

    const isFavorite = (id: string) => favoriteIds.includes(id);

    /** Devuelve el nuevo estado (true = quedó en favoritos). */
    const toggleFavorite = (id: string): boolean => {
        // Desde la caché (no del último render) para que dos toques seguidos se alternen bien
        const add = !(queryClient.getQueryData<string[]>(queryKey) ?? []).includes(id);
        mutation.mutate({ id, add });
        return add;
    };

    return { favoriteIds, isFavorite, toggleFavorite };
}
