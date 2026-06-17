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
  FuneraryService,
  FuneraryBooking,
  FuneraryBookingCreate,
} from '@/src/services/funerary';
import { showAlert } from '@/src/components/AppAlert';

export function useFuneraryBooking() {
  const router = useRouter();
  const params = useLocalSearchParams<{ service_id?: string }>();
  const queryClient = useQueryClient();

  // --- Form state ---
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(params.service_id || null);
  const [form, setForm] = useState<Omit<FuneraryBookingCreate, 'service_id'>>({
    pet_id: '',
    scheduled_date: '',
    notes: '',
  });

  const updateForm = (field: keyof Omit<FuneraryBookingCreate, 'service_id'>, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setSelectedServiceId(null);
    setForm({ pet_id: '', scheduled_date: '', notes: '' });
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
      showAlert({
        type: 'success',
        title: 'Reserva confirmada',
        message: 'Tu reserva ha sido registrada exitosamente.',
        onButtonPress: () => router.back(),
      });
      resetForm();
    },
    onError: () => {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo crear la reserva. Intenta de nuevo.',
      });
    },
  });

  const handleBooking = () => {
    if (!selectedServiceId || !form.pet_id || !form.scheduled_date) {
      showAlert({
        type: 'error',
        title: 'Datos incompletos',
        message: 'Selecciona un servicio, mascota y fecha para continuar.',
      });
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
    refetchServices,
    refetchBookings,

    // Mutations
    handleBooking,
    isBooking: bookingMutation.isPending,

    // Navigation
    router,
  };
}
