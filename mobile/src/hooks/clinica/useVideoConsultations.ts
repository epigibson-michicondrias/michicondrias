import { useState } from 'react';
import { Linking } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { getMyConsultations, getVetConsultations, bookConsultation, updateConsultationStatus, getClinics, getVets } from '@/src/services/directorio';
import { getUserPets } from '@/src/services/mascotas';
import { showAlert } from '@/src/components/AppAlert';

const STATUS_ACTION_LABEL: Record<string, string> = { active: 'iniciada', completed: 'finalizada', cancelled: 'cancelada' };

export function useVideoConsultations() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const isVet = ['veterinario', 'clinica', 'hospital'].includes(user?.role_name || '');

    const [modalVisible, setModalVisible] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    // Form State
    const [selectedPetId, setSelectedPetId] = useState('');
    const [selectedClinicId, setSelectedClinicId] = useState('');
    const [selectedVetId, setSelectedVetId] = useState('');
    const defaultDate = () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); return d; };
    const [scheduledAt, setScheduledAt] = useState<Date>(defaultDate);
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
        setScheduledAt(defaultDate());
        setNotes('');
    };

    const handleBook = async () => {
        if (!selectedPetId) {
            showAlert({ type: 'error', title: 'Falta la mascota', message: 'Elige la mascota que será atendida.' });
            return;
        }
        if (scheduledAt.getTime() <= Date.now()) {
            showAlert({ type: 'error', title: 'Fecha inválida', message: 'La videoconsulta debe programarse en una fecha y hora futuras.' });
            return;
        }

        setLoadingAction(true);
        try {
            await bookConsultation({
                clinic_id: selectedClinicId || undefined,
                vet_id: selectedVetId || undefined,
                pet_id: selectedPetId || undefined,
                scheduled_at: scheduledAt.toISOString(),
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
            showAlert({ type: 'success', title: 'Éxito', message: `Videoconsulta ${STATUS_ACTION_LABEL[newStatus] || 'actualizada'}.` });
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
        openBookingModal,
    };
}
