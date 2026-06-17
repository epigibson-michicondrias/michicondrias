import { useState } from 'react';
import { Linking } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { getMyConsultations, getVetConsultations, bookConsultation, updateConsultationStatus, getClinics, getVets } from '@/src/services/directorio';
import { getUserPets } from '@/src/services/mascotas';
import { showAlert } from '@/src/components/AppAlert';

export function useVideoConsultations() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const isVet = user?.role_name === 'veterinario';

    const [modalVisible, setModalVisible] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    // Form State
    const [selectedPetId, setSelectedPetId] = useState('');
    const [selectedClinicId, setSelectedClinicId] = useState('');
    const [selectedVetId, setSelectedVetId] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [notes, setNotes] = useState('');

    // Query Consultations
    const { data: consultations = [], isLoading } = useQuery({
        queryKey: ['consultations', isVet],
        queryFn: () => isVet ? getVetConsultations() : getMyConsultations(),
        enabled: !!user?.id,
    });

    // Query helper data for booking
    const { data: pets = [] } = useQuery({
        queryKey: ['user-pets', user?.id],
        queryFn: () => user ? getUserPets(user.id) : Promise.resolve([]),
        enabled: !isVet && !!user?.id,
    });

    const { data: clinics = [] } = useQuery({
        queryKey: ['public-clinics'],
        queryFn: getClinics,
        enabled: !isVet,
    });

    const { data: vets = [] } = useQuery({
        queryKey: ['public-vets', selectedClinicId],
        queryFn: () => getVets(selectedClinicId || undefined),
        enabled: !isVet,
    });

    const resetForm = () => {
        setSelectedPetId('');
        setSelectedClinicId('');
        setSelectedVetId('');
        setScheduledAt('');
        setNotes('');
    };

    const handleBook = async () => {
        if (!scheduledAt.trim()) {
            showAlert({ type: 'error', title: 'Error', message: 'La fecha y hora de la consulta es obligatoria.' });
            return;
        }

        setLoadingAction(true);
        try {
            await bookConsultation({
                clinic_id: selectedClinicId || undefined,
                vet_id: selectedVetId || undefined,
                pet_id: selectedPetId || undefined,
                scheduled_at: scheduledAt.trim(),
                notes: notes.trim() || undefined,
            });
            showAlert({ type: 'success', title: 'Éxito', message: 'Tu videoconsulta ha sido reservada.' });
            setModalVisible(false);
            resetForm();
            queryClient.invalidateQueries({ queryKey: ['consultations'] });
        } catch (err: any) {
            showAlert({ type: 'error', title: 'Error', message: err.message || 'No se pudo reservar la consulta.' });
        } finally {
            setLoadingAction(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateConsultationStatus(id, newStatus);
            showAlert({ type: 'success', title: 'Éxito', message: `Videoconsulta marcada como ${newStatus}.` });
            queryClient.invalidateQueries({ queryKey: ['consultations'] });
        } catch (err: any) {
            showAlert({ type: 'error', title: 'Error', message: err.message || 'No se pudo actualizar el estado.' });
        }
    };

    const launchVideoRoom = (url?: string) => {
        if (!url) {
            showAlert({ type: 'info', title: 'No disponible', message: 'La sala de video aún no ha sido creada o iniciada.' });
            return;
        }
        Linking.openURL(url).catch(() => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo abrir el enlace de video.' });
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'scheduled': return '#3b82f6';
            case 'active': return '#10b981';
            case 'completed': return '#8b5cf6';
            case 'cancelled': return '#ef4444';
            default: return '#888';
        }
    };

    const openBookingModal = () => {
        resetForm();
        setModalVisible(true);
    };

    return {
        // State
        modalVisible,
        setModalVisible,
        loadingAction,
        selectedPetId, setSelectedPetId,
        selectedClinicId, setSelectedClinicId,
        selectedVetId, setSelectedVetId,
        scheduledAt, setScheduledAt,
        notes, setNotes,
        // Data
        isVet,
        isLoading,
        consultations,
        pets,
        clinics,
        vets,
        // Actions
        handleBook,
        handleStatusUpdate,
        launchVideoRoom,
        getStatusColor,
        openBookingModal,
    };
}
