/**
 * useAdminPets — Business logic for the admin pets screen
 * Wraps useQuery for fetching all pets, search state, and computed stats
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllPets, Pet } from '@/src/services/mascotas';
import { adminUsersService } from '@/src/services/adminUsers';

export type { Pet };

export function useAdminPets() {
    const [searchText, setSearchText] = useState('');

    const { data: mascotas = [], isLoading, isFetching, refetch } = useQuery({
        queryKey: ['admin-mascotas'],
        queryFn: getAllPets,
    });

    // Nombre del dueño (misma consulta que la pantalla de usuarios; se comparte la caché)
    const { data: users = [] } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => adminUsersService.getUsers(),
    });
    const ownerName = (ownerId: string) => users.find((u) => u.id === ownerId)?.full_name ?? 'Dueño no encontrado';

    const vaccinatedCount = mascotas.filter(m => m.is_vaccinated).length;

    return {
        mascotas,
        isLoading,
        isFetching,
        refetch,
        searchText,
        setSearchText,
        vaccinatedCount,
        ownerName,
    };
}
