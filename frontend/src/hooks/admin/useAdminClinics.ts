/**
 * useAdminClinics — clínicas del directorio con búsqueda y filtro verificadas / en revisión.
 * Espejo de `mobile/src/hooks/admin/useAdminClinics.ts`.
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClinics, type Clinic } from '@/services/directorio';

export type { Clinic };
export type ClinicFilter = 'all' | 'approved' | 'pending';

export function useAdminClinics() {
    const [searchText, setSearchText] = useState('');
    const [filter, setFilter] = useState<ClinicFilter>('all');
    const { data: clinics = [], isLoading } = useQuery({ queryKey: ['admin-clinics'], queryFn: getClinics });

    const filtered = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        return clinics.filter(
            (c) =>
                (filter === 'all' || (filter === 'approved' ? c.is_approved : !c.is_approved)) &&
                (!q || `${c.name} ${c.city ?? ''} ${c.address ?? ''}`.toLowerCase().includes(q)),
        );
    }, [clinics, searchText, filter]);

    return {
        clinics: filtered,
        total: clinics.length,
        approvedCount: clinics.filter((c) => c.is_approved).length,
        isLoading,
        searchText,
        setSearchText,
        filter,
        setFilter,
    };
}
