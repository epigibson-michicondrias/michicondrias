/**
 * usePetRecords — Hook for fetching user pets for the carnet/medical records list
 * Extracts data fetching and search logic from app/carnet/index.tsx
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { getUserPets } from '@/src/services/mascotas';
import type { Pet } from '@/src/types/mascotas';

export function usePetRecords() {
    const { user } = useAuth();
    const router = useRouter();
    const [searchId, setSearchId] = useState('');

    const isVetOrAdmin = user?.role_name === 'veterinario' || user?.role_name === 'admin';

    const { data: pets = [], isLoading } = useQuery({
        queryKey: ['my-pets-carnet', user?.id],
        queryFn: () => (user?.id ? getUserPets(user.id) : Promise.resolve([])),
        enabled: !!user?.id,
    });

    const handleSearch = () => {
        if (searchId.trim()) {
            router.push(`/carnet/${searchId.trim()}` as any);
        }
    };

    return {
        // Data
        pets,
        isLoading,

        // Search
        searchId,
        setSearchId,
        handleSearch,

        // Auth
        isVetOrAdmin,
    };
}

export type { Pet };
