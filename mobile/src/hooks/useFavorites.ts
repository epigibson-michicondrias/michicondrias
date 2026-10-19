/**
 * useFavorites — Favoritos guardados en el teléfono, por usuario y por ámbito (p. ej. productos de la tienda).
 * Vive en la caché de React Query para que todas las pantallas vean el mismo estado al instante.
 *
 *   const { isFavorite, toggleFavorite, favoriteIds } = useFavorites('productos');
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { readPref, savePref } from '@/src/lib/prefs';

const storageKey = (scope: string, userId: string) => `favorites_${scope}_${userId}`;
/** Tope por ámbito: SecureStore guarda valores chicos (≈ 2 KB) y 40 identificadores caben con holgura. */
const MAX_FAVORITES = 40;

function readFavorites(key: string): string[] {
    try {
        const parsed = JSON.parse(readPref(key) || '[]');
        return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
    } catch {
        return [];
    }
}

export function useFavorites(scope: string) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id ?? 'anon';
    const key = storageKey(scope, userId);
    const queryKey = ['favorites', scope, userId];

    const { data: favoriteIds = [] } = useQuery({
        queryKey,
        queryFn: () => readFavorites(key),
        staleTime: Infinity,
        gcTime: Infinity,
    });

    const isFavorite = (id: string) => favoriteIds.includes(id);

    /** Devuelve el nuevo estado (true = quedó en favoritos). */
    const toggleFavorite = (id: string): boolean => {
        const current = queryClient.getQueryData<string[]>(queryKey) ?? readFavorites(key);
        const next = current.includes(id) ? current.filter((f) => f !== id) : [id, ...current].slice(0, MAX_FAVORITES);
        queryClient.setQueryData(queryKey, next);
        savePref(key, JSON.stringify(next));
        return next.includes(id);
    };

    return { favoriteIds, isFavorite, toggleFavorite };
}
