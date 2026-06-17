/**
 * useBookAppointment — Hook for booking/rescheduling veterinary appointments
 * Manages form state, pet selection, date/time, and submission
 */
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClinic } from '@/src/services/directorio';
import { getUserPets } from '@/src/services/mascotas';
import { createAppointment, getAppointment } from '@/src/services/citas';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';

export function useBookAppointment() {
    const { clinic_id, service_id, reschedule_id, pet_id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [selectedPet, setSelectedPet] = useState<string>(pet_id as string || '');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<Date>(() => {
        const d = new Date();
        d.setHours(9, 0, 0, 0);
        return d;
    });
    const [reason, setReason] = useState('');
    const [isEmergency, setIsEmergency] = useState(false);

    const isRescheduling = !!reschedule_id;

    const { data: clinic, isLoading: clinicLoading } = useQuery({
        queryKey: ['clinic', clinic_id],
        queryFn: () => getClinic(clinic_id as string),
        enabled: !!clinic_id,
    });

    const { data: pets = [], isLoading: petsLoading } = useQuery({
        queryKey: ['user-pets', user?.id],
        queryFn: () => getUserPets(user!.id),
        enabled: !!user?.id,
    });

    const { data: rescheduleAppointment } = useQuery({
        queryKey: ['appointment', reschedule_id],
        queryFn: () => getAppointment(reschedule_id as string),
        enabled: !!reschedule_id,
    });

    useEffect(() => {
        if (rescheduleAppointment) {
            if (rescheduleAppointment.pet_id) setSelectedPet(rescheduleAppointment.pet_id);
            if (rescheduleAppointment.appointment_date) {
                const dateObj = new Date(rescheduleAppointment.appointment_date);
                if (!isNaN(dateObj.getTime())) {
                    setSelectedDate(dateObj);
                    setSelectedTime(dateObj);
                }
            }
            if (rescheduleAppointment.reason) setReason(rescheduleAppointment.reason);
        }
    }, [rescheduleAppointment]);

    const createMutation = useMutation({
        mutationFn: (data: any) => createAppointment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-appointments'] });
            showAlert({
                type: 'success',
                title: isRescheduling ? '¡Cita Reagendada!' : '¡Cita Agendada!',
                message: isRescheduling
                    ? 'Tu cita ha sido reagendada exitosamente. Te contactaremos pronto para confirmar.'
                    : 'Tu cita ha sido programada exitosamente. Te contactaremos pronto para confirmar.',
                onButtonPress: () => router.push('/directorio/citas' as any),
            });
        },
        onError: (error: any) => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: error.message || 'No se pudo agendar la cita. Por favor, intenta nuevamente.',
            });
        },
    });

    const handleAgendar = () => {
        if (!selectedPet) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor selecciona una mascota' });
            return;
        }

        if (!reason.trim()) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor describe el motivo de la cita' });
            return;
        }

        const dateStr = selectedDate.toISOString().split('T')[0];
        const hours = selectedTime.getHours();
        const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        const timeStr = `${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`;

        const appointmentData = {
            clinic_id: clinic_id,
            pet_id: selectedPet,
            service_id: service_id || null,
            appointment_date: `${dateStr} ${timeStr}`,
            reason: reason.trim(),
            is_emergency: isEmergency,
            status: 'scheduled',
        };

        createMutation.mutate(appointmentData);
    };

    const toggleEmergency = () => setIsEmergency(prev => !prev);
    const goBack = () => router.back();

    return {
        // Data
        clinic,
        pets,
        clinicLoading,
        petsLoading,
        isRescheduling,
        selectedPet,
        selectedDate,
        selectedTime,
        reason,
        isEmergency,
        isPending: createMutation.isPending,

        // Actions
        setSelectedPet,
        setSelectedDate,
        setSelectedTime,
        setReason,
        toggleEmergency,
        handleAgendar,
        goBack,
    };
}
