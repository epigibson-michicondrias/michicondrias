/**
 * usePets — Hook for fetching user's pets list
 * Extracts data fetching logic from app/mascotas/index.tsx
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { getUserPets } from '@/src/services/mascotas';
import type { Pet } from '@/src/types/mascotas';

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
