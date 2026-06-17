/**
 * useAdminServices — Business logic for the admin services screen
 * Manages service listing and search
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllServices, ClinicServiceItem } from '@/src/services/directorio';

export type { ClinicServiceItem };

export function useAdminServices() {
    const [searchText, setSearchText] = useState('');

    const { data: servicios = [], isLoading, refetch } = useQuery({
        queryKey: ['admin-services'],
        queryFn: getAllServices,
    });

    const activeCount = servicios.filter(s => s.is_active).length;
    const categoryCount = new Set(servicios.map(s => s.category).filter(Boolean)).size;

    return {
        servicios,
        isLoading,
        refetch,
        searchText,
        setSearchText,
        activeCount,
        categoryCount,
    };
}
