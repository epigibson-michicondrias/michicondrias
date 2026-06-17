import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyClinics } from '@/src/services/directorio';
import { getCriticalPatients, getActivePatients, getEmergencyPatients } from '@/src/services/patients';

export type PatientFilter = 'all' | 'critical' | 'active' | 'emergency';

export function usePatients() {
    const [filter, setFilter] = useState<PatientFilter>('all');
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });
    const clinic = clinics[0];

    const { data: allPatients = [], isLoading: loadingAll } = useQuery({
        queryKey: ['critical-patients', clinic?.id],
        queryFn: () => getCriticalPatients(clinic!.id),
        enabled: !!clinic?.id,
        refetchInterval: 30000,
    });

    const { data: activePatients = [] } = useQuery({
        queryKey: ['active-patients', clinic?.id],
        queryFn: () => getActivePatients(clinic!.id),
        enabled: !!clinic?.id && filter === 'active',
        refetchInterval: 30000,
    });

    const { data: emergencyPatients = [] } = useQuery({
        queryKey: ['emergency-patients', clinic?.id],
        queryFn: () => getEmergencyPatients(clinic!.id),
        enabled: !!clinic?.id && filter === 'emergency',
        refetchInterval: 30000,
    });

    const loadingPatients = loadingAll;

    const currentPatients = useMemo(() => {
        switch (filter) {
            case 'active': return activePatients;
            case 'emergency': return emergencyPatients;
            case 'critical': return allPatients.filter(p => p.alertLevel === 'red' || p.alertLevel === 'yellow');
            default: return allPatients;
        }
    }, [filter, allPatients, activePatients, emergencyPatients]);

    const filteredPatients = currentPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.owner.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSearch = () => setShowSearch(!showSearch);

    const filterTabs: { id: PatientFilter; label: string; count: number }[] = [
        { id: 'all', label: 'Todos', count: allPatients.length },
        { id: 'critical', label: 'Críticos', count: allPatients.filter(p => p.alertLevel === 'red' || p.alertLevel === 'yellow').length },
        { id: 'emergency', label: 'Urgencias', count: emergencyPatients.length },
        { id: 'active', label: 'Estables', count: activePatients.length },
    ];

    return {
        // State
        filter,
        setFilter,
        showSearch,
        searchQuery,
        setSearchQuery,
        // Data
        loadingClinics,
        loadingPatients,
        filteredPatients,
        filterTabs,
        // Actions
        toggleSearch,
    };
}
