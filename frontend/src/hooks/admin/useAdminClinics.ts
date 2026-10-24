/**
 * useAdminClinics — clínicas del directorio con búsqueda y filtro verificadas / en revisión / suspendidas.
 * Espejo de `mobile/src/hooks/admin/useAdminClinics.ts`. `GET /clinics/` solo trae las aprobadas y no suspendidas,
 * así que se suman las de `GET /clinics/admin/pending` y las suspendidas retenidas en la sesión
 * (`suspendedClinics`) para que el admin no pierda la pista de una clínica al suspenderla.
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClinics, type Clinic } from '@/services/directorio';
import { getPendingClinics } from '@/services/moderacion';
import { getSuspendedSeen } from './suspendedClinics';

export type { Clinic };
export type ClinicFilter = 'all' | 'approved' | 'pending' | 'suspended';

export function useAdminClinics() {
    const [searchText, setSearchText] = useState('');
    const [filter, setFilter] = useState<ClinicFilter>('all');
    const { data: approved = [], isLoading } = useQuery({ queryKey: ['admin-clinics'], queryFn: getClinics });
    const { data: pending = [], isLoading: loadingPending } = useQuery({
        queryKey: ['admin-clinics', 'pending'], // 'pending-clinics' lo usa moderación con otra forma
        queryFn: async () => (await getPendingClinics()) as Clinic[],
    });

    const clinics = useMemo(() => {
        const byId = new Map<string, Clinic>();
        for (const c of getSuspendedSeen()) byId.set(c.id, { ...c, is_suspended: true });
        for (const c of pending) {
            if (!byId.has(c.id)) byId.set(c.id, { ...c, is_approved: false });
        }
        for (const c of approved) byId.set(c.id, { ...c, is_approved: c.is_approved !== false });
        // Suspendidas primero dentro de cada bloque: el admin las busca para reactivarlas.
        return [...byId.values()].sort((a, b) => Number(!!b.is_suspended) - Number(!!a.is_suspended));
    }, [approved, pending]);

    const filtered = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        return clinics.filter(
            (c) =>
                (filter === 'all' ||
                    (filter === 'approved' && c.is_approved !== false && !c.is_suspended) ||
                    (filter === 'pending' && c.is_approved === false) ||
                    (filter === 'suspended' && !!c.is_suspended)) &&
                (!q || `${c.name} ${c.city ?? ''} ${c.address ?? ''}`.toLowerCase().includes(q)),
        );
    }, [clinics, searchText, filter]);

    const approvedCount = clinics.filter((c) => c.is_approved !== false && !c.is_suspended).length;
    const suspendedCount = clinics.filter((c) => !!c.is_suspended).length;

    return {
        clinics: filtered,
        total: clinics.length,
        approvedCount,
        suspendedCount,
        pendingCount: clinics.filter((c) => c.is_approved === false).length,
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
