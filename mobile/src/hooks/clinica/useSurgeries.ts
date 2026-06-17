/**
 * useSurgeries — Hook for clinic surgeries screen
 * Manages surgery list, filtering, search, and creation form
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getMyClinics,
    getClinicSurgeries,
    createSurgery,
    getTodaySurgeries,
    SurgeryItem,
} from '@/src/services/directorio';
import { showAlert } from '@/src/components/AppAlert';

export function useSurgeries() {
    const queryClient = useQueryClient();

    const [filter, setFilter] = useState('all');
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState('');

    // Form State
    const [surgName, setSurgName] = useState('');
    const [surgType, setSurgType] = useState('elective');
    const [surgDate, setSurgDate] = useState('');
    const [surgDuration, setSurgDuration] = useState('60');
    const [surgRoom, setSurgRoom] = useState('OR-1');

    const { data: clinics = [] } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });
    const clinic = clinics[0];

    const { data: surgeries = [], isLoading } = useQuery({
        queryKey: ['clinic-surgeries', clinic?.id],
        queryFn: () => getClinicSurgeries(clinic!.id),
        enabled: !!clinic?.id,
    });

    const { data: todaySurgeries = [], isLoading: todaySurgeriesLoading } = useQuery<SurgeryItem[]>({
        queryKey: ['clinic-surgeries-today', clinic?.id],
        queryFn: () => getTodaySurgeries(clinic!.id),
        enabled: !!clinic?.id,
    });

    const createMutation = useMutation({
        mutationFn: () => createSurgery({
            clinic_id: clinic!.id,
            patient_id: selectedPatientId,
            surgery_name: surgName,
            surgery_type: surgType,
            scheduled_date: surgDate || new Date().toISOString().slice(0, 16),
            estimated_duration_minutes: parseInt(surgDuration) || 60,
            operating_room: surgRoom,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinic-surgeries'] });
            setModalVisible(false);
            setSurgName('');
            setSelectedPatientId('');
            showAlert({ type: 'success', title: 'Éxito', message: 'Cirugía programada correctamente.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo programar la cirugía.' });
        },
    });

    const handleCreate = () => {
        if (!surgName || !surgDate || !selectedPatientId) {
            showAlert({ type: 'warning', title: 'Campos requeridos', message: 'Por favor ingresa el nombre de la cirugía, la fecha y selecciona un paciente.' });
            return;
        }
        createMutation.mutate();
    };

    const filtered = useMemo(() => {
        return (filter === 'all' ? surgeries : surgeries.filter(s => s.status === filter))
            .filter(s =>
                s.surgery_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.operating_room?.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [surgeries, filter, searchQuery]);

    const toggleSearch = () => {
        setShowSearch(!showSearch);
    };

    return {
        // Data
        filtered,
        isLoading,
        todaySurgeries,
        todaySurgeriesLoading,
        // Filter/Search
        filter,
        setFilter,
        showSearch,
        toggleSearch,
        searchQuery,
        setSearchQuery,
        // Modal/Form
        modalVisible,
        setModalVisible,
        selectedPatientId,
        setSelectedPatientId,
        surgName,
        setSurgName,
        surgType,
        setSurgType,
        surgDate,
        setSurgDate,
        surgDuration,
        setSurgDuration,
        surgRoom,
        setSurgRoom,
        // Mutation
        handleCreate,
        isCreating: createMutation.isPending,
    };
}
