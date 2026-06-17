/**
 * useGroomingBooking — Manages the grooming appointment booking flow
 * Handles service selection, pet selection, date/slot picking, and appointment creation
 */
import { useState, useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';
import {
    getActiveServices,
    getAvailableSlots,
    createAppointment,
} from '@/src/services/grooming';
import type { GroomingService, GroomingAppointmentCreate } from '@/src/services/grooming';
import { getUserPets } from '@/src/services/mascotas';
import type { Pet } from '@/src/types/mascotas';

export function useGroomingBooking() {
    const router = useRouter();
    const params = useLocalSearchParams<{ service_id?: string }>();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // ── Selection state ──────────────────────────────────────────
    const [selectedServiceId, setSelectedServiceId] = useState(params.service_id || '');
    const [selectedPetId, setSelectedPetId] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState('');

    // ── Queries ──────────────────────────────────────────────────
    const {
        data: services = [],
        isLoading: servicesLoading,
    } = useQuery<GroomingService[]>({
        queryKey: ['grooming-services'],
        queryFn: () => getActiveServices(),
    });

    const {
        data: pets = [],
        isLoading: petsLoading,
    } = useQuery<Pet[]>({
        queryKey: ['user-pets', user?.id],
        queryFn: () => getUserPets(user!.id),
        enabled: !!user?.id,
    });

    const selectedService = useMemo(
        () => services.find(s => s.id === selectedServiceId),
        [services, selectedServiceId],
    );

    const dateString = useMemo(
        () => selectedDate.toISOString().split('T')[0],
        [selectedDate],
    );

    const groomerId = selectedService?.groomer_id ?? '';

    const {
        data: availableSlots = [],
        isLoading: slotsLoading,
        isFetching: slotsFetching,
    } = useQuery<string[]>({
        queryKey: ['grooming-slots', groomerId, dateString],
        queryFn: () => getAvailableSlots(groomerId, dateString),
        enabled: !!groomerId && !!dateString,
    });

    // ── Mutation ─────────────────────────────────────────────────
    const createMutation = useMutation({
        mutationFn: (data: GroomingAppointmentCreate) => createAppointment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grooming-client-appointments'] });
            showAlert({
                type: 'success',
                title: '¡Cita Agendada!',
                message: 'Tu cita de grooming ha sido programada exitosamente.',
                onButtonPress: () => router.back(),
            });
        },
        onError: () => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'No se pudo agendar la cita. Intenta de nuevo.',
            });
        },
    });

    // ── Validation & submit ──────────────────────────────────────
    const canSubmit =
        !!selectedServiceId && !!selectedPetId && !!selectedSlot && !createMutation.isPending;

    const handleBook = () => {
        if (!selectedServiceId) {
            showAlert({ type: 'error', title: 'Error', message: 'Selecciona un servicio.' });
            return;
        }
        if (!selectedPetId) {
            showAlert({ type: 'error', title: 'Error', message: 'Selecciona una mascota.' });
            return;
        }
        if (!selectedSlot) {
            showAlert({ type: 'error', title: 'Error', message: 'Selecciona un horario disponible.' });
            return;
        }

        createMutation.mutate({
            groomer_id: groomerId,
            pet_id: selectedPetId,
            date: dateString,
            time: selectedSlot,
            service_type: selectedService?.name ?? '',
            status: 'scheduled',
        });
    };

    return {
        // Data
        services,
        pets,
        availableSlots,
        selectedService,
        selectedServiceId,
        selectedPetId,
        selectedDate,
        selectedSlot,
        dateString,

        // Loading
        servicesLoading,
        petsLoading,
        slotsLoading: slotsLoading || slotsFetching,
        isPending: createMutation.isPending,

        // Actions
        setSelectedServiceId,
        setSelectedPetId,
        setSelectedDate,
        setSelectedSlot,
        handleBook,
        canSubmit,
    };
}
