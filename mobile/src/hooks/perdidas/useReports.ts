/**
 * useReports — Hook for fetching and filtering lost pet reports
 * Extracts data fetching and filtering logic from app/perdidas/index.tsx
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReports } from '@/src/services/perdidas';
import type { LostPetReport } from '@/src/types/perdidas';

export type FilterType = 'all' | 'lost' | 'found';
export type ViewMode = 'map' | 'list';

export function useReports() {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [filterSpecies, setFilterSpecies] = useState('all');

    const { data: reports = [], isLoading } = useQuery({
        queryKey: ['lost-pet-reports', filterType, filterSpecies],
        queryFn: () => getReports(filterType === 'all' ? undefined : filterType),
    });

    const filteredReports = useMemo(() => {
        return reports.filter(r => {
            const matchesSpecies = filterSpecies === 'all' || r.species === filterSpecies;
            const matchesSearch = r.pet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.last_seen_location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
            return matchesSpecies && matchesSearch;
        });
    }, [reports, searchQuery, filterSpecies]);

    const stats = useMemo(() => ({
        lost: reports.filter(r => r.report_type === 'lost' && !r.is_resolved).length,
        found: reports.filter(r => r.report_type === 'found' && !r.is_resolved).length,
        reunited: reports.filter(r => r.is_resolved).length,
    }), [reports]);

    const mapMarkers = useMemo(() => {
        return filteredReports
            .filter(r => r.latitude && r.longitude)
            .map((report) => ({
                id: report.id,
                latitude: report.latitude || 19.4326,
                longitude: report.longitude || -99.1332,
                title: report.pet_name,
                description: report.report_type === 'lost' ? 'Perdida' : 'Encontrada',
                reportType: report.report_type,
            }));
    }, [filteredReports]);

    const toggleFilterSpecies = (key: string) => {
        setFilterSpecies(prev => prev === key ? 'all' : key);
    };

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'map' ? 'list' : 'map');
    };

    return {
        // Data
        reports,
        filteredReports,
        stats,
        mapMarkers,
        isLoading,

        // Filters
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        filterSpecies,
        toggleFilterSpecies,

        // View
        viewMode,
        toggleViewMode,
    };
}

export type { LostPetReport };
