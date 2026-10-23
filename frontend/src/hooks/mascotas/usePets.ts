/**
 * usePets — lista de mascotas del usuario (página `(app)/mascotas`).
 * Espejo de `mobile/src/hooks/mascotas/usePets.ts`.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPets } from '@/services/mascotas';
import type { Pet } from '@/types/mascotas';

export function usePets() {
    const { user } = useAuth();

    const {
        data: pets = [],
        isLoading,
        isRefetching,
        refetch,
    } = useQuery({
        queryKey: ['user-pets', user?.id],
        queryFn: () => getUserPets(user!.id),
        enabled: !!user?.id,
    });

    return {
        pets,
        isLoading,
        isRefetching,
        refetch,
        isEmpty: pets.length === 0 && !isLoading,
    };
}

export type { Pet };
