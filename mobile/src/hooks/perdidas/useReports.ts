/**
 * useReports — Hook for fetching and filtering lost pet reports
 * Extracts data fetching and filtering logic from app/perdidas/index.tsx
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReports } from '@/src/services/perdidas';
import { useViewMode } from '@/src/hooks/useViewMode';
import type { LostPetReport } from '@/src/types/perdidas';

/** `resolved` muestra los casos ya reunidos con su familia. */
export type FilterType = 'all' | 'lost' | 'found' | 'resolved';
const VIEW_MODES = ['grid', 'list', 'map'] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

export function useReports() {
    const [viewMode, setViewMode] = useViewMode<ViewMode>('perdidas', VIEW_MODES, 'grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [filterSpecies, setFilterSpecies] = useState('all');

    // Se traen todos los activos y se filtra aquí: así las cifras de las tarjetas no cambian al filtrar
    const { data: reports = [], isLoading, isError, refetch, isRefetching } = useQuery({
        queryKey: ['lost-pet-reports'],
        queryFn: () => getReports(),
    });

    // El listado solo trae reportes activos: los reunidos se cuentan aparte para que la cifra sea real
    const { data: resolvedReports = [], isLoading: isLoadingResolved } = useQuery({
        queryKey: ['lost-pet-resolved'],
        queryFn: () => getReports(undefined, 'resolved'),
    });

    const filteredReports = useMemo(() => {
        const source = filterType === 'resolved' ? resolvedReports : reports;
        return source.filter(r => {
            const matchesType = filterType === 'all' || filterType === 'resolved' || r.report_type === filterType;
            const matchesSpecies = filterSpecies === 'all' || r.species === filterSpecies;
            const matchesSearch = r.pet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.last_seen_location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
            return matchesType && matchesSpecies && matchesSearch;
        });
    }, [reports, resolvedReports, filterType, searchQuery, filterSpecies]);

    const stats = useMemo(() => ({
        lost: reports.filter(r => r.report_type === 'lost' && !r.is_resolved).length,
        found: reports.filter(r => r.report_type === 'found' && !r.is_resolved).length,
        reunited: resolvedReports.length,
    }), [reports, resolvedReports]);

    const mapMarkers = useMemo(() => {
        return filteredReports
            .filter(r => r.latitude != null && r.longitude != null)
            .map((report) => ({
                id: report.id,
                latitude: report.latitude as number,
                longitude: report.longitude as number,
                title: report.pet_name,
                description: report.report_type === 'lost' ? 'Perdida' : 'Encontrada',
                reportType: report.report_type,
            }));
    }, [filteredReports]);

    const toggleFilterSpecies = (key: string) => {
        setFilterSpecies(prev => prev === key ? 'all' : key);
    };

    /** Toca una cifra para filtrar; tocarla de nuevo quita el filtro. */
    const toggleFilterType = (key: FilterType) => {
        setFilterType(prev => prev === key ? 'all' : key);
    };

    const clearFilters = () => {
        setFilterType('all');
        setFilterSpecies('all');
        setSearchQuery('');
    };

    return {
        // Data
        reports,
        filteredReports,
        stats,
        mapMarkers,
        // Con el filtro «Reunidos» la lista sale de la segunda consulta
        isLoading: filterType === 'resolved' ? isLoadingResolved : isLoading,
        isError,
        refetch,
        isRefetching,

        // Filters
        searchQuery,
        setSearchQuery,
        filterType,
        toggleFilterType,
        filterSpecies,
        toggleFilterSpecies,
        clearFilters,

        // View
        viewMode,
        setViewMode,
    };
}

export type { LostPetReport };
