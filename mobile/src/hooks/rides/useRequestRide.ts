/**
 * useRequestRide — Hook for ride request screen
 * Manages form state, pet/driver selection, fare estimation, and ride creation
 */
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { getUserPets } from '@/src/services/mascotas';
import {
  getAvailableDrivers,
  estimateFare,
  requestRide,
} from '@/src/services/rides';
import type { Pet } from '@/src/types/mascotas';
import type {
  DriverProfile,
  PetRideCreate,
  RideEstimateOut,
  RideEstimateRequest,
} from '@/src/services/rides';
import { showAlert } from '@/src/components/AppAlert';

export interface RideFormData {
  origin_address: string;
  destination_address: string;
  pet_id: string;
  driver_id: string;
  requires_carrier: boolean;
}

const FORM_DEFAULTS: RideFormData = {
  origin_address: '',
  destination_address: '',
  pet_id: '',
  driver_id: '',
  requires_carrier: false,
};

export function useRequestRide() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<RideFormData>(FORM_DEFAULTS);
  const [estimate, setEstimate] = useState<RideEstimateOut | null>(null);

  // Fetch user's pets
  const { data: pets = [], isLoading: petsLoading } = useQuery<Pet[]>({
    queryKey: ['user-pets-ride', user?.id],
    queryFn: () => (user ? getUserPets(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  // Fetch available drivers
  const { data: drivers = [], isLoading: driversLoading } = useQuery<DriverProfile[]>({
    queryKey: ['available-drivers-ride'],
    queryFn: () => getAvailableDrivers(),
  });

  // Fare estimation mutation
  const estimateMutation = useMutation({
    mutationFn: (data: RideEstimateRequest) => estimateFare(data),
    onSuccess: (data) => {
      setEstimate(data);
    },
    onError: () => {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo calcular la tarifa estimada.',
      });
    },
  });

  // Request ride mutation
  const requestMutation = useMutation({
    mutationFn: (data: PetRideCreate) => requestRide(data),
    onSuccess: () => {
      showAlert({
        type: 'success',
        title: '¡Viaje Solicitado!',
        message: 'Tu solicitud de transporte ha sido enviada exitosamente.',
        onButtonPress: () => router.back(),
      });
    },
    onError: () => {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo solicitar el transporte. Intenta de nuevo.',
      });
    },
  });

  const updateForm = (updates: Partial<RideFormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleEstimate = () => {
    // Use placeholder coordinates for address-based estimation
    estimateMutation.mutate({
      origin_lat: 19.4326,
      origin_lng: -99.1332,
      destination_lat: 19.4260,
      destination_lng: -99.1678,
      requires_carrier: form.requires_carrier,
    });
  };

  const handleSubmit = () => {
    if (!form.driver_id || !form.pet_id || !form.origin_address || !form.destination_address) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Por favor completa todos los campos obligatorios.',
      });
      return;
    }

    requestMutation.mutate({
      driver_id: form.driver_id,
      pet_id: form.pet_id,
      origin_address: form.origin_address,
      destination_address: form.destination_address,
      price: estimate?.estimated_fare,
      requires_carrier: form.requires_carrier,
    });
  };

  return {
    // Form state
    form,
    updateForm,
    estimate,

    // Data
    pets,
    drivers,
    isLoading: petsLoading || driversLoading,

    // Actions
    handleEstimate,
    handleSubmit,
    isEstimating: estimateMutation.isPending,
    isSubmitting: requestMutation.isPending,

    // Navigation
    router,
  };
}
