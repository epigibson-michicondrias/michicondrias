/**
 * useAdminClinics — clínicas del directorio con búsqueda y filtro verificadas / en revisión.
 * Espejo de `mobile/src/hooks/admin/useAdminClinics.ts`. `GET /clinics/` solo trae las aprobadas, así que se suman
 * las de `GET /clinics/admin/pending` para que el filtro "En revisión" muestre algo real.
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClinics, type Clinic } from '@/services/directorio';
import { getPendingClinics } from '@/services/moderacion';

export type { Clinic };
export type ClinicFilter = 'all' | 'approved' | 'pending';

export function useAdminClinics() {
    const [searchText, setSearchText] = useState('');
    const [filter, setFilter] = useState<ClinicFilter>('all');
    const { data: approved = [], isLoading } = useQuery({ queryKey: ['admin-clinics'], queryFn: getClinics });
    const { data: pending = [], isLoading: loadingPending } = useQuery({
        queryKey: ['admin-clinics', 'pending'], // 'pending-clinics' lo usa moderación con otra forma
        queryFn: async () => (await getPendingClinics()) as Clinic[],
    });

    const clinics = useMemo(() => {
        const seen = new Set(approved.map((c) => c.id));
        return [...pending.filter((c) => !seen.has(c.id)).map((c) => ({ ...c, is_approved: false })), ...approved];
    }, [approved, pending]);

    const filtered = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        return clinics.filter(
            (c) =>
                (filter === 'all' || (filter === 'approved' ? c.is_approved !== false : c.is_approved === false)) &&
                (!q || `${c.name} ${c.city ?? ''} ${c.address ?? ''}`.toLowerCase().includes(q)),
        );
    }, [clinics, searchText, filter]);

    const approvedCount = clinics.filter((c) => c.is_approved !== false).length;

    return {
        clinics: filtered,
        total: clinics.length,
        approvedCount,
        pendingCount: clinics.length - approvedCount,
        isLoading: isLoading || loadingPending,
        searchText,
        setSearchText,
        filter,
        setFilter,
        filtering: !!searchText.trim() || filter !== 'all',
        clearFilters: () => {
            setSearchText('');
            setFilter('all');
        },
    };
}
