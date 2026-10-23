/**
 * useReports — listado y filtros de reportes de mascotas perdidas/encontradas.
 * Espejo de `mobile/src/hooks/perdidas/useReports.ts` (sin modo mapa: la web no porta el mapa).
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReports } from '@/services/perdidas';
import type { LostPetReport } from '@/types/perdidas';

/** `resolved` muestra los casos ya reunidos con su familia. */
export type FilterType = 'all' | 'lost' | 'found' | 'resolved';

export function useReports() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [filterSpecies, setFilterSpecies] = useState('all');

    // Se traen todos los activos y se filtra aquí: así las cifras no cambian al filtrar
    const {
        data: reports = [],
        isLoading,
        isError,
        refetch,
        isRefetching,
    } = useQuery({
        queryKey: ['lost-pet-reports'],
        queryFn: () => getReports(),
    });

    // El listado solo trae reportes activos: los reunidos se cuentan aparte para que la cifra sea real
    const {
        data: resolvedReports = [],
        isLoading: isLoadingResolved,
    } = useQuery({
        queryKey: ['lost-pet-resolved'],
        queryFn: () => getReports(undefined, 'resolved'),
    });

    const filteredReports = useMemo(() => {
        const source = filterType === 'resolved' ? resolvedReports : reports;
        return source.filter((r) => {
            const matchesType = filterType === 'all' || filterType === 'resolved' || r.report_type === filterType;
            const matchesSpecies = filterSpecies === 'all' || r.species === filterSpecies;
            const q = searchQuery.trim().toLowerCase();
            const matchesSearch =
                !q ||
                r.pet_name.toLowerCase().includes(q) ||
                (r.last_seen_location?.toLowerCase().includes(q) ?? false);
            return matchesType && matchesSpecies && matchesSearch;
        });
    }, [reports, resolvedReports, filterType, filterSpecies, searchQuery]);

    const stats = useMemo(
        () => ({
            lost: reports.filter((r) => r.report_type === 'lost' && !r.is_resolved).length,
            found: reports.filter((r) => r.report_type === 'found' && !r.is_resolved).length,
            reunited: resolvedReports.length,
        }),
        [reports, resolvedReports],
    );

    /** Toca una cifra para filtrar; tocarla de nuevo quita el filtro. */
    const toggleFilterType = (key: FilterType) => {
        setFilterType((prev) => (prev === key ? 'all' : key));
    };

    const toggleFilterSpecies = (key: string) => {
        setFilterSpecies((prev) => (prev === key ? 'all' : key));
    };

    const clearFilters = () => {
        setFilterType('all');
        setFilterSpecies('all');
        setSearchQuery('');
    };

    return {
        reports,
        filteredReports,
        stats,
        // Con el filtro «Reunidos» la lista sale de la segunda consulta
        isLoading: filterType === 'resolved' ? isLoadingResolved : isLoading,
        isError,
        refetch,
        isRefetching,

        searchQuery,
        setSearchQuery,
        filterType,
        toggleFilterType,
        filterSpecies,
        toggleFilterSpecies,
        clearFilters,
    };
}

export type { LostPetReport };
