/**
 * useClinicsAndVets — Hook for fetching and filtering clinics and vets
 * Extracts data fetching and filtering logic from app/directorio/index.tsx
 */
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClinics, getVets } from '@/src/services/directorio';
import { useAuth } from '@/src/contexts/AuthContext';
import type { Clinic, Vet } from '@/src/types/directorio';

export type DirectorioTab = 'clinics' | 'vets';

export function useClinicsAndVets() {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState<DirectorioTab>('clinics');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterService, setFilterService] = useState('all');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, [user]);

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['directorio-clinics'],
        queryFn: getClinics,
    });

    const { data: vets = [], isLoading: loadingVets } = useQuery({
        queryKey: ['directorio-vets'],
        queryFn: () => getVets(),
    });

    const canRegister = user?.role_name === 'veterinario' || user?.role_name === 'admin';

    const filteredClinics = useMemo(() => {
        return clinics.filter(c => {
            const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.city?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
            const matchesService = filterService === "all"
                || (filterService === "24h" && c.is_24_hours)
                || (filterService === "emergencia" && c.has_emergency);
            return matchesQuery && matchesService;
        });
    }, [clinics, searchQuery, filterService]);

    const filteredVets = useMemo(() => {
        return vets.filter(v => {
            const fullName = `${v.first_name} ${v.last_name}`.toLowerCase();
            return fullName.includes(searchQuery.toLowerCase()) ||
                (v.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        });
    }, [vets, searchQuery]);

    const isLoading = activeTab === 'clinics' ? loadingClinics : loadingVets;
    const currentData = activeTab === 'clinics' ? filteredClinics : filteredVets;
    const resultsCount = currentData.length;

    return {
        // Data
        clinics,
        vets,
        filteredClinics,
        filteredVets,
        currentData,
        resultsCount,

        // Loading
        loadingClinics,
        loadingVets,
        isLoading,

        // Tabs
        activeTab,
        setActiveTab,

        // Search & Filters
        searchQuery,
        setSearchQuery,
        filterService,
        setFilterService,

        // Auth
        canRegister,
        isMounted,
    };
}

export type { Clinic, Vet };
