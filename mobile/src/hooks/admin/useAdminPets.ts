/**
 * useAdminPets — Business logic for the admin pets screen
 * Wraps useQuery for fetching all pets, search state, and computed stats
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllPets, Pet } from '@/src/services/mascotas';

export type { Pet };

export function useAdminPets() {
    const [searchText, setSearchText] = useState('');

    const { data: mascotas = [], isLoading, isFetching, refetch } = useQuery({
        queryKey: ['admin-mascotas'],
        queryFn: getAllPets,
    });

    const vaccinatedCount = mascotas.filter(m => m.is_vaccinated).length;

    return {
        mascotas,
        isLoading,
        isFetching,
        refetch,
        searchText,
        setSearchText,
        vaccinatedCount,
    };
}
