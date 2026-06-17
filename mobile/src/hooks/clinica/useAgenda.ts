/**
 * useAgenda — Hook for clinic agenda screen
 * Manages clinic appointments, filtering, search, and status actions
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
    getMyClinics,
    getClinicAppointments,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    AppointmentItem,
} from '@/src/services/directorio';
import { showAlert } from '@/src/components/AppAlert';

export function useAgenda() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [filter, setFilter] = useState('all');
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [cancelModal, setCancelModal] = useState<{ visible: boolean; apptId: string | null }>({ visible: false, apptId: null });
    const [cancelReason, setCancelReason] = useState('');

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });

    const clinic = clinics[0];

    const { data: appointments = [], isLoading: loadingAppts, refetch } = useQuery({
        queryKey: ['clinic-appointments-full', clinic?.id],
        queryFn: () => getClinicAppointments(clinic!.id),
        enabled: !!clinic?.id,
    });

    const filtered = useMemo(() => {
        return (filter === 'all' ? appointments : appointments.filter(a => a.status === filter))
            .filter(a =>
                a.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.notes?.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [appointments, filter, searchQuery]);

    const handleConfirm = async (id: string) => {
        setActionLoading(id);
        try {
            await confirmAppointment(id);
            refetch();
        } catch (e) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo confirmar la cita' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleComplete = async (id: string) => {
        setActionLoading(id);
        try {
            await completeAppointment(id);
            refetch();
            queryClient.invalidateQueries({ queryKey: ['clinic-appointments'] });
            router.push(`/mi-clinica/historial/nuevo?appointment_id=${id}` as any);
        } catch (e) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo completar la cita' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancelSubmit = async () => {
        if (!cancelModal.apptId) return;
        setActionLoading(cancelModal.apptId);
        try {
            await cancelAppointment(cancelModal.apptId, cancelReason);
            setCancelModal({ visible: false, apptId: null });
            setCancelReason('');
            refetch();
        } catch (e) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo cancelar la cita' });
        } finally {
            setActionLoading(null);
        }
    };

    const openCancelModal = (apptId: string) => {
        setCancelModal({ visible: true, apptId });
    };

    const closeCancelModal = () => {
        setCancelModal({ visible: false, apptId: null });
    };

    const toggleSearch = () => {
        setShowSearch(!showSearch);
    };

    const goToRecord = (id: string) => {
        router.push(`/mi-clinica/historial/${id}` as any);
    };

    return {
        // Data
        filtered,
        loadingAppts,
        // Filter/Search
        filter,
        setFilter,
        showSearch,
        toggleSearch,
        searchQuery,
        setSearchQuery,
        // Actions
        actionLoading,
        handleConfirm,
        handleComplete,
        handleCancelSubmit,
        // Cancel Modal
        cancelModal,
        cancelReason,
        setCancelReason,
        openCancelModal,
        closeCancelModal,
        // Navigation
        goToRecord,
    };
}
