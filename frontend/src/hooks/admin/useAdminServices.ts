/**
 * useAdminServices — catálogo global de servicios de clínicas, con búsqueda por nombre o categoría.
 * Espejo de `mobile/src/hooks/admin/useAdminServices.ts` (allí el buscador no filtraba).
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllServices, getClinics, type ClinicServiceItem } from '@/services/directorio';

export type { ClinicServiceItem };

export function useAdminServices() {
    const [searchText, setSearchText] = useState('');
    const { data: servicios = [], isLoading } = useQuery({ queryKey: ['admin-services'], queryFn: getAllServices });
    // Nombres de clínica (misma caché que la lista de clínicas del admin; solo trae las aprobadas)
    const { data: clinics = [] } = useQuery({ queryKey: ['admin-clinics'], queryFn: getClinics });
    const clinicName = (clinicId: string) => clinics.find((c) => c.id === clinicId)?.name ?? null;

    const filtered = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        return q ? servicios.filter((s) => `${s.name} ${s.category ?? ''}`.toLowerCase().includes(q)) : servicios;
    }, [servicios, searchText]);

    return {
        servicios: filtered,
        total: servicios.length,
        isLoading,
        searchText,
        setSearchText,
        clinicName,
        activeCount: servicios.filter((s) => s.is_active).length,
        categoryCount: new Set(servicios.map((s) => s.category?.trim().toLowerCase()).filter(Boolean)).size,
    };
}
