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
    updateSurgeryStatus,
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
    const defaultDate = () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d; };
    const [surgDate, setSurgDate] = useState<Date>(defaultDate);
    const [surgDuration, setSurgDuration] = useState('60');
    const [surgRoom, setSurgRoom] = useState('');

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
            surgery_name: surgName.trim(),
            surgery_type: surgType,
            scheduled_date: surgDate.toISOString(),
            estimated_duration: parseInt(surgDuration) || 60,
            operating_room: surgRoom.trim() || undefined,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinic-surgeries'] });
            queryClient.invalidateQueries({ queryKey: ['clinic-surgeries-today'] });
            queryClient.invalidateQueries({ queryKey: ['clinic-metrics'] });
            setModalVisible(false);
            setSurgName('');
            setSelectedPatientId('');
            setSurgDate(defaultDate());
            setSurgRoom('');
            showAlert({ type: 'success', title: 'Éxito', message: 'Cirugía programada correctamente.' });
        },
        onError: (e: any) => {
            showAlert({ type: 'error', title: 'Error', message: e?.message || 'No se pudo programar la cirugía.' });
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateSurgeryStatus(clinic!.id, id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinic-surgeries'] });
            queryClient.invalidateQueries({ queryKey: ['clinic-surgeries-today'] });
            queryClient.invalidateQueries({ queryKey: ['clinic-metrics'] });
        },
        onError: (e: any) => {
            showAlert({ type: 'error', title: 'No se pudo actualizar', message: e?.message || 'Intenta de nuevo.' });
        },
    });

    const handleCreate = () => {
        if (!surgName.trim() || !selectedPatientId) {
            showAlert({ type: 'warning', title: 'Campos requeridos', message: 'Escribe el nombre del procedimiento y selecciona un paciente.' });
            return;
        }
        if (surgDate.getTime() <= Date.now()) {
            showAlert({ type: 'warning', title: 'Fecha inválida', message: 'La cirugía debe programarse en una fecha y hora futuras.' });
            return;
        }
        const dur = parseInt(surgDuration, 10);
        if (!Number.isFinite(dur) || dur <= 0) {
            showAlert({ type: 'warning', title: 'Duración inválida', message: 'Indica una duración estimada en minutos.' });
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
        changeStatus: (id: string, status: string) => statusMutation.mutate({ id, status }),
        isChangingStatus: statusMutation.isPending,
    };
}
