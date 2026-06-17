/**
 * useFuneraryProvider — Hook for funerary service providers
 * Handles provider bookings listing and creating new funerary services
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  getProviderBookings,
  createFuneraryService,
  FuneraryBooking,
  FuneraryServiceCreate,
} from '@/src/services/funerary';
import { showAlert } from '@/src/components/AppAlert';

export function useFuneraryProvider() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- Form state for creating services ---
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    cremation_type: 'individual',
    urn_included: false,
  });

  const updateForm = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', cremation_type: 'individual', urn_included: false });
  };

  // --- Queries ---
  const {
    data: providerBookings = [],
    isLoading: isLoadingBookings,
    refetch: refetchBookings,
  } = useQuery<FuneraryBooking[]>({
    queryKey: ['funerary-provider-bookings'],
    queryFn: () => getProviderBookings(),
  });

  // --- Mutations ---
  const createServiceMutation = useMutation({
    mutationFn: (data: FuneraryServiceCreate) => createFuneraryService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funerary-services'] });
      showAlert({
        type: 'success',
        title: '¡Servicio creado!',
        message: 'El servicio funerario ha sido registrado exitosamente.',
        onButtonPress: () => router.back(),
      });
      resetForm();
    },
    onError: () => {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo registrar el servicio. Intenta de nuevo.',
      });
    },
  });

  const handleCreateService = () => {
    if (!form.name.trim() || !form.price) {
      showAlert({
        type: 'error',
        title: 'Datos incompletos',
        message: 'El nombre y precio son obligatorios.',
      });
      return;
    }
    createServiceMutation.mutate({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: parseFloat(form.price),
      cremation_type: form.cremation_type,
      urn_included: form.urn_included,
    });
  };

  return {
    // Form
    form,
    updateForm,
    resetForm,

    // Data
    providerBookings,
    isLoadingBookings,
    refetchBookings,

    // Mutations
    handleCreateService,
    isCreatingService: createServiceMutation.isPending,

    // Navigation
    router,
  };
}
