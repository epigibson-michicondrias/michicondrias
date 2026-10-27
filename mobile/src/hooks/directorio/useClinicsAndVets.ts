/**
 * useClinicsAndVets — Hook for fetching and filtering clinics and vets
 * Doctoralia-style filters: specialty, location, rating, services.
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
    const [filterSpecialty, setFilterSpecialty] = useState('all');
    const [filterCity, setFilterCity] = useState('all');
    const [filterRating, setFilterRating] = useState('all');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, [user]);

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['directorio-clinics'],
        queryFn: getClinics,
    });

    const { data: vets = [], isLoading: loadingVets } = useQuery({
        queryKey: ['directorio-vets'],
        queryFn: () => getVets(),
    });

    const canRegister = ['veterinario', 'hospital', 'admin'].includes(user?.role_name || '');

    // Especialidades únicas para el filtro
    const specialties = useMemo(() => {
        const set = new Set<string>();
        vets.forEach((v) => { if (v.specialty) set.add(v.specialty); });
        return ['all', ...Array.from(set).sort()];
    }, [vets]);

    // Ciudades únicas para el filtro
    const cities = useMemo(() => {
        const set = new Set<string>();
        clinics.forEach((c) => { if (c.city) set.add(c.city); });
        return ['all', ...Array.from(set).sort()];
    }, [clinics]);

    const filteredClinics = useMemo(() => {
        return clinics.filter((c) => {
            const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.city?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                (c.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
            const matchesService = filterService === 'all'
                || (filterService === '24h' && c.is_24_hours)
                || (filterService === 'emergencia' && c.has_emergency);
            const matchesCity = filterCity === 'all' || c.city === filterCity;
            return matchesQuery && matchesService && matchesCity;
        });
    }, [clinics, searchQuery, filterService, filterCity]);

    const filteredVets = useMemo(() => {
        return vets.filter((v) => {
            const fullName = `${v.first_name} ${v.last_name}`.toLowerCase();
            const matchesQuery = fullName.includes(searchQuery.toLowerCase()) ||
                (v.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
            const matchesSpecialty = filterSpecialty === 'all' || v.specialty === filterSpecialty;
            return matchesQuery && matchesSpecialty;
        });
    }, [vets, searchQuery, filterSpecialty]);

    const isLoading = activeTab === 'clinics' ? loadingClinics : loadingVets;
    const currentData = activeTab === 'clinics' ? filteredClinics : filteredVets;
    const resultsCount = currentData.length;
    const hasActiveFilters = filterService !== 'all' || filterSpecialty !== 'all' || filterCity !== 'all' || filterRating !== 'all' || searchQuery.length > 0;

    const clearFilters = () => {
        setSearchQuery('');
        setFilterService('all');
        setFilterSpecialty('all');
        setFilterCity('all');
        setFilterRating('all');
    };

    return {
        // Data
        clinics, vets, filteredClinics, filteredVets, currentData, resultsCount,

        // Loading
        loadingClinics, loadingVets, isLoading,

        // Tabs
        activeTab, setActiveTab,

        // Search & Filters
        searchQuery, setSearchQuery,
        filterService, setFilterService,
        filterSpecialty, setFilterSpecialty,
        filterCity, setFilterCity,
        filterRating, setFilterRating,
        specialties, cities,
        hasActiveFilters,
        clearFilters,

        // Auth
        canRegister, isMounted,
    };
}

export type { Clinic, Vet };
