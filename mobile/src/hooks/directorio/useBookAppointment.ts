/**
 * useBookAppointment — Hook for booking/rescheduling veterinary appointments
 * Flujo: mascota -> servicio -> fecha -> horario disponible (del backend) -> motivo -> confirmar.
 */
import { useState, useEffect, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClinic, getClinicServices, getAvailableSlots, rescheduleAppointment } from '@/src/services/directorio';
import { getUserPets } from '@/src/services/mascotas';
import { createAppointment, getAppointment } from '@/src/services/citas';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';

/** YYYY-MM-DD en hora local (toISOString usa UTC y de noche cambiaría de día). */
export function toLocalYMD(d: Date): string {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
}

export function useBookAppointment() {
    const { clinic_id, service_id, reschedule_id, pet_id } = useLocalSearchParams<{
        clinic_id: string;
        service_id?: string;
        reschedule_id?: string;
        pet_id?: string;
    }>();
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [selectedPet, setSelectedPet] = useState<string>(pet_id || '');
    const [selectedService, setSelectedService] = useState<string>(service_id || '');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string>('');
    const [reason, setReason] = useState('');
    const [isEmergency, setIsEmergency] = useState(false);

    const isRescheduling = !!reschedule_id;

    const { data: clinic, isLoading: clinicLoading, isError: clinicError, refetch: refetchClinic } = useQuery({
        queryKey: ['clinic', clinic_id],
        queryFn: () => getClinic(clinic_id as string),
        enabled: !!clinic_id,
    });

    const { data: services = [], isLoading: servicesLoading } = useQuery({
        queryKey: ['clinic-services', clinic_id],
        queryFn: () => getClinicServices(clinic_id as string),
        enabled: !!clinic_id,
    });
    const activeServices = useMemo(() => services.filter((s) => s.is_active !== false), [services]);

    const { data: pets = [], isLoading: petsLoading } = useQuery({
        queryKey: ['user-pets', user?.id],
        queryFn: () => getUserPets(user!.id),
        enabled: !!user?.id,
    });

    const { data: rescheduleAppointmentData } = useQuery({
        queryKey: ['appointment', reschedule_id],
        queryFn: () => getAppointment(reschedule_id as string),
        enabled: !!reschedule_id,
    });

    // Si la clínica ofrece un solo servicio, se elige solo
    useEffect(() => {
        if (!selectedService && activeServices.length === 1) setSelectedService(activeServices[0].id);
    }, [activeServices, selectedService]);

    // Mascota única: preseleccionada
    useEffect(() => {
        if (!selectedPet && !isRescheduling && pets.length === 1) setSelectedPet(pets[0].id);
    }, [pets, selectedPet, isRescheduling]);

    useEffect(() => {
        if (rescheduleAppointmentData) {
            if (rescheduleAppointmentData.pet_id) setSelectedPet(rescheduleAppointmentData.pet_id);
            if (rescheduleAppointmentData.service_id) setSelectedService(rescheduleAppointmentData.service_id);
            if (rescheduleAppointmentData.reason) setReason(rescheduleAppointmentData.reason);
        }
    }, [rescheduleAppointmentData]);

    const dateStr = toLocalYMD(selectedDate);

    const { data: slots = [], isLoading: slotsLoading, isError: slotsError, refetch: refetchSlots } = useQuery({
        queryKey: ['clinic-slots', clinic_id, dateStr, selectedService],
        queryFn: () => getAvailableSlots(clinic_id as string, dateStr, selectedService),
        enabled: !!clinic_id && !!selectedService,
    });

    // Al cambiar de fecha o servicio, el horario elegido deja de ser válido
    useEffect(() => {
        setSelectedSlot('');
    }, [dateStr, selectedService]);

    const mutation = useMutation({
        mutationFn: async () => {
            if (isRescheduling) {
                return rescheduleAppointment(reschedule_id as string, dateStr, selectedSlot);
            }
            return createAppointment({
                clinic_id: clinic_id as string,
                pet_id: selectedPet,
                service_id: selectedService,
                date: dateStr,
                start_time: selectedSlot,
                reason: reason.trim(),
                is_emergency: isEmergency,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-appointments'] });
            queryClient.invalidateQueries({ queryKey: ['my-directorio-appointments'] });
            queryClient.invalidateQueries({ queryKey: ['appointment'] });
            queryClient.invalidateQueries({ queryKey: ['clinic-slots'] });
            showAlert({
                type: 'success',
                title: isRescheduling ? '¡Cita reagendada!' : '¡Cita agendada!',
                message: 'La clínica confirmará tu cita pronto. Puedes verla en Mis Citas.',
                onButtonPress: () => router.replace('/directorio/citas' as any),
            });
        },
        onError: (error: any) => {
            // 409: el horario se ocupó mientras elegías; se refrescan los disponibles
            queryClient.invalidateQueries({ queryKey: ['clinic-slots'] });
            showAlert({
                type: 'error',
                title: 'No se pudo agendar',
                message: error?.message || 'Por favor, intenta nuevamente.',
            });
        },
    });

    const handleAgendar = () => {
        if (!isRescheduling && !selectedPet) {
            showAlert({ type: 'error', title: 'Falta la mascota', message: 'Selecciona a tu mascota.' });
            return;
        }
        if (!selectedService) {
            showAlert({ type: 'error', title: 'Falta el servicio', message: 'Elige el servicio que necesitas.' });
            return;
        }
        if (!selectedSlot) {
            showAlert({ type: 'error', title: 'Falta el horario', message: 'Elige uno de los horarios disponibles.' });
            return;
        }
        if (!isRescheduling && !reason.trim()) {
            showAlert({ type: 'error', title: 'Falta el motivo', message: 'Describe brevemente el motivo de la cita.' });
            return;
        }
        mutation.mutate();
    };

    const toggleEmergency = () => setIsEmergency((prev) => !prev);
    const goBack = () => router.back();

    return {
        // Data
        clinic,
        pets,
        services: activeServices,
        slots,
        clinicLoading,
        clinicError,
        refetchClinic,
        petsLoading,
        servicesLoading,
        slotsLoading,
        slotsError,
        refetchSlots,
        isRescheduling,
        selectedPet,
        selectedService,
        selectedDate,
        selectedSlot,
        reason,
        isEmergency,
        isPending: mutation.isPending,

        // Actions
        setSelectedPet,
        setSelectedService,
        setSelectedDate,
        setSelectedSlot,
        setReason,
        toggleEmergency,
        handleAgendar,
        goBack,
    };
}
