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
  updateBookingStatus,
  getMyFuneraryServices,
  setFuneraryServiceActive,
  FuneraryService,
  FuneraryBookingStatus,
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
    isError: isBookingsError,
    refetch: refetchBookings,
  } = useQuery<FuneraryBooking[]>({
    queryKey: ['funerary-provider-bookings'],
    queryFn: () => getProviderBookings(),
  });

  const { data: myServices = [], refetch: refetchMyServices } = useQuery<FuneraryService[]>({
    queryKey: ['funerary-my-services'],
    queryFn: () => getMyFuneraryServices(),
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['funerary-provider-bookings'] });
    queryClient.invalidateQueries({ queryKey: ['funerary-client-bookings'] });
    queryClient.invalidateQueries({ queryKey: ['funerary-my-services'] });
    queryClient.invalidateQueries({ queryKey: ['funerary-services'] });
    queryClient.invalidateQueries({ queryKey: ['funerary-services-booking'] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FuneraryBookingStatus }) => updateBookingStatus(id, status),
    onSuccess: invalidateAll,
    onError: (e: any) => showAlert({ type: 'error', title: 'No se pudo actualizar', message: e?.message || 'Intenta de nuevo.' }),
  });

  const activeMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setFuneraryServiceActive(id, active),
    onSuccess: invalidateAll,
    onError: (e: any) => showAlert({ type: 'error', title: 'No se pudo actualizar', message: e?.message || 'Intenta de nuevo.' }),
  });

  // --- Mutations ---
  const createServiceMutation = useMutation({
    mutationFn: (data: FuneraryServiceCreate) => createFuneraryService(data),
    onSuccess: () => {
      invalidateAll();
      showAlert({
        type: 'success',
        title: '¡Servicio creado!',
        message: 'El servicio funerario ha sido registrado exitosamente.',
        onButtonPress: () => router.back(),
      });
      resetForm();
    },
    onError: (e: any) => {
      showAlert({
        type: 'error',
        title: 'No se pudo registrar',
        message: e?.message || 'No se pudo registrar el servicio. Intenta de nuevo.',
      });
    },
  });

  const handleCreateService = () => {
    const price = parseFloat(form.price.replace(',', '.'));
    if (!form.name.trim() || !form.price) {
      showAlert({
        type: 'error',
        title: 'Datos incompletos',
        message: 'El nombre y precio son obligatorios.',
      });
      return;
    }
    if (isNaN(price) || price <= 0) {
      showAlert({ type: 'error', title: 'Precio inválido', message: 'Ingresa un precio mayor a cero.' });
      return;
    }
    createServiceMutation.mutate({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price,
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
    isBookingsError,
    refetchBookings,
    myServices,
    refetchMyServices,
    changeBookingStatus: (id: string, status: FuneraryBookingStatus) => statusMutation.mutate({ id, status }),
    isChangingStatus: statusMutation.isPending,
    toggleServiceActive: (id: string, active: boolean) => activeMutation.mutate({ id, active }),

    // Mutations
    handleCreateService,
    isCreatingService: createServiceMutation.isPending,

    // Navigation
    router,
  };
}
