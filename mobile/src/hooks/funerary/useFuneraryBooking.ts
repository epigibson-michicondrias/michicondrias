/**
 * useFuneraryBooking — Hook for booking funerary services
 * Handles listing available services, client bookings, and creating new bookings
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  getActiveFuneraryServices,
  getClientBookings,
  createBooking,
  updateBookingStatus,
  FuneraryService,
  FuneraryBooking,
  FuneraryBookingCreate,
} from '@/src/services/funerary';
import { toISODate } from '@/src/features/salud/format';
import { showAlert } from '@/src/components/AppAlert';

export function useFuneraryBooking() {
  const router = useRouter();
  const params = useLocalSearchParams<{ service_id?: string }>();
  const queryClient = useQueryClient();

  // --- Form state ---
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(params.service_id || null);
  const [form, setForm] = useState<Omit<FuneraryBookingCreate, 'service_id'>>({
    pet_id: '',
    scheduled_date: toISODate(new Date()),
    notes: '',
  });

  const updateForm = (field: keyof Omit<FuneraryBookingCreate, 'service_id'>, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setSelectedServiceId(null);
    setForm({ pet_id: '', scheduled_date: toISODate(new Date()), notes: '' });
  };

  // --- Queries ---
  const {
    data: availableServices = [],
    isLoading: isLoadingServices,
    refetch: refetchServices,
  } = useQuery<FuneraryService[]>({
    queryKey: ['funerary-services-booking'],
    queryFn: () => getActiveFuneraryServices(),
  });

  const {
    data: clientBookings = [],
    isLoading: isLoadingBookings,
    isError: isBookingsError,
    refetch: refetchBookings,
  } = useQuery<FuneraryBooking[]>({
    queryKey: ['funerary-client-bookings'],
    queryFn: () => getClientBookings(),
  });

  // --- Mutations ---
  const bookingMutation = useMutation({
    mutationFn: (data: FuneraryBookingCreate) => createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funerary-client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['funerary-provider-bookings'] });
      showAlert({
        type: 'success',
        title: 'Solicitud enviada',
        message: 'La funeraria recibirá tu reserva y te avisaremos cuando la confirme. Puedes seguirla en Mis Reservas.',
        onButtonPress: () => router.replace('/funeraria/mis-reservas' as any),
      });
      resetForm();
    },
    onError: (e: any) => {
      showAlert({
        type: 'error',
        title: 'No se pudo reservar',
        message: e?.message || 'No se pudo crear la reserva. Intenta de nuevo.',
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => updateBookingStatus(id, 'cancelled'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funerary-client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['funerary-provider-bookings'] });
    },
    onError: (e: any) => {
      showAlert({ type: 'error', title: 'No se pudo cancelar', message: e?.message || 'Intenta de nuevo.' });
    },
  });

  const handleCancel = (id: string) => {
    showAlert({
      type: 'warning',
      title: '¿Cancelar la reserva?',
      message: 'La funeraria será notificada.',
      buttonText: 'Sí, cancelar',
      showCancel: true,
      cancelText: 'Volver',
      onButtonPress: () => cancelMutation.mutate(id),
    });
  };

  const handleBooking = () => {
    if (!selectedServiceId || !form.pet_id || !form.scheduled_date) {
      showAlert({
        type: 'error',
        title: 'Datos incompletos',
        message: 'Selecciona un servicio, tu mascota y la fecha para continuar.',
      });
      return;
    }
    if (form.scheduled_date < toISODate(new Date())) {
      showAlert({ type: 'error', title: 'Fecha inválida', message: 'La fecha no puede estar en el pasado.' });
      return;
    }
    bookingMutation.mutate({
      service_id: selectedServiceId,
      pet_id: form.pet_id,
      scheduled_date: form.scheduled_date,
      notes: form.notes || undefined,
    });
  };

  return {
    // Form
    form,
    updateForm,
    resetForm,
    selectedServiceId,
    setSelectedServiceId,

    // Data
    availableServices,
    clientBookings,
    isLoadingServices,
    isLoadingBookings,
    isBookingsError,
    refetchServices,
    refetchBookings,

    // Mutations
    handleBooking,
    isBooking: bookingMutation.isPending,
    handleCancel,
    isCancelling: cancelMutation.isPending,

    // Navigation
    router,
  };
}
